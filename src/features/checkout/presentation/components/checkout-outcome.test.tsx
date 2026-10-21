import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { CheckoutOutcome } from './checkout-outcome'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required checkout-outcome content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<CheckoutOutcome order={order} state="expired" onRetry={() => {}} />)
  expect(markup).toContain('Waktu Pembayaran Habis')
  expect(markup).toContain('href="/dashboard"')
  expect(markup).not.toContain('Coba Lagi')
})
