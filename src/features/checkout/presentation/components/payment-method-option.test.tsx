import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PaymentMethodOption } from './payment-method-option'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders the required payment-method-option content and state', async () => {
  const markup = renderToStaticMarkup(<PaymentMethodOption method="midtrans" selected onChange={() => {}} />)
  expect(markup).toContain('Midtrans Payment Gateway')
  expect(markup).toContain('checked=')
  expect(markup).toContain('GoPay')
  expect(markup).toContain('Bebas Biaya Admin')
})
