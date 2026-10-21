/**
 * SHARED DOMAIN LAYER — In-Memory Domain Event Bus
 * Facilitates decoupled communication between bounded contexts.
 */

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
