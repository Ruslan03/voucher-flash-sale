import type { PaymentStatusRecord } from '../domain/payment-status'
import type { PaymentStatusRepository } from '../use-cases/payment-status-repository'
/** Design fixtures only; no gateway request, payment verification or persistence. */
export class DemoPaymentStatusRepository implements PaymentStatusRepository {
  async findById(id: string): Promise<PaymentStatusRecord | null> {
    const common = { id, orderId: '#ORD-20261025-9921', mode: 'preview' as const,
      paymentMethod: 'Midtrans (BCA Virtual Account / QRIS)', amount: 50000, faceValue: 200000 }
    if (id === 'demo-success') return { ...common, status: 'success', transactedAt: '2026-10-25T05:05:00Z', validUntil: '2026-11-01T16:59:59Z' }
    if (id === 'demo-failed') return { ...common, status: 'failed', transactedAt: '2026-10-25T05:07:00Z', failureReason: 'Gateway Timeout' }
    return null
  }
}
