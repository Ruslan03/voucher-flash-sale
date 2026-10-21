import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PaymentMethodPicker } from './payment-method-picker'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required payment-method-picker content and state', async () => {
  const markup = renderToStaticMarkup(<PaymentMethodPicker value="xendit" onChange={() => {}} />)
  expect(markup).toContain('Metode Pembayaran Online')
  expect(markup).toContain('Midtrans Payment Gateway')
  expect(markup).toContain('Xendit Payment Gateway')
  expect(markup).toContain('Mandiri')
})
