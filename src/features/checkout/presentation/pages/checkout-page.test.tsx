import React from 'react'
import { expect, it, vi } from 'vitest'
import { CheckoutPage } from './checkout-page'
const { load, connection } = vi.hoisted(() => ({ load: vi.fn(), connection: vi.fn() }))
vi.mock('next/server', () => ({ connection }))
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NOT_FOUND') } }))
vi.mock('../../controllers/checkout-controller', () => ({ getCheckoutController: load }))
vi.mock('./checkout-view', () => ({ CheckoutView: () => null }))
it('reads request-time data and forwards async params/results', async () => {
  const result = { success: false, error: { code: 'UNAVAILABLE', message: 'Unavailable' } }; load.mockResolvedValue(result)
  const page = await CheckoutPage({ params: Promise.resolve({ id: 'zara' }) }) as React.ReactElement<{ id: string; initialResult: unknown }>
  expect(connection).toHaveBeenCalled(); expect(load).toHaveBeenCalledWith('zara'); expect(page.props.initialResult).toBe(result)
})
it('renders not-found for invalid and missing IDs', async () => {
  for (const code of ['INVALID_ID', 'NOT_FOUND']) { load.mockResolvedValue({ success: false, error: { code, message: '' } }); await expect(CheckoutPage({ params: Promise.resolve({ id: 'bad' }) })).rejects.toThrow('NOT_FOUND') }
})
