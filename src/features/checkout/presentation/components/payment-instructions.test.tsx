import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PaymentInstructions } from './payment-instructions'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required payment-instructions content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<PaymentInstructions order={{ ...order, method: "xendit", virtualAccount: "8808081234567890" }} />)
  expect(markup).toContain('Xendit')
  expect(markup).toContain('8808 0812 3456 7890')
  expect(markup).toContain('Jangan transfer dana')
})
