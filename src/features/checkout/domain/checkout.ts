export type PaymentMethod = 'midtrans' | 'xendit'
export interface CheckoutOrder {
  mode: 'preview'; id: string; orderId: string; reservationId: string
  voucher: { id: string; name: string; category: string; faceValue: number; price: number }
  discount: number; fee: number; method: PaymentMethod | null
  status: 'checkout' | 'pending' | 'success' | 'failed'
  createdAt: string; fetchedAt: string; expiresAt: string; virtualAccount: string | null
}
export class CheckoutError extends Error { constructor(public readonly code: string, message: string) { super(message); this.name = 'CheckoutError' } }
export function assertCheckout(value: unknown): asserts value is CheckoutOrder {
  const fail = () => { throw new CheckoutError('INVALID_DATA', 'Data checkout tidak valid.') }
  if (!value || typeof value !== 'object') return fail()
  const order = value as CheckoutOrder
  const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0
  const money = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0
  const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))
  if (order.mode !== 'preview' || !text(order.id) || !text(order.orderId) || !text(order.reservationId) ||
      !order.voucher || !text(order.voucher.id) || !text(order.voucher.name) || !text(order.voucher.category) ||
      !money(order.voucher.price) || !money(order.voucher.faceValue) || order.voucher.faceValue < order.voucher.price ||
      !money(order.discount) || order.discount > order.voucher.price || !money(order.fee) ||
      !['checkout', 'pending', 'success', 'failed'].includes(order.status) ||
      (order.method !== null && !['midtrans', 'xendit'].includes(order.method)) ||
      (order.status !== 'checkout' && (!order.method || !text(order.virtualAccount))) ||
      !date(order.createdAt) || !date(order.fetchedAt) || !date(order.expiresAt) || Date.parse(order.expiresAt) <= Date.parse(order.createdAt)) return fail()
}
export function checkoutTotal(order: CheckoutOrder): number { return order.voucher.price - order.discount + order.fee }
export function checkoutState(order: CheckoutOrder, now: number): CheckoutOrder['status'] | 'expired' {
  return order.status === 'success' ? 'success' : now >= Date.parse(order.expiresAt) ? 'expired' : order.status
}
