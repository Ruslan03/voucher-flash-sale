---
name: nextjs-fdd-clean-architecture
description: >-
  Define feature structure, layer boundaries, port/adapter contracts, DI wiring, and shared
  Atomic Design components in Next.js App Router. Use when scaffolding or implementing
  features and reusable UI. Does not authorize unsolicited products or design systems.
---

# Next.js FDD & Clean Architecture: Structural Blueprint

This skill defines the **technical folder structure, layer contracts, and coding conventions** for Next.js applications using Feature-Driven Development (FDD) and Clean Architecture (Ports & Adapters / Hexagonal).

It is **100% domain-agnostic and product-agnostic**. It is designed as an architectural contract so that developers and other AI agents can consistently create, navigate, implement, edit, and enhance features without structural ambiguity.

## Scope and repository reference

- **FDD:** organize each business feature as a vertical slice under `src/features/<feature>/`.
- **Clean Architecture:** separate domain rules, application workflows, adapters, and presentation; keep business logic independent of React, Next.js, and concrete data sources.
- **Atomic Design:** compose UI primitives into reusable combinations. It describes UI composition, not business layers.
- Use [`src/features/voucher`](../../../src/features/voucher) as the repository reference for feature folders, naming, repository ports, injected use cases, and controller/result conventions. Inspect the relevant files before adding a feature; do not copy its voucher-specific rules or mock behavior into other features.
- Create only the layers needed by the request. A static presentation page does not require empty domain, use-case, repository, or controller files.
- For implementation requests, follow this skill's structural rules and the requested UI/behavior. The skeleton/starter restrictions below apply to scaffolding requests; they do not replace an explicitly requested product screen with a developer starter screen.

---

## ⛔ CRITICAL DIRECTIVE FOR AI AGENTS

> [!CAUTION]
> ### STRUCTURE & STARTER INFO SCREEN ONLY — DO NOT INVENT FINISHED PRODUCTS
> 1. **STARTER SCREEN LIKE FRESH NEXT.JS**: When generating an initial UI page for a newly scaffolded project or feature, generate ONLY a simple, clean **developer informational starter screen** (similar to the default page on a fresh `create-next-app` install) explaining:
>    - The architectural layers (`domain/`, `use-cases/`, `infrastructure/`, `controllers/`, `composition/`).
>    - Where the developer should start editing to add business rules and UI.
>    - Showing active entity connection status to prove end-to-end wiring.
> 2. **NO UNSOLICITED PRODUCT LOGIC OR COMPLEX UI**: Do NOT make up complete business products, fake stores, vouchers, checkout carts, or elaborate design systems unless the user explicitly provides a detailed product/UI brief.
> 3. **GENERATE SKELETONS ONLY**: When asked to scaffold or create a structure, generate ONLY:
>    - Folder layout
>    - Entity type definitions
>    - Repository / Port interfaces
>    - Use case function signatures
>    - Adapter stubs implementing the ports
>    - Controller / Server Action adapter signatures returning `ActionResult<T>`
>    - Composition Root (`registry.ts`) wiring
>    - Simple informational developer starter screen (`<Feature>Page`)
> 4. **MODULAR & EXTENSIBLE**: The goal is to provide a clean architectural skeleton so the user or another AI prompt can implement, edit, enhance, or test specific layers in subsequent steps.

---

## 1. Directory Structure Blueprint (Agnostic)

Use this hierarchy for the layers required by the feature:

