import { describe, expect, it, vi } from 'vitest'
import { DemoVoucherDetailsRepository } from './demo-voucher-details-repository'
import { getVoucherDetailsController } from '../controllers/voucher-details-controller'
import { voucherPurchasePreviewController } from '../controllers/voucher-purchase-preview-controller'
import { buildVoucherShareLinks, copyVoucherLink } from '../presentation/lib/share-voucher'

const { findById } = vi.hoisted(() => ({ findById: vi.fn() }))
vi.mock('@/composition/registry', () => ({ createVoucherDetailsRepository: () => ({ findById }) }))

describe('voucher details adapter and controllers', () => {
  it('loads isolated fixtures for known IDs, preserving the Stitch default pricing', async () => {
    const repo = new DemoVoucherDetailsRepository(() => 0), first = await repo.findById('zara')
    expect(first?.price).toBe(50000)
    expect(first?.remainingQuota).toBe(1204)
    first!.remainingQuota = 0
    expect((await repo.findById('zara'))?.remainingQuota).toBe(1204)
    expect(await repo.findById('missing')).toBeNull()
  })
  it('returns loaded data, maps domain errors and sanitizes transport failures', async () => {
    findById.mockResolvedValue(await new DemoVoucherDetailsRepository(() => 0).findById('zara'))
    expect((await getVoucherDetailsController('zara')).success).toBe(true)
    findById.mockResolvedValue(null)
    expect(await getVoucherDetailsController('unknown')).toMatchObject({ success: false, error: { code: 'NOT_FOUND' } })
    findById.mockRejectedValue(new Error('private transport error'))
    expect(await getVoucherDetailsController('zara')).toEqual({ success: false, error: { code: 'UNAVAILABLE', message: 'Detail voucher belum dapat dimuat. Silakan coba lagi.' } })
  })
  it('maps demo confirmation and rejects repeat purchase', async () => {
    const voucher = (await new DemoVoucherDetailsRepository(() => 1000000).findById('zara'))!
    expect(voucherPurchasePreviewController(voucher, 1000000, false).success).toBe(true)
    expect(voucherPurchasePreviewController(voucher, 1000000, true)).toMatchObject({ success: false, error: { code: 'NOT_AVAILABLE' } })
  })
})

describe('share helpers', () => {
  const url = 'https://example.test/vouchers/zara?ref=a&b=1', title = 'Zara & MAP'
  it('encodes actual URLs and titles for all share shortcuts', () => {
    const links = buildVoucherShareLinks(url, title)
    expect(new URL(links.whatsapp).searchParams.get('text')).toBe(`${title} ${url}`)
    expect(new URL(links.telegram).searchParams.get('url')).toBe(url)
    expect(new URL(links.telegram).searchParams.get('text')).toBe(title)
    expect(new URL(links.x).searchParams.get('url')).toBe(url)
    expect(() => buildVoucherShareLinks('javascript:alert(1)', title)).toThrow()
  })
  it('reports clipboard success, denial and unavailable clipboard accurately', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await copyVoucherLink({ writeText }, url)).toBe(true)
    expect(writeText).toHaveBeenCalledWith(url)
    expect(await copyVoucherLink(undefined, url)).toBe(false)
    expect(await copyVoucherLink({ writeText: async () => { throw new Error('Denied') } }, url)).toBe(false)
  })
})
