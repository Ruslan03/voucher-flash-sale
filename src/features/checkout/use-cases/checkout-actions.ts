import { assertCheckout, checkoutState, CheckoutError, type CheckoutOrder, type PaymentMethod } from '../domain/checkout'
import type { CheckoutRepository } from './checkout-repository'
export async function loadCheckout(repo: CheckoutRepository, id: string): Promise<CheckoutOrder> {
  if (!/^[a-z0-9-]{1,60}$/.test(id)) throw new CheckoutError('INVALID_ID', 'ID checkout tidak valid.')
  const order = await repo.load(id)
  if (!order) throw new CheckoutError('NOT_FOUND', 'Pesanan tidak ditemukan.')
  assertCheckout(order)
  if (order.id !== id) throw new CheckoutError('INVALID_DATA', 'Data checkout tidak valid.')
  return order
}
export async function startCheckout(repo: CheckoutRepository, id: string, method: PaymentMethod, now: number): Promise<CheckoutOrder> {
  if (!['midtrans', 'xendit'].includes(method)) throw new CheckoutError('INVALID_METHOD', 'Pilih metode pembayaran yang tersedia.')
  const order = await loadCheckout(repo, id), state = checkoutState(order, now)
  if (state === 'expired') throw new CheckoutError('EXPIRED', 'Waktu pembayaran habis.')
  if (state !== 'checkout' && state !== 'failed') throw new CheckoutError('NOT_AVAILABLE', 'Pesanan sudah diproses.')
  const next = await repo.start(id, method)
  assertCheckout(next)
  if (next.id !== id || next.status !== 'pending' || next.method !== method) throw new CheckoutError('INVALID_DATA', 'Data checkout tidak valid.')
  return next
}
export async function checkCheckout(repo: CheckoutRepository, id: string, now: number): Promise<CheckoutOrder> {
  const order = await loadCheckout(repo, id), state = checkoutState(order, now)
  if (state === 'success' || state === 'failed') return order
  if (state === 'expired') throw new CheckoutError('EXPIRED', 'Waktu pembayaran habis.')
  if (state !== 'pending') throw new CheckoutError('NOT_AVAILABLE', 'Pembayaran belum dimulai.')
  const next = await repo.check(id)
  assertCheckout(next)
  if (next.id !== id || next.status === 'checkout') throw new CheckoutError('INVALID_DATA', 'Data checkout tidak valid.')
  return next
}
