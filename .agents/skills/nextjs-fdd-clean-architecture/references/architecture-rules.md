# Architecture Rules & Boundary Enforcement

This document specifies the strict architectural constraints, rules, and best practices for projects built using **Feature-Driven Development (FDD) & Clean Architecture** with Next.js App Router.

---

## 1. The Core Dependency Rule

> **Source code dependencies must point only inward, toward higher-level policies.**
> Nothing in an inner circle can know anything at all about something in an outer circle.

```text
[ Presentation ] ──┐
                   ▼
[ Controllers ] ──▶ [ Use Cases / Application ] ──▶ [ Domain ]
                   ▲
[ Infrastructure ] ─┘
```

- **Domain** knows nothing of Use Cases, Infrastructure, Controllers, or Presentation.
- **Use Cases** know only Domain and Port interfaces defined within Use Cases or Domain. They know nothing of React, Next.js, or concrete database/HTTP implementations.
- **Infrastructure** knows only Use Case Ports and Domain. It implements the contracts.
- **Controllers** know Use Cases and Domain. They translate incoming transport protocols (HTTP requests, Next.js FormData) into use case parameters.
- **Presentation** knows Domain (data structures) and templates/components. It renders data and triggers controllers/server actions.
- **Composition Root** is the single allowed meeting ground where concrete infrastructure classes are paired with use case ports.

---

## 2. Directory Matrix & Responsibilities

| Directory | Layer | Allowed Imports | Forbidden Imports | Pure TS / Framework |
|---|---|---|---|---|
| `src/features/<feat>/domain/` | Domain | Pure TS utils, `@/shared/domain`, `@/shared/lib` | React, Next.js, HTTP clients, DB drivers, infrastructure, controllers | Pure TypeScript |
| `src/features/<feat>/use-cases/` | Application | Domain, Port interfaces, `@/shared/domain` | React, Next.js, `fetch`, concrete infra classes, controllers | Pure TypeScript |
| `src/features/<feat>/infrastructure/`| Infrastructure | Use Case Ports, Domain, `@/shared/infrastructure`, HTTP/DB libraries | React, Next.js App Router, controllers, UI components | Pure TypeScript |
| `src/features/<feat>/controllers/` | Interface Adapter | Use Cases, Domain, `@/composition/registry`, `@/shared/domain/result` | UI components, raw DB queries | Next.js Server Actions (`'use server'`) or pure functions |
| `src/features/<feat>/presentation/`| Presentation | Domain types, Controller actions, Shared UI components | Raw database queries, low-level HTTP clients | React / TSX |
| `src/composition/` | Composition Root | Everything needed to wire dependencies | App Router pages | Pure TS & React Provider |
| `src/app/` | Routing Entrypoint | Feature pages, Controllers, Composition Providers | Direct business logic, direct DB queries | Next.js App Router |

---

## 3. Communication Patterns

### 3.1 Next.js Server Component (Data Fetching / Read Flow)
```text
App Router (src/app/<route>/page.tsx)
  │ (passes route params)
  ▼
Feature Page (src/features/<feat>/presentation/pages/<feat>-page.tsx) [Server Component]
  │ (calls Composition Root)
  ▼
Composition Root (src/composition/registry.ts)
  │ (returns concrete Repo satisfying Port)
  ▼
Use Case (src/features/<feat>/use-cases/<action>.ts)
  │ (queries data via Port Interface)
  ▼
Infrastructure Adapter (src/features/<feat>/infrastructure/<impl>.ts)
  │ (fetches DB / API)
  ▼
Returns Entity to Feature Page ──▶ Renders Template + Components
```

### 3.2 Next.js Server Actions (Mutation Flow)
```text
Client Form Component ('use client')
  │ (calls Server Action via useActionState or transition)
  ▼
Controller (src/features/<feat>/controllers/<feat>-controller.ts) ['use server']
  │ (parses FormData, validates input structure)
  │ (resolves Repo from composition registry)
  ▼
Use Case (src/features/<feat>/use-cases/<action>.ts)
  │ (executes business rules & calls repo/external port)
  ▼
Returns ActionResult<T> to Client Form
```

### 3.3 Decoupled Cross-Feature Communication (Event Bus)
When Feature A needs to trigger an action in Feature B asynchronously without tight coupling:
- Do NOT directly import Feature B's internal use case into Feature A.
- Instead, publish a `DomainEvent` through `@/shared/domain/domain-event-bus`.
- Feature B subscribes to the domain event during startup or bootstrap.

---

## 4. Anti-Patterns & Common Traps

| Trap | Why it's harmful | Correct Approach |
|---|---|---|
| **Putting `fetch()` inside a React Component** | Tightly couples presentation to backend network details; untestable without browser/mocks. | Put `fetch()` in `infrastructure/`, wrap in a repository method, call via use case. |
| **Importing `create...Repository` inside a Use Case** | Violates Dependency Inversion; the use case becomes tightly coupled to the composition root. | Pass the repository port as a parameter to the use case function: `runUseCase(repo, input)`. |
| **Putting business validation only in HTML/Client Forms** | Business rules can be bypassed via direct HTTP calls; UI validation is only for UX. | Put invariant rules in `domain/` and execution checks in `use-cases/`. |
| **Framework imports in Domain** | `import { useRouter } from 'next/navigation'` or React hooks inside domain makes domain untestable and non-portable. | Domain must remain 100% pure TypeScript. |
| **Fat Server Actions** | Writing 100 lines of business calculations inside `'use server'` functions makes testing difficult. | Keep Server Actions to < 20 lines: parse input -> call registry -> execute use case -> return `ActionResult<T>`. |
