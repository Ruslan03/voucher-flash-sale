import { assertCheckout, checkoutState, CheckoutError, type CheckoutOrder, type PaymentMethod } from '../domain/checkout'
import type { CheckoutRepository } from '../use-cases/checkout-repository'
export type PreviewStorage = Pick<Storage, 'getItem' | 'setItem'>
/** Browser-local simulation only. Never contacts payment gateways or reserves backend quota. */
export class PreviewCheckoutRepository implements CheckoutRepository {
  private storageFailed = false
  private readonly memory = new Map<string, CheckoutOrder>()
  constructor(private readonly storage?: PreviewStorage, private readonly now: () => number = Date.now) {}
  private save(order: CheckoutOrder): CheckoutOrder {
    this.memory.set(order.id, structuredClone(order))
    try { if (!this.storageFailed) this.storage?.setItem(`promorush:checkout:v1:${order.id}`, JSON.stringify(order)) } catch { this.storageFailed = true }
    return structuredClone(order)
  }
  async load(id: string): Promise<CheckoutOrder | null> {
    if (!['zara', 'demo-order', 'demo-failed', 'demo-pending'].includes(id)) return null
    let raw: string | null = null
    try { raw = this.storageFailed ? null : this.storage?.getItem(`promorush:checkout:v1:${id}`) ?? null } catch { this.storageFailed = true }
    if (raw) {
      let order: unknown
      try { order = JSON.parse(raw) } catch { throw new CheckoutError('INVALID_DATA', 'Preview tersimpan tidak valid. Hapus data preview di browser untuk mengulang.') }
      assertCheckout(order)
      if (order.id !== id) throw new CheckoutError('INVALID_DATA', 'Data checkout tidak valid.')
      this.memory.set(id, structuredClone(order))
      return structuredClone(order)
    }
    const cached = this.memory.get(id)
    if (cached) return structuredClone(cached)
    const now = this.now(), pending = id !== 'zara'
    return this.save({ mode: 'preview', id, orderId: '#ORD-20261025-9921', reservationId: '#RES-77891',
      voucher: { id: 'zara', name: 'Zara & MAP Fashion Voucher', category: 'Fashion & Lifestyle', faceValue: 200000, price: 50000 },
      discount: 0, fee: 0, status: pending ? 'pending' : 'checkout', method: pending ? 'midtrans' : null,
      createdAt: new Date(now - (pending ? 75000 : 0)).toISOString(), fetchedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + (pending ? 225000 : 300000)).toISOString(), virtualAccount: pending ? '8077081234567890' : null })
  }
  async start(id: string, method: PaymentMethod): Promise<CheckoutOrder> {
    const order = await this.load(id)
    if (!order) throw new CheckoutError('NOT_FOUND', 'Pesanan tidak ditemukan.')
    const state = checkoutState(order, this.now())
    if (state === 'expired') throw new CheckoutError('EXPIRED', 'Waktu pembayaran habis.')
    if (!['checkout', 'failed'].includes(state)) throw new CheckoutError('NOT_AVAILABLE', 'Pesanan sudah diproses.')
    if (!['midtrans', 'xendit'].includes(method)) throw new CheckoutError('INVALID_METHOD', 'Metode tidak valid.')
    return this.save({ ...order, method, status: 'pending', fetchedAt: new Date(this.now()).toISOString(), virtualAccount: method === 'midtrans' ? '8077081234567890' : '8808081234567890' })
  }
  async check(id: string): Promise<CheckoutOrder> {
    const order = await this.load(id)
    if (!order) throw new CheckoutError('NOT_FOUND', 'Pesanan tidak ditemukan.')
    const state = checkoutState(order, this.now())
    if (state === 'success' || state === 'failed') return order
    if (state === 'expired') throw new CheckoutError('EXPIRED', 'Waktu pembayaran habis.')
    if (state !== 'pending') throw new CheckoutError('NOT_AVAILABLE', 'Pembayaran belum dimulai.')
    return this.save({ ...order, status: id === 'demo-failed' ? 'failed' : id === 'demo-pending' ? 'pending' : 'success', fetchedAt: new Date(this.now()).toISOString() })
  }
}
