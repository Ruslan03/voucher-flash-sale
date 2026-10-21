import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { VoucherRedemptionNotice } from './voucher-redemption-notice'
import { DemoPaymentStatusRepository } from '../../infrastructure/demo-payment-status-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('shows redemption guidance only for successful payments with the actual expiry date', async () => {
  const repo = new DemoPaymentStatusRepository()
  const success = renderToStaticMarkup(<VoucherRedemptionNotice payment={(await repo.findById('demo-success'))!} />)
  expect(success).toContain('1 Nov 2026')
  expect(success).toContain('QR code')
  expect(renderToStaticMarkup(<VoucherRedemptionNotice payment={(await repo.findById('demo-failed'))!} />)).toBe('')
})
