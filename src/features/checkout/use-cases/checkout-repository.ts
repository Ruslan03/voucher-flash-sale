import type { CheckoutOrder, PaymentMethod } from '../domain/checkout'
/** Frontend port only. Backend/gateway endpoints are not yet agreed. */
export interface CheckoutRepository {
  load(id: string): Promise<CheckoutOrder | null>
  start(id: string, method: PaymentMethod): Promise<CheckoutOrder>
  check(id: string): Promise<CheckoutOrder>
}
