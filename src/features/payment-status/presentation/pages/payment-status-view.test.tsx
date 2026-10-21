// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PaymentStatusView } from './payment-status-view'
import { DemoPaymentStatusRepository } from '../../infrastructure/demo-payment-status-repository'
const { reload } = vi.hoisted(() => ({ reload: vi.fn() }))
vi.mock('../../controllers/payment-status-controller', () => ({ getPaymentStatusController: reload }))
vi.mock('next/font/local', () => ({ default: () => ({ className: 'icons' }) }))
let container: HTMLDivElement, root: Root
beforeEach(() => { Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); reload.mockReset(); container = document.createElement('div'); document.body.append(container); root = createRoot(container) })
afterEach(async () => { await act(async () => root.unmount()); container.remove() })
it('composes each status without exposing a real payment claim for preview fixtures', async () => {
  for (const id of ['demo-success', 'demo-failed']) {
    const data = (await new DemoPaymentStatusRepository().findById(id))!
    await act(async () => root.render(<PaymentStatusView key={id} id={id} initialResult={{ success: true, data }} />))
    expect(container.textContent).toContain('Preview lokal')
    expect(container.textContent).toContain('Rincian Pembayaran')
    expect(container.querySelector('a[href="/dashboard"]')).not.toBeNull()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  }
})
it('retries only status loading and then renders the server-read result', async () => {
  const data = (await new DemoPaymentStatusRepository().findById('demo-failed'))!
  reload.mockResolvedValue({ success: true, data })
  await act(async () => root.render(<PaymentStatusView id="demo-failed" initialResult={{ success: false, error: 'Belum dapat dimuat' }} />))
  expect(container.textContent).not.toContain('Kupon Telah Diamankan')
  await act(async () => container.querySelector<HTMLButtonElement>('button')!.click())
  expect(reload).toHaveBeenCalledExactlyOnceWith('demo-failed')
  expect(container.textContent).toContain('Transaksi Tidak Berhasil')
})
it('shows loading state and sanitizes unexpected action failures without a false success', async () => {
  let reject: (reason: Error) => void = () => {}
  reload.mockImplementation(() => new Promise((_, fail) => { reject = fail }))
  await act(async () => root.render(<PaymentStatusView id="demo-success" initialResult={{ success: false, error: { code: 'UNAVAILABLE', message: 'Belum tersedia' } }} />))
  await act(async () => container.querySelector<HTMLButtonElement>('button')!.click())
  expect(container.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true)
  await act(async () => reject(new Error('secret')))
  expect(container.textContent).toContain('Status pembayaran belum dapat dimuat')
  expect(container.textContent).not.toContain('secret')
  expect(container.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false)
})
