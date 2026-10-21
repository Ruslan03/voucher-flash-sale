import React, { Suspense } from 'react'
import { expect, it, vi } from 'vitest'
import Page from './page'
import { CheckoutPage } from '@/features/checkout/presentation/pages/checkout-page'
vi.mock('@/features/checkout/presentation/pages/checkout-page', () => ({ CheckoutPage: () => null }))
it('delegates the route to the feature within Suspense', () => {
  const params = Promise.resolve({ id: 'zara' })
  const page = Page({ params }) as React.ReactElement<{ children: React.ReactElement<{ params: typeof params }> }>
  expect(page?.type).toBe(Suspense); expect(page.props.children.type).toBe(CheckoutPage); expect(page.props.children.props.params).toBe(params)
})
