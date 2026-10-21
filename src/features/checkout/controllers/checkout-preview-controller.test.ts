import { expect, it, vi } from 'vitest'
import { restoreCheckoutPreview, startCheckoutPreview, checkCheckoutPreview } from './checkout-preview-controller'
import { PreviewCheckoutRepository } from '../infrastructure/preview-checkout-repository'
const { factory } = vi.hoisted(() => ({ factory: vi.fn() }))
vi.mock('@/composition/checkout-preview-registry', () => ({ createCheckoutPreviewRepository: factory }))
it('restores, starts and checks a mock payment through the injected repository', async () => {
  factory.mockReturnValue(new PreviewCheckoutRepository())
  expect(await restoreCheckoutPreview('zara')).toMatchObject({ success: true, data: { status: 'checkout' } })
  expect(await startCheckoutPreview('zara', 'xendit')).toMatchObject({ success: true, data: { method: 'xendit', status: 'pending' } })
  expect(await checkCheckoutPreview('zara')).toMatchObject({ success: true, data: { status: 'success' } })
})
it('maps domain errors for every operation and sanitizes storage/adapter failures', async () => {
  factory.mockReturnValue(new PreviewCheckoutRepository())
  for (const run of [() => restoreCheckoutPreview('unknown'), () => startCheckoutPreview('unknown', 'midtrans'), () => checkCheckoutPreview('unknown')]) expect(await run()).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } })
  factory.mockImplementation(() => { throw new Error('secret') })
  for (const run of [() => restoreCheckoutPreview('zara'), () => startCheckoutPreview('zara', 'midtrans'), () => checkCheckoutPreview('zara')]) expect(await run()).toEqual({ success: false, error: { code: 'PREVIEW_FAILED', message: 'Simulasi checkout belum dapat diproses.' } })
})
