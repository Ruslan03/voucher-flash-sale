import { beforeEach, expect, it, vi } from 'vitest'
import { getPaymentStatusController } from './payment-status-controller'
import { DemoPaymentStatusRepository } from '../infrastructure/demo-payment-status-repository'
const { findById } = vi.hoisted(() => ({ findById: vi.fn() }))
vi.mock('@/composition/registry', () => ({ createPaymentStatusRepository: () => ({ findById }) }))
beforeEach(() => { findById.mockReset() })
it('maps successful and failed payment data as successful reads', async () => {
  for (const id of ['demo-success', 'demo-failed']) {
    findById.mockResolvedValue(await new DemoPaymentStatusRepository().findById(id))
    expect(await getPaymentStatusController(id)).toMatchObject({ success: true, data: { id } })
  }
})
it('maps missing and invalid orders and sanitizes transport errors', async () => {
  findById.mockResolvedValue(null)
  expect(await getPaymentStatusController('unknown')).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } })
  expect(await getPaymentStatusController('..')).toMatchObject({ success: false, error: { code: 'INVALID_ID' } })
  findById.mockRejectedValue(new Error('secret token'))
  expect(await getPaymentStatusController('demo-success')).toEqual({ success: false, error: { code: 'UNAVAILABLE', message: 'Status pembayaran belum dapat dimuat. Silakan coba lagi.' } })
})