```text
src/
├── app/                                  # Framework Routing Entrypoints (Next.js App Router)
│   ├── api/                              # Route Handlers (HTTP REST endpoints)
│   │   └── <resource>/route.ts           # Thin adapter calling Controller / Use Case
│   ├── layout.tsx                        # Root layout wrapping global Providers
│   └── <feature-route>/                  # Route page folder
│       └── page.tsx                      # Thin routing shell: extracts params, calls FeaturePage
│
├── composition/                          # Composition Root (Dependency Injection)
│   ├── registry.ts                       # Pure DI Factory Registry (wires Adapters to Ports)
│   └── store/                            # (Optional) Global Client State composition
│
├── features/                             # Feature-Driven Vertical Slices
│   └── <feature-name>/                   # Isolated feature boundary
│       ├── domain/                       # Pure domain entities, value types & error classes
│       │   ├── <entity>.ts               # Type definitions & pure business invariants
│       │   └── <entity>.test.ts          # Pure unit tests (no frameworks/mocks)
│       ├── use-cases/                    # Application business rules & Port contracts
│       │   ├── <entity>-repository.ts    # Port Interface (contract for data access)
│       │   └── <action>.ts               # Use case function (accepts port as parameter)
│       ├── infrastructure/               # Concrete adapters implementing use-case ports
│       │   ├── in-memory-<entity>-repo.ts# InMemory/Mock adapter (for dev/tests)
│       │   └── api-<entity>-repo.ts      # Real HTTP / Database adapter
│       ├── controllers/                  # Interface adapters
│       │   └── <feature>-controller.ts   # Server Actions ('use server') & route adapters
│       └── presentation/                 # Presentation entrypoint
│           ├── components/              # Feature UI with colocated *.module.css
│           └── pages/
│               ├── <feature>-page.tsx    # Structural container (Server Component)
│               └── <feature>-page.module.css # Page-owned styles
│
└── shared/                               # Cross-cutting reusable technical capabilities
    ├── domain/
    │   ├── result.ts                     # Standardized ActionResult<T> DTO pattern
    │   └── domain-event-bus.ts           # Decoupled async pub/sub event bus
    ├── infrastructure/
    │   └── http/
    │       └── http-client.ts            # Centralized fetch wrapper (error handling & timeout)
    └── presentation/
        ├── components/                  # All shared Atomic Design components live here
        │   ├── atoms/                   # Button, Input, Icon, Badge
        │   ├── molecules/               # FormField, PhoneNumberField, VoucherPreview
        │   ├── organisms/               # Optional reusable multi-part UI sections
        │   └── templates/               # Optional reusable page layouts with slots
        ├── assets/                      # Shared fonts and other presentation assets
        └── README.md                    # Usage and component conventions
```

The shared `components/` wrapper is the target convention. If existing code uses `shared/presentation/atoms/` or `molecules/` directly, do not add another competing structure. Migrate existing components only when the requested scope includes it, updating imports, relative font/CSS paths, tests, and documentation together. Updating this skill alone does not authorize migrating application code.

---

## 2. Layer Rules & Dependency Direction

Dependencies MUST always point strictly inward:

```text
[ Presentation / App ] ───▶ [ Controllers ] ───▶ [ Use Cases ] ───▶ [ Domain ]
                                                      ▲
[ Infrastructure ] ───────────────────────────────────┘ (Implements Port Interface)
```

| Layer | Responsibility | Allowed Imports | Forbidden Imports |
|---|---|---|---|
| **`domain/`** | Entity types, invariants, custom domain errors | Pure TS utils, `@/shared/domain` | React, Next.js, HTTP clients, DB drivers, infrastructure, controllers |
| **`use-cases/`** | Application workflows & **Port Interfaces** | `domain/`, Port interfaces, `@/shared/domain` | React, Next.js, concrete infrastructure classes, controllers |
| **`infrastructure/`** | Concrete adapters implementing ports | Port interfaces, `domain/`, `@/shared/infrastructure` | React, Next.js App Router, controllers, UI components |
| **`controllers/`** | Adapting requests to use cases (Server Actions) | Use Cases, Domain, `@/composition/registry`, `result.ts` | Raw DB queries, UI presentation components |
| **Feature `presentation/`** | Feature pages, UI composition and interaction state | Shared presentation, domain types, controller actions; server pages may compose reads as described below | Concrete infrastructure, direct HTTP/DB access; server-only imports in client components |
| **Shared `presentation/`** | Reusable UI without feature orchestration | React, shared presentation components/assets, shared design tokens | Features, controllers, composition, data fetching and business workflows |
| **`composition/`** | Instantiating infra and binding to use case ports | Infrastructure, Use Cases (Ports) | Controllers, presentation, app router pages (avoid circular dependencies) |
| **`app/`** | Next.js route entrypoint shell | Presentation pages, Controllers | Direct DB queries, business domain logic |

### 2.1 Server reads and client interactions

