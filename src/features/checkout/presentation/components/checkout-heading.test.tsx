import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { CheckoutHeading } from './checkout-heading'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required checkout-heading content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<CheckoutHeading order={order} />)
  expect(markup).toContain('Checkout &amp; Pembayaran Kilat')
  expect(markup).toContain('#RES-77891')
})
