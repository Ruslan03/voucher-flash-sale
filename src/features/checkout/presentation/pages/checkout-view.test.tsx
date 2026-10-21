// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { CheckoutView } from './checkout-view'
import { PreviewCheckoutRepository } from '../../infrastructure/preview-checkout-repository'
import type { CheckoutOrder } from '../../domain/checkout'
const { restore, start, check } = vi.hoisted(() => ({ restore: vi.fn(), start: vi.fn(), check: vi.fn() }))
vi.mock('../../controllers/checkout-preview-controller', () => ({ restoreCheckoutPreview: restore, startCheckoutPreview: start, checkCheckoutPreview: check }))
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
let container: HTMLDivElement, root: Root, repo: PreviewCheckoutRepository
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); vi.useFakeTimers(); vi.setSystemTime(1000000)
  repo = new PreviewCheckoutRepository(); restore.mockReset(); start.mockReset(); check.mockReset()
  restore.mockImplementation(async id => ({ success: true, data: await repo.load(id) }))
  start.mockImplementation(async (id, method) => ({ success: true, data: await repo.start(id, method) }))
  check.mockImplementation(async id => ({ success: true, data: await repo.check(id) }))
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers() })
async function render(id = 'zara', data?: CheckoutOrder) { await act(async () => root.render(<CheckoutView id={id} initialResult={{ success: true, data: data ?? (await repo.load(id))! }} />)) }
async function click(text: string) { const button = [...container.querySelectorAll('button')].find(b => b.textContent?.includes(text))!; expect(button).toBeDefined(); await act(async () => button.click()) }
it('selects Xendit, starts a payment and checks through the positive demo flow', async () => {
  await render()
  const xendit = container.querySelector<HTMLInputElement>('input[value="xendit"]')!
  expect(xendit).not.toBeNull(); await act(async () => xendit.click())
  await click('Bayar Rp50.000')
  expect(start).toHaveBeenCalledExactlyOnceWith('zara', 'xendit')
  expect(container.textContent).toContain('Menunggu Konfirmasi Pembayaran')
  expect(container.textContent).toContain('8808 0812 3456 7890')
  await click('Cek Status Pembayaran')
  expect(container.textContent).toContain('Pembayaran Demo Berhasil')
  expect(container.textContent).toContain('LUNAS (DEMO)')
})
it('restores pending preview and automatically checks status, then stops polling when settled', async () => {
  await render('demo-order')
  expect(container.textContent).toContain('03:45')
  await act(async () => vi.advanceTimersByTime(20000))
  expect(check).toHaveBeenCalledOnce()
  expect(container.textContent).toContain('Pembayaran Demo Berhasil')
  await act(async () => vi.advanceTimersByTime(40000))
  expect(check).toHaveBeenCalledOnce()
})
it('shows failed state and retries the original reservation without extending its deadline', async () => {
  await render('demo-failed'); const expiry = (await repo.load('demo-failed'))!.expiresAt
  await click('Cek Status Pembayaran'); expect(container.textContent).toContain('Pembayaran Tidak Berhasil')
  await click('Coba Lagi'); await click('Bayar Rp50.000')
  expect((await repo.load('demo-failed'))!.expiresAt).toBe(expiry)
  expect(container.textContent).toContain('Menunggu Konfirmasi Pembayaran')
})
it('expires a pending reservation and prevents checking or paying', async () => {
  const order = { ...(await repo.load('demo-pending'))!, expiresAt: new Date(1002000).toISOString() }
  restore.mockResolvedValue({ success: true, data: order })
  await render('demo-pending', order)
  await act(async () => vi.advanceTimersByTime(2000))
  expect(container.textContent).toContain('Waktu Pembayaran Habis')
  expect(container.textContent).not.toContain('Cek Status Pembayaran')
  expect(check).not.toHaveBeenCalled()
})
it('guards duplicate clicks and displays action failures without claiming a completed payment', async () => {
  await render(); let finish: (result: unknown) => void = () => {}
  start.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const pay = [...container.querySelectorAll('button')].find(b => b.textContent?.includes('Bayar'))!
  expect(pay).toBeDefined(); await act(async () => { pay.click(); pay.click() })
  expect(start).toHaveBeenCalledOnce(); expect(pay.disabled).toBe(true)
  await act(async () => finish({ success: false, error: { code: 'UNAVAILABLE', message: 'Coba beberapa saat lagi' } }))
  expect(container.textContent).toContain('Coba beberapa saat lagi')
  expect(container.textContent).not.toContain('Pembayaran Demo Berhasil')
})
it('retries restoration after failure and sanitizes an unexpected rejection', async () => {
  restore.mockResolvedValueOnce({ success: false, error: 'Data belum tersedia' }).mockRejectedValueOnce(new Error('secret')).mockImplementation(async id => ({ success: true, data: await repo.load(id) }))
  await render(); expect(container.textContent).toContain('Data belum tersedia')
  await click('Coba lagi'); expect(container.textContent).not.toContain('secret')
  await click('Coba lagi'); expect(container.textContent).toContain('Pilih Metode Pembayaran')
})
