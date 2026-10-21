import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PaymentStatusActions } from './payment-status-actions'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('navigates to the real dashboard route with an accessible link', () => {
  const markup = renderToStaticMarkup(<PaymentStatusActions />)
  expect(markup).toContain('href="/dashboard"')
  expect(markup).toContain('Kembali ke Dashboard Flash Sale')
  expect(markup).not.toContain('href="#"')
})
