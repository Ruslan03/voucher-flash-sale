// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PaymentReceipt } from './payment-receipt'
import { DemoPaymentStatusRepository } from '../../infrastructure/demo-payment-status-repository'
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
let container: HTMLDivElement, root: Root
beforeEach(() => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(async () => { await act(async () => root.unmount()); container.remove() })
async function render(id: string) { const payment = (await new DemoPaymentStatusRepository().findById(id))!; await act(async () => root.render(<PaymentReceipt payment={payment} />)) }
it('renders success receipt amounts, savings, WIB time and paid method', async () => {
  await render('demo-success')
  expect(container.textContent).toContain('LUNAS')
  expect(container.textContent).toContain('Total Dibayar')
  expect(container.textContent).toContain('Hemat Rp150.000')
  expect(container.textContent).toContain('25 Okt 2026, 12:05 WIB')
  expect(container.querySelector('del')?.textContent).toBe('Rp200.000')
  expect(container.textContent).toContain('Rp50.000')
})
it('renders failure reason and billed amount without claiming payment succeeded or savings earned', async () => {
  await render('demo-failed')
  expect(container.textContent).toContain('GAGAL')
  expect(container.textContent).toContain('Gagal (Gateway Timeout)')
  expect(container.textContent).toContain('Jumlah Tagihan')
  expect(container.textContent).toContain('Pembayaran Dibatalkan')
  expect(container.textContent).not.toContain('Total Dibayar')
  expect(container.textContent).not.toContain('Hemat')
})
it('copies the exact order ID and reports clipboard denial/unavailability accurately', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  await render('demo-success')
  const button = container.querySelector<HTMLButtonElement>('button[aria-label="Salin Order ID"]')!
  expect(button).not.toBeNull()
  await act(async () => button.click())
  expect(writeText).toHaveBeenCalledExactlyOnceWith('#ORD-20261025-9921')
  expect(container.querySelector('[role="status"]')?.textContent).toContain('Order ID berhasil disalin')
  writeText.mockRejectedValue(new Error('Denied')); await act(async () => button.click())
  expect(container.textContent).toContain('Salin Order ID secara manual')
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
  await act(async () => button.click())
  expect(container.textContent).toContain('Salin Order ID secara manual')
})