- A Server Component page may resolve a repository through `composition/registry.ts` and call a read use case, following `voucher/presentation/pages/voucher-page.tsx`. This is server-side orchestration, not permission to import a concrete adapter or implement business rules in the page.
- Mutations and requests needing `ActionResult` error mapping go through controllers. Controllers resolve dependencies, call use cases, and adapt results/revalidation; use cases own workflows.
- Client components use props and controller actions. Keep registry, secrets, concrete adapters, and server-only modules out of client imports. Add `use client` only where interaction/state needs it.
- Feature-specific validation rules, API calls, price calculations, and state orchestration stay in the feature. A shared input may display an error supplied by its caller; it does not decide business validity.

### 2.2 Atomic Design placement and composition

| Level | Responsibility | Repository examples / placement |
|---|---|---|
| **Atoms** | Small UI primitives; native HTML props and accessible defaults | `components/atoms/button.tsx`, `input.tsx`, `icon.tsx`, `badge.tsx` |
| **Molecules** | A small combination of atoms solving one UI task | `components/molecules/form-field.tsx`, `phone-number-field.tsx`, `voucher-preview.tsx` |
| **Organisms** | A cohesive reusable section composed from atoms/molecules | `components/organisms/`, only when such a shared section exists |
| **Templates** | Reusable layout structure accepting content through props/slots | `components/templates/`, only when needed by multiple pages |
| **Pages** | Concrete feature composition, content, and orchestration | `features/<feature>/presentation/pages/`, never shared Atomic Design pages |

- Atoms may compose other atoms; molecules compose atoms; organisms compose atoms/molecules; templates compose reusable sections. Avoid circular imports or dependencies from lower levels into higher levels.
- Keep UI tied to a particular feature in `features/<feature>/presentation/components/`. Promote it to shared when it has a clear reusable presentation contract, not merely because it is JSX.
- Do not create empty levels or generic component frameworks. Reuse the current primitives before adding variants or extracting a new abstraction.
- Import directly from the component file, e.g. `@/shared/presentation/components/atoms/button`. Keep local assets under shared presentation; shared components must not import fonts or styles from a feature.
- Reuse existing CSS tokens and native React element props, including accessibility attributes and refs where applicable. Keep `id`, label, hint, and error associations intact. Icons are decorative by default and need an accessible label when conveying standalone meaning.
### 2.3 Presentation styling: colocated CSS Modules

- Every styled presentation slice (atom, molecule, organism, template, feature component, or page) owns a colocated `<file-name>.module.css`. Import it as `styles` and use `className={styles.className}`.
- Put layout, typography, colors, spacing, responsive rules, animations, and visual states in that module. Do not use JSX `style={{ ... }}`, inline CSS custom properties, `<style>` tags, utility classes, or component-specific global CSS as substitutes.
- A routing shell or composition with no owned styles does not need an empty module. When slicing a styled component into a separate file, move its owned rules into its own module; do not depend on the parent's private module.
- Reserve `app/globals.css` for tokens, font foundations, and base/reset rules. Consume existing tokens through `var(--...)` in modules rather than duplicating their values.
- Use module classes or `data-*` attributes for finite variants and states, e.g. `.button[data-variant='primary']` and `.input[aria-invalid='true']`. For computed values, prefer native attributes such as `<progress value={value} max={max} className={styles.progress} />` over inline styles. Surface a styling constraint before introducing an exception.
- Shared components may accept `className` from the caller's CSS Module. Do not import feature modules into shared components or target child internals with broad/global selectors. Shared assets remain under `shared/presentation/assets/`.
- Preserve keyboard focus, disabled/error states, responsive behavior, and reduced-motion preferences in the owning module. Font classes generated by `next/font` can be combined with module classes.
- Verify that the installed styling pipeline preserves CSS Module class exports. If a loader strips module scoping, report or fix the pipeline within the authorized scope; do not silently fall back to global classes.
- Existing global/inline-styled presentation code requires a scoped migration. Updating this skill does not itself authorize changing application code.

```text
src/shared/presentation/components/atoms/
├── button.tsx
└── button.module.css
src/features/<feature>/presentation/components/
├── promotion-panel.tsx
└── promotion-panel.module.css
src/features/<feature>/presentation/pages/
├── <feature>-page.tsx
└── <feature>-page.module.css
```

---

## 3. How to Write Code in Each Layer (Signatures & Contracts)

