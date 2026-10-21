import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { CheckoutReceipt } from './checkout-receipt'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required checkout-receipt content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<CheckoutReceipt order={{ ...order, status: "pending", method: "midtrans" }} />)
  expect(markup).toContain('MENUNGGU PEMBAYARAN')
  expect(markup).toContain('Total Tagihan')
  expect(markup).toContain('Hemat Rp150.000')
  expect(markup).not.toContain('LUNAS')
})
