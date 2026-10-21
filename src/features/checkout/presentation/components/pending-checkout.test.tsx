import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PendingCheckout } from './pending-checkout'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required pending-checkout content and state', async () => {
  const order = (await new PreviewCheckoutRepository(undefined, () => 1000000).load('zara'))!
  const markup = renderToStaticMarkup(<PendingCheckout order={{ ...order, status: "pending", method: "midtrans", virtualAccount: "8077081234567890" }} now={Date.parse(order.fetchedAt)} busy={false} onCheck={() => {}} />)
  expect(markup).toContain('Menunggu Konfirmasi Pembayaran')
  expect(markup).toContain('Cek Status Pembayaran')
  expect(markup).toContain('20 detik')
})
