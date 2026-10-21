import React, { Suspense } from 'react'
import { expect, it, vi } from 'vitest'
import Page from './page'
import { PaymentStatusPage } from '@/features/payment-status/presentation/pages/payment-status-page'
vi.mock('@/features/payment-status/presentation/pages/payment-status-page', () => ({ PaymentStatusPage: () => null }))
it('keeps the route a thin Suspense shell and delegates async order params', () => {
  const params = Promise.resolve({ orderId: 'demo-success' })
  const page = Page({ params }) as React.ReactElement<{ children: React.ReactElement<{ params: typeof params }>; fallback: React.ReactElement }>
  expect(page?.type).toBe(Suspense)
  expect(page.props.children.type).toBe(PaymentStatusPage)
  expect(page.props.children.props.params).toBe(params)
  expect(page.props.fallback.props).toMatchObject({ role: 'status', children: 'Memuat status pembayaran...' })
})
