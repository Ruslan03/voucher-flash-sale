import React from 'react'
import { expect, it, vi } from 'vitest'
import { PaymentStatusPage } from './payment-status-page'
const { load, connect, notFound } = vi.hoisted(() => ({ load: vi.fn(), connect: vi.fn(), notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))
vi.mock('next/server', () => ({ connection: connect }))
vi.mock('next/navigation', () => ({ notFound }))
vi.mock('../../controllers/payment-status-controller', () => ({ getPaymentStatusController: load }))
vi.mock('./payment-status-view', () => ({ PaymentStatusView: () => null }))
it('resolves async route params and supplies the read result to the view', async () => {
  const result = { success: false, error: { code: 'UNAVAILABLE', message: 'Unavailable' } }
  load.mockResolvedValue(result)
  const page = await PaymentStatusPage({ params: Promise.resolve({ orderId: 'demo-success' }) }) as React.ReactElement<{ id: string; initialResult: unknown }>
  expect(connect).toHaveBeenCalled()
  expect(load).toHaveBeenCalledWith('demo-success')
  expect(page.props.id).toBe('demo-success')
  expect(page.props.initialResult).toBe(result)
})
it('returns not-found for missing or malformed orders instead of fabricating a status', async () => {
  for (const code of ['NOT_FOUND', 'INVALID_ID']) {
    load.mockResolvedValue({ success: false, error: { code, message: 'Not found' } })
    await expect(PaymentStatusPage({ params: Promise.resolve({ orderId: 'unknown' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  }
})
