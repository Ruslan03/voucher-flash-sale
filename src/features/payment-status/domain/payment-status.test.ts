import { describe, expect, it } from 'vitest'
import { assertPaymentStatusRecord, PaymentStatusError } from './payment-status'
const valid = { id: 'demo-success', orderId: '#ORD-20261025-9921', mode: 'preview', transactedAt: '2026-10-25T05:05:00Z', paymentMethod: 'Midtrans', amount: 50000, faceValue: 200000, status: 'success', validUntil: '2026-11-01T16:59:59Z' }
describe('assertPaymentStatusRecord', () => {
  it('accepts successful and failed records without mutating them', () => {
    expect(() => assertPaymentStatusRecord(Object.freeze(valid))).not.toThrow()
    expect(() => assertPaymentStatusRecord({ ...valid, status: 'failed', failureReason: 'Gateway Timeout' })).not.toThrow()
  })
  it('rejects unknown status, incomplete data, invalid values and contradictory amounts', () => {
    for (const value of [null, {}, { ...valid, status: 'pending' }, { ...valid, mode: 'unknown' }, { ...valid, amount: -1 }, { ...valid, amount: NaN }, { ...valid, amount: 1.5 }, { ...valid, faceValue: 1 }, { ...valid, orderId: '' }, { ...valid, paymentMethod: '' }, { ...valid, transactedAt: 'invalid' }, { ...valid, validUntil: '2020-01-01' }, { ...valid, status: 'failed', failureReason: '' }]) {
      expect(() => assertPaymentStatusRecord(value)).toThrow(PaymentStatusError)
    }
  })
})
