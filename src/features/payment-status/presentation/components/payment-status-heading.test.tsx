import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { PaymentStatusHeading } from './payment-status-heading'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('renders one clear heading and supporting copy for each status', () => {
  const success = renderToStaticMarkup(<PaymentStatusHeading status="success" />)
  expect(success).toContain('Pembayaran Berhasil! Kupon Telah Diamankan')
  expect(success).toContain('disimpan ke akun PromoRush')
  const failed = renderToStaticMarkup(<PaymentStatusHeading status="failed" />)
  expect(failed).toContain('Transaksi Tidak Berhasil')
  expect(failed).toContain('waktu otorisasi telah berakhir')
  expect(failed).not.toContain('Kupon Telah Diamankan')
})