### 3.1 Domain Layer (`features/<feature>/domain/<entity>.ts`)
- Write pure TypeScript interfaces and types.
- Export domain error classes extending `Error`.
- Include pure invariant validation functions (no I/O, no async).

```typescript
export type EntityId = string

export interface Entity {
  id: EntityId
  name: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export class EntityRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EntityRuleError'
  }
}

export function validateEntity(entity: Entity): void {
  if (!entity.name || entity.name.trim().length === 0) {
    throw new EntityRuleError('Entity name is required.')
  }
}
```

### 3.2 Use Case Layer (`features/<feature>/use-cases/`)
- **Port Interface (`<entity>-repository.ts`)**: Defines what data access methods the application requires.
- **Use Case Interactor (`<action>.ts`)**: Pure async function taking the repository port as its first parameter (Dependency Inversion).

```typescript
// 1. Port Interface (<entity>-repository.ts)
import type { Entity, EntityId } from '../domain/<entity>'

export interface EntityRepository {
  findById(id: EntityId): Promise<Entity | null>
  findAll(): Promise<Entity[]>
  save(entity: Entity): Promise<void>
  delete(id: EntityId): Promise<void>
}

// 2. Use Case Function (get-<entity>.ts)
export class EntityNotFoundError extends Error {
  constructor(id: string) {
    super(`Entity "${id}" not found.`)
    this.name = 'EntityNotFoundError'
  }
}

export async function getEntityById(
  repo: EntityRepository,
  id: EntityId
): Promise<Entity> {
  const entity = await repo.findById(id)
  if (!entity) {
    throw new EntityNotFoundError(id)
  }
  return entity
}
```

### 3.3 Infrastructure Layer (`features/<feature>/infrastructure/`)
- Concrete class implementing the Port Interface.
- One fast `in-memory` stub for testing/mocking, and one real adapter (`api` or `database`).

```typescript
import type { Entity, EntityId } from '../domain/<entity>'
import type { EntityRepository } from '../use-cases/<entity>-repository'

export class InMemoryEntityRepository implements EntityRepository {
  private items: Entity[] = []

  constructor(initialData: Entity[] = []) {
    this.items = [...initialData]
  }

  async findById(id: EntityId): Promise<Entity | null> {
    return this.items.find((i) => i.id === id) ?? null
  }

  async findAll(): Promise<Entity[]> {
    return [...this.items]
  }

  async save(entity: Entity): Promise<void> {
    const index = this.items.findIndex((i) => i.id === entity.id)
    if (index >= 0) this.items[index] = entity
    else this.items.push(entity)
  }

  async delete(id: EntityId): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id)
  }
}
```

### 3.4 Composition Root (`src/composition/registry.ts`)
- Instantiates the concrete adapter and returns it typed as the Port Interface.

```typescript
import type { EntityRepository } from '@/features/<feature>/use-cases/<entity>-repository'
import { InMemoryEntityRepository } from '@/features/<feature>/infrastructure/in-memory-<entity>-repository'
import { ApiEntityRepository } from '@/features/<feature>/infrastructure/api-<entity>-repository'

export function createEntityRepository(): EntityRepository {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
    return new InMemoryEntityRepository()
  }
  return new ApiEntityRepository()
}
```

### 3.5 Controller Layer (`features/<feature>/controllers/`)
- Thin adapter (`'use server'`).
- Resolves repository via Composition Root, executes use case, catches errors, and returns `ActionResult<T>`.

```typescript
'use server'

import { createEntityRepository } from '@/composition/registry'
import { getEntityById, EntityNotFoundError } from '../use-cases/get-<entity>'
import { type ActionResult, successResult, failureResult } from '@/shared/domain/result'
import type { Entity } from '../domain/<entity>'

export async function getEntityAction(id: string): Promise<ActionResult<Entity>> {
  try {
    const repo = createEntityRepository()
    const data = await getEntityById(repo, id)
    return successResult(data)
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return failureResult(error.message, 'NOT_FOUND')
    }
    const message = error instanceof Error ? error.message : 'Internal error'
    return failureResult(message, 'INTERNAL_ERROR')
  }
}
```

### 3.6 Presentation Starter Page (`features/<feature>/presentation/pages/`)
- This starter applies to scaffolding only. Implement requested screens with the same boundaries; do not copy starter content into product pages.
- Use a Server Component and a colocated CSS Module. Show the layers and where to edit code, without speculative product widgets or external UI dependencies.

