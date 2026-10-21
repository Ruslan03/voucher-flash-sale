// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import { OrderPaymentStatusView } from './order-payment-status-view'
import { PreviewCheckoutRepository } from '@/features/checkout/infrastructure/preview-checkout-repository'
const { push, replace, restore, check } = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), restore: vi.fn(), check: vi.fn() }))
vi.mock('next/navigation', () => { const router = { push, replace }; return { useRouter: () => router } })
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
vi.mock('@/features/checkout/controllers/checkout-preview-controller', () => ({ restoreCheckoutPreview: restore, checkCheckoutPreview: check }))
it('owns pending polling and renders its settled result without changing the method route', async () => {
 Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.useFakeTimers(); vi.setSystemTime(1000000)
 const repo = new PreviewCheckoutRepository(), data = (await repo.load('demo-order'))!
 restore.mockResolvedValue({ success: true, data }); check.mockImplementation(async () => ({ success: true, data: await repo.check('demo-order') }))
 const container = document.createElement('div'), root = createRoot(container)
 await act(async () => root.render(<OrderPaymentStatusView id="demo-order" initialResult={{ success: true, data }} />))
 expect(container.textContent).toContain('Menunggu Konfirmasi Pembayaran')
 await act(async () => vi.advanceTimersByTime(20000))
 expect(container.textContent).toContain('Pembayaran Demo Berhasil')
 const calls = check.mock.calls.length; await act(async () => vi.advanceTimersByTime(40000)); expect(check).toHaveBeenCalledTimes(calls)
 await act(async () => root.unmount()); vi.useRealTimers()
})
it('routes failed retries to payment-method and handles expiration under payment-status', async () => {
 Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.useFakeTimers(); vi.setSystemTime(1000000)
 const repo = new PreviewCheckoutRepository(), pending = (await repo.load('demo-failed'))!, failed = await repo.check('demo-failed')
 restore.mockResolvedValue({ success: true, data: failed })
 const container = document.createElement('div'), root = createRoot(container)
 await act(async () => root.render(<OrderPaymentStatusView id="demo-failed" initialResult={{ success: true, data: pending }} />))
 const retry = [...container.querySelectorAll('button')].find(b => b.textContent === 'Coba Lagi')!
 await act(async () => retry.click()); expect(push).toHaveBeenCalledWith('/payment-method/demo-failed')
 await act(async () => vi.advanceTimersByTime(300000)); expect(container.textContent).toContain('Waktu Pembayaran Habis')
 await act(async () => root.unmount()); vi.useRealTimers()
})
