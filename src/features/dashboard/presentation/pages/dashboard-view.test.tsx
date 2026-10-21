// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardView } from './dashboard-view'
import { DemoDashboardRepository } from '../../infrastructure/demo-dashboard-repository'
import type { DashboardSnapshot } from '../../domain/dashboard'

const { reload } = vi.hoisted(() => ({ reload: vi.fn() }))
vi.mock('../../controllers/dashboard-controller', () => ({ getDashboardController: reload }))
vi.mock('next/font/local', () => ({ default: () => ({ className: 'test-icons' }) }))
vi.mock('../../assets/avatar.jpg', () => ({ default: { src: '/avatar.jpg', width: 512, height: 512 } }))

let container: HTMLDivElement, root: Root, data: DashboardSnapshot
const click = async (text: string) => {
  const target = Array.from(container.querySelectorAll('button')).find(button => button.textContent?.includes(text) || button.getAttribute('aria-label')?.includes(text))!
  expect(target).toBeDefined()
  await act(async () => target.click())
}
const live = async () => {
  const select = container.querySelector<HTMLSelectElement>('select[aria-label="Skenario sesi demo"]')!
  await act(async () => { select.value = 'live'; select.dispatchEvent(new Event('change', { bubbles: true })) })
}
beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-24T04:37:00Z'))
  data = await new DemoDashboardRepository().load()
  reload.mockReset()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers() })
async function render(snapshot = data) { await act(async () => root.render(<DashboardView initialResult={{ success: true, data: snapshot }} />)) }

describe('dashboard UI flow', () => {
  it('shows owned slots, filters the catalog, and opens owned coupon details', async () => {
    await render()
    expect(container.querySelectorAll('[data-offer-id]')).toHaveLength(5)
    await click('Makanan & Minuman')
    expect(container.querySelectorAll('[data-offer-id]')).toHaveLength(2)
    expect(container.querySelector('button[aria-pressed="true"]')?.textContent).toContain('Makanan')
    await click('Lihat Detail Kupon')
    expect(container.querySelector('dialog[open]')?.textContent).toContain('DEMO-PR-UQ882')
    await click('Tutup')
    expect(container.querySelector('dialog[open]')).toBeNull()
  })
  it('blocks upcoming actions, previews live purchases and enforces one coupon per category', async () => {
    await render()
    expect(container.querySelector<HTMLButtonElement>('[data-offer-id="tokopedia"] button')?.disabled).toBe(true)
    await live()
    await click('Beli Voucher Rp350.000')
    expect(container.querySelector('dialog[open]')?.textContent).toContain('Konfirmasi pembelian demo')
    await click('Konfirmasi demo')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('berhasil')
    expect(container.textContent).toContain('2 Kupon Aktif')
    expect(container.querySelector<HTMLButtonElement>('[data-offer-id="samsung"] button')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-offer-id="tokopedia"] button')?.disabled).toBe(true)
    expect(container.textContent).toContain('1.449')
  })
  it('updates countdown, switches ended state, and renders empty data', async () => {
    await render({ ...data, offers: [] })
    expect(container.textContent).toContain('Belum ada penawaran')
    expect(container.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('00:23:00')
    await act(async () => vi.advanceTimersByTime(1000))
    expect(container.querySelector('[role="timer"]')?.getAttribute('aria-label')).toBe('00:22:59')
    const select = container.querySelector('select')!
    await act(async () => { select.value = 'ended'; select.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(container.textContent).toContain('Sesi Hari Ini Telah Berakhir')
  })
  it('shows load errors and retries through the controller', async () => {
    await act(async () => root.render(<DashboardView initialResult={{ success: false, error: 'Offline' }} />))
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
    reload.mockResolvedValue({ success: true, data })
    await click('Coba lagi')
    expect(reload).toHaveBeenCalledTimes(1)
    expect(container.querySelectorAll('[data-offer-id]')).toHaveLength(5)
  })

  it('rejects confirmation if the session closes while the dialog is open', async () => {
    await render()
    await live()
    await click('Beli Voucher Rp350.000')
    await act(async () => vi.advanceTimersByTime(15 * 60000))
    await click('Konfirmasi demo')
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('tidak tersedia')
    expect(container.textContent).toContain('1 Kupon Aktif')
    expect(container.querySelector('dialog[open]')).toBeNull()
  })
})
