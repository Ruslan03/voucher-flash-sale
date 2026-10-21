// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { CheckoutView } from './checkout-view'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
const { push, replace, restore, start } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), restore: vi.fn(), start: vi.fn() }))
vi.mock('next/navigation', () => { const router = { push, replace }; return { useRouter: () => router } })
vi.mock('../../controllers/checkout-preview-controller', () => ({ restoreCheckoutPreview: restore, startCheckoutPreview: start, checkCheckoutPreview: vi.fn() }))
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
it('starts payment then navigates to payment-status without rendering pending in payment-method', async () => {
 Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
 const repo = new PreviewCheckoutRepository(), data = (await repo.load('zara'))!
 restore.mockResolvedValue({ success: true, data }); start.mockResolvedValue({ success: true, data: { ...data, status: 'pending', method: 'midtrans', virtualAccount: '1234' } })
 const container = document.createElement('div'), root = createRoot(container)
 await act(async () => root.render(<CheckoutView id="zara" initialResult={{ success: true, data }} />))
 const button = [...container.querySelectorAll('button')].find(b => b.textContent?.includes('Bayar'))!
 await act(async () => button.click())
 expect(push).toHaveBeenCalledWith('/payment-status/zara')
 expect(container.textContent).not.toContain('Menunggu Konfirmasi Pembayaran')
 await act(async () => root.unmount())
})
it('redirects an already pending stored order to its status route', async () => {
 Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); replace.mockClear()
 const data = (await new PreviewCheckoutRepository().load('demo-order'))!; restore.mockResolvedValue({ success: true, data })
 const container = document.createElement('div'), root = createRoot(container)
 await act(async () => root.render(<CheckoutView id="demo-order" initialResult={{ success: true, data }} />))
 expect(replace).toHaveBeenCalledWith('/payment-status/demo-order')
 expect(container.textContent).not.toContain('Cek Status Pembayaran')
 await act(async () => root.unmount())
})
