# Agnostic Code Examples & Patterns

This reference provides complete, ready-to-use agnostic implementations of essential Clean Architecture patterns.

---

## 1. Standardized Result Type (`src/shared/domain/result.ts`)

```typescript
/**
 * Result DTO pattern for robust error handling without throwing uncaught exceptions across layers.
 */
export type ActionResult<T = void> =
  | { success: true; data: T; result?: T }
  | { success: false; error: { code: string; message: string } | string }

export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data, result: data }
}

export function failureResult<T = void>(
  message: string,
  code: string = 'UNKNOWN_ERROR'
): ActionResult<T> {
  return { success: false, error: { code, message } }
}
```

---

## 2. Shared HTTP Client Wrapper (`src/shared/infrastructure/http/http-client.ts`)

```typescript
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string
  ) {
    super(`HTTP ${status} ${statusText} — ${url}`)
    this.name = 'HttpError'
  }
}

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number
  body?: unknown
}

async function request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
  const { timeout = 10_000, body, headers, ...rest } = options

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  })

  if (!res.ok) {
    throw new HttpError(res.status, res.statusText, url)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const httpClient = {
  get: <T>(url: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PUT', body }),
  patch: <T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'PATCH', body }),
  delete: <T>(url: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(url, { ...options, method: 'DELETE' }),
}
```

---

## 3. In-Memory Domain Event Bus (`src/shared/domain/domain-event-bus.ts`)

```typescript
export interface DomainEvent {
  eventName: string
  occurredOn: Date
}

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T
) => Promise<void> | void

class InMemoryDomainEventBus {
  private handlers: Map<string, DomainEventHandler[]> = new Map()

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: DomainEventHandler<T>
  ): void {
    const existing = this.handlers.get(eventName) ?? []
    this.handlers.set(eventName, [...existing, handler as DomainEventHandler])
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? []
    await Promise.all(
      handlers.map((handler) =>
        Promise.resolve(handler(event)).catch((err) =>
          console.error(`[EventBus] Error handling event ${event.eventName}:`, err)
        )
      )
    )
  }

  clear(): void {
    this.handlers.clear()
  }
}

export const domainEventBus = new InMemoryDomainEventBus()
```

---

## 4. Next.js Client Form with Server Action Integration

```tsx
'use client'

import { useActionState } from 'react'
import { submitEntityController } from '@/features/<feature>/controllers/<feature>-controller'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Input } from '@/shared/presentation/components/atoms/input'
import { Alert } from '@/shared/presentation/components/atoms/alert'

export function EntityForm() {
  const [state, formAction, isPending] = useActionState(submitEntityController, {
    success: false,
  })

  return (
    <form action={formAction} className="space-y-4">
      {!state.success && state.error && (
        <Alert variant="destructive">
          {typeof state.error === 'string' ? state.error : state.error.message}
        </Alert>
      )}

      {state.success && (
        <Alert variant="success">Successfully saved!</Alert>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input name="title" required disabled={isPending} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Submit'}
      </Button>
    </form>
  )
}
```
