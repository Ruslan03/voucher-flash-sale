import { expect, it, vi } from 'vitest'
import { getPaymentStatus } from './get-payment-status'
const payment = { id: 'demo-success', orderId: '#ORD-1', mode: 'preview' as const, transactedAt: '2026-10-25T05:05:00Z', paymentMethod: 'Midtrans', amount: 50000, faceValue: 200000, status: 'success' as const, validUntil: '2026-11-01T16:59:59Z' }
it('requests the exact order lookup ID and returns validated data', async () => {
  const findById = vi.fn().mockResolvedValue(payment)
  expect(await getPaymentStatus({ findById }, payment.id)).toEqual(payment)
  expect(findById).toHaveBeenCalledExactlyOnceWith(payment.id)
})
it('rejects malformed IDs before I/O, missing orders, mismatched and malformed responses', async () => {
  const findById = vi.fn().mockResolvedValue(null)
  await expect(getPaymentStatus({ findById }, '../secret')).rejects.toMatchObject({ code: 'INVALID_ID' })
  expect(findById).not.toHaveBeenCalled()
  await expect(getPaymentStatus({ findById }, 'missing')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  findById.mockResolvedValue({ ...payment, id: 'other' })
  await expect(getPaymentStatus({ findById }, payment.id)).rejects.toMatchObject({ code: 'INVALID_DATA' })
  findById.mockResolvedValue({ ...payment, status: 'pending' })
  await expect(getPaymentStatus({ findById }, payment.id)).rejects.toMatchObject({ code: 'INVALID_DATA' })
})
it('propagates adapter failures for the controller to sanitize', async () => {
  await expect(getPaymentStatus({ findById: async () => { throw new Error('private') } }, payment.id)).rejects.toThrow('private')
})