```tsx
// <feature>-page.tsx
import { createEntityRepository } from '@/composition/registry'
import { getEntityById } from '../../use-cases/get-<entity>'
import styles from './<feature>-page.module.css'

interface FeaturePageProps { id?: string }

const layers = [
  ['Domain', 'Entity types and invariants in domain/.'],
  ['Use Cases', 'Workflows and ports in use-cases/.'],
  ['Infrastructure', 'Concrete adapters in infrastructure/.'],
  ['Controllers', 'Server Actions and result mapping in controllers/.'],
]

export async function FeaturePage({ id = 'default' }: FeaturePageProps) {
  const data = await getEntityById(createEntityRepository(), id)
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Feature ready: {data.name}</h1>
        <p>Add business rules and UI in the corresponding layers.</p>
        <div className={styles.layers}>
          {layers.map(([name, description]) => (
            <section key={name} className={styles.layer}>
              <h2>{name}</h2>
              <p>{description}</p>
            </section>
          ))}
        </div>
        <p className={styles.status}>Entity status: {data.status}</p>
      </div>
    </main>
  )
}
```

```css
/* <feature>-page.module.css */
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: var(--surface-muted);
  color: var(--secondary-navy);
}
.content { width: 100%; max-width: 40rem; }
.title { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
.layers { display: grid; gap: 1rem; margin: 1.5rem 0; }
.layer { padding: 1rem; border: 1px solid var(--border-default); border-radius: var(--radius-lg); }
.layer h2 { font-weight: 700; margin-bottom: .5rem; }
.status { color: var(--neutral-core); }
@media (min-width: 40rem) { .layers { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```

### 3.7 Routing Shell (`src/app/<route>/page.tsx`)
- Thin wrapper delegating to the Feature Page.

```tsx
import { FeaturePage } from '@/features/<feature>/presentation/pages/<feature>-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <FeaturePage id={id} />
}
```

---

## 4. Guide for Other AIs: How to Build & Enhance Iteratively

When an AI assistant is tasked with creating, enhancing, or modifying code within this structure:

### Phase 1: Structural Scaffolding
- When asked to "create feature structure", "scaffold", or "setup architecture":
  - Run or mimic `scripts/create-feature.mjs`.
  - Create only the contracts (Domain models, Port interfaces, Use Case stubs, Adapter skeletons, Registry function).
  - Stop and inform the user that the architectural skeleton is ready for business logic and UI requirements.

### Phase 2: Implementing Business Logic
- When the user provides business rules:
  - Add domain rules to `domain/<entity>.ts` and domain tests.
  - Implement application logic inside `use-cases/<action>.ts` and use-case tests.
  - Implement real persistence in `infrastructure/`.

### Phase 3: Implementing UI (Only When Briefed)
- When the user provides UI requirements or wireframes:
  - Add presentational components inside `presentation/components/`.
  - Connect user interactions via controllers / Server Actions (`presentation/pages/`).
  - Reuse shared atoms/molecules from `shared/presentation/components/`; keep feature-specific compositions in the feature.

### Architecture verification
- Confirm styled presentation slices have colocated CSS Modules, no inline or utility-class styling, and no new component rules in global CSS. Check module exports, responsive layout, focus/error states, and reduced motion.
- Check new imports against the layer table, including server/client boundaries and the server-read exception.
- Confirm shared Atomic Design components use the `components/` wrapper and do not depend on features. Record any pre-existing paths that remain outside a migration's scope.
- Run behavior tests for business/interaction changes and the relevant lint/typecheck/build scripts. Verify visual-only changes visually when possible; report unavailable browser checks.
- When moving components, check all import callers, relative assets/CSS, tests, README examples, and `/design-system` usage snippets. Do not equate a green build with verified visual parity or real backend integration.

---

## 5. Automation Scaffolder

To generate a clean technical skeleton without any unsolicited UI or dummy styling:
```bash
node .agents/skills/nextjs-fdd-clean-architecture/scripts/create-feature.mjs <feature-name> [entity-name]
```

Inspect generated presentation output before using it. If the scaffolder emits inline styles, replace them with a colocated CSS Module following section 2.3; generated output does not override the styling contract.
