---
name: nextjs-fdd-clean-architecture
description: >-
  Technical architectural blueprint and scaffolding guide for Feature-Driven Development (FDD)
  and Clean Architecture (Ports & Adapters) in Next.js (App Router). Enforces layer boundaries,
  port/adapter contracts, and pure DI wiring. STRICTLY focuses on technical structure and code
  conventions; PROHIBITS generating unsolicited finished UI products or unprompted design systems.
---

# Next.js FDD & Clean Architecture: Structural Blueprint

This skill defines the **technical folder structure, layer contracts, and coding conventions** for Next.js applications using Feature-Driven Development (FDD) and Clean Architecture (Ports & Adapters / Hexagonal).

It is **100% domain-agnostic and product-agnostic**. It is designed as an architectural contract so that developers and other AI agents can consistently create, navigate, implement, edit, and enhance features without structural ambiguity.

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

Every project and feature MUST adhere to this directory hierarchy:

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
│           └── pages/
│               └── <feature>-page.tsx    # Structural container (Server Component)
│
└── shared/                               # Cross-cutting reusable technical capabilities
    ├── domain/
    │   ├── result.ts                     # Standardized ActionResult<T> DTO pattern
    │   └── domain-event-bus.ts           # Decoupled async pub/sub event bus
    └── infrastructure/
        └── http/
            └── http-client.ts            # Centralized fetch wrapper (error handling & timeout)
```

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
| **`presentation/`** | Structural view container | Domain types, Controller actions | Raw DB queries, HTTP clients, internal infra |
| **`composition/`** | Instantiating infra and binding to use case ports | Infrastructure, Use Cases (Ports), Controllers | App router pages |
| **`app/`** | Next.js route entrypoint shell | Presentation pages, Controllers | Direct DB queries, business domain logic |

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
- Server Component. Renders an informative developer starter screen (similar to a fresh `create-next-app` install) explaining the layers and where to edit code.
- Zero external UI dependencies (pure inline styling or basic CSS).
- NO speculative business products (no carts, no checkout, no dummy shop widgets).

```tsx
import { createEntityRepository } from '@/composition/registry'
import { getEntityById } from '../../use-cases/get-<entity>'

interface FeaturePageProps {
  id?: string
}

export async function FeaturePage({ id = 'default' }: FeaturePageProps) {
  const repo = createEntityRepository()
  const data = await getEntityById(repo, id)

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1.5rem',
      backgroundColor: '#0a0a0a',
      color: '#ededed',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.85rem',
          color: '#a1a1aa',
          marginBottom: '1.25rem'
        }}>
          <span>⚡</span>
          <span>Clean Architecture &bull; Feature Ready</span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 0.75rem', letterSpacing: '-0.025em' }}>
          Feature <span style={{ color: '#38bdf8' }}>{data.title}</span>
        </h1>

        <p style={{ fontSize: '1rem', color: '#a1a1aa', margin: '0 0 2rem', lineHeight: 1.5 }}>
          Kerangka arsitektur terpasang. Gunakan petunjuk di bawah untuk mengimplementasikan logika bisnis dan UI.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          textAlign: 'left',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>1. Domain</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Atur entity model &amp; aturan bisnis di <code>domain/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>2. Use Cases</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Definisikan kontrak port &amp; use case di <code>use-cases/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>3. Infrastructure</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Implementasi API / Database adapters di <code>infrastructure/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>4. Controllers</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Server Actions penghubung UI di <code>controllers/</code>
            </p>
          </div>
        </div>

        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#71717a' }}>
          Status Entity: <strong style={{ color: '#34d399' }}>{data.status}</strong> &bull; Title: <code>{data.title}</code>
        </div>
      </div>
    </main>
  )
}
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

---

## 5. Automation Scaffolder

To generate a clean technical skeleton without any unsolicited UI or dummy styling:
```bash
node .agents/skills/nextjs-fdd-clean-architecture/scripts/create-feature.mjs <feature-name> [entity-name]
```
