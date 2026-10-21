import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { CheckoutSummary } from './checkout-summary'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required checkout-summary content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<CheckoutSummary order={order} busy={false} disabled={false} onPay={() => {}} />)
  expect(markup).toContain('Ringkasan Pesanan')
  expect(markup).toContain('Bayar Rp50.000')
  expect(markup).toContain('Rp0 (Gratis)')
})
