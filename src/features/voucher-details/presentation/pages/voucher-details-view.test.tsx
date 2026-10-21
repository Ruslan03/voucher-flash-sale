// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { VoucherDetailsView } from './voucher-details-view'
import { DemoVoucherDetailsRepository } from '../../infrastructure/demo-voucher-details-repository'
import type { SaleVoucher } from '../../domain/sale-voucher'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
const { reload } = vi.hoisted(() => ({ reload: vi.fn() }))
vi.mock('../../controllers/voucher-details-controller', () => ({ getVoucherDetailsController: reload }))
let container: HTMLDivElement, root: Root, voucher: SaleVoucher
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers(); vi.setSystemTime(1000000)
  voucher = (await new DemoVoucherDetailsRepository().findById('zara'))!
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers() })
async function render(data = voucher) { await act(async () => root.render(<VoucherDetailsView initialResult={{ success: true, data }} />)) }
async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find(b => b.textContent?.includes(label))!
  expect(button).toBeDefined(); await act(async () => button.click())
}
it('renders specifications and terms and confirms a single local purchase', async () => {
  await render()
  expect(container.textContent).toContain('Rp400.000')
  expect(container.textContent).toContain('Quota Restriction')
  expect(container.textContent).toContain('1.204')
  await click('Beli Sekarang'); expect(container.querySelector('dialog[open]')).not.toBeNull()
  await click('Konfirmasi demo')
  expect(container.textContent).toContain('DEMO-ZARA')
  expect(container.textContent).toContain('1.203')
  expect(container.querySelector<HTMLButtonElement>('[data-purchase]')?.disabled).toBe(true)
})
it('shares the current URL and reports clipboard success or manual fallback', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  await render(); await click('Bagikan Kupon Ini'); await click('Salin Tautan')
  expect(writeText).toHaveBeenCalledWith(window.location.href)
  expect(container.textContent).toContain('Tautan berhasil disalin')
  writeText.mockRejectedValue(new Error('Denied')); await click('Salin Tautan')
  expect(container.textContent).toContain('Salin tautan secara manual')
})
it('disables sold-out and upcoming vouchers and checks eligibility again at confirmation', async () => {
  await render({ ...voucher, remainingQuota: 0 })
  expect(container.querySelector<HTMLButtonElement>('[data-purchase]')?.disabled).toBe(true)
  await act(async () => root.unmount()); root = createRoot(container)
  await render(); await click('Beli Sekarang')
  await act(async () => vi.advanceTimersByTime(310000))
  await click('Konfirmasi demo')
  expect(container.textContent).toContain('tidak tersedia')
  expect(container.textContent).toContain('1.204')
})
it('retries a failed load without exposing transport errors', async () => {
  reload.mockResolvedValue({ success: true, data: voucher })
  await act(async () => root.render(<VoucherDetailsView initialResult={{ success: false, error: 'Tidak dapat dimuat' }} />))
  await click('Coba lagi'); expect(container.textContent).toContain(voucher.name)
})

it('handles upcoming, expired and category-used states and closes dialogs with Escape', async () => {
  for (const patch of [{ startsAt: new Date(2000000).toISOString() }, { endsAt: new Date(999999).toISOString() }, { categoryUsed: true }]) {
    await render({ ...voucher, ...patch })
    expect(container.querySelector<HTMLButtonElement>('[data-purchase]')?.disabled).toBe(true)
    await act(async () => root.unmount()); root = createRoot(container)
  }
  await render(); await click('Bagikan Kupon Ini')
  const dialog = container.querySelector<HTMLDialogElement>('dialog[open]')!
  expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
  await act(async () => dialog.dispatchEvent(new Event('cancel', { cancelable: true, bubbles: true })))
  expect(container.querySelector('dialog[open]')).toBeNull()
  expect(container.querySelector('a[href="/dashboard"]')).not.toBeNull()
})
