import { expect, it, vi } from 'vitest'
import { getCheckoutController } from './checkout-controller'
import { PreviewCheckoutRepository } from '../infrastructure/preview-checkout-repository'
const { load } = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('@/composition/registry', () => ({ createCheckoutRepository: () => ({ load }) }))
it('adapts a validated server read and sanitizes missing/transport errors', async () => {
  load.mockResolvedValue(await new PreviewCheckoutRepository().load('zara'))
  expect(await getCheckoutController('zara')).toMatchObject({ success: true, data: { status: 'checkout' } })
  load.mockResolvedValue(null)
  expect(await getCheckoutController('unknown')).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } })
  load.mockRejectedValue(new Error('private'))
  expect(await getCheckoutController('zara')).toEqual({ success: false, error: { code: 'UNAVAILABLE', message: 'Checkout belum dapat dimuat. Silakan coba lagi.' } })
})
