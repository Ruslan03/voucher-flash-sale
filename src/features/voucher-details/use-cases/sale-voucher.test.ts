import { describe, expect, it, vi } from 'vitest'
import { getSaleVoucherPricing, getSaleVoucherStatus, type SaleVoucher } from '../domain/sale-voucher'
import { getVoucherDetails } from './get-voucher-details'
import { previewBuyVoucher } from './preview-buy-voucher'

const start = Date.parse('2026-10-24T05:00:00Z'), end = start + 900000
const fixture = (): SaleVoucher => ({ mode: 'preview', id: 'zara', name: 'Zara / MAP', category: 'fashion', categoryLabel: 'Fashion & Lifestyle', description: 'Official voucher', faceValue: 200000, price: 50000, minimumTransaction: 400000, validityDays: 7, merchantScope: 'Participating stores', merchants: ['MAPClub.com'], terms: [], totalQuota: 3000, remainingQuota: 1204, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), fetchedAt: new Date(start).toISOString(), categoryUsed: false })

describe('sale voucher rules', () => {
  it('derives opening, live, exact closing, sold-out, category-used and purchased states', () => {
    const voucher = fixture()
    expect(getSaleVoucherStatus(voucher, start - 1)).toBe('upcoming')
    expect(getSaleVoucherStatus(voucher, start)).toBe('live')
    expect(getSaleVoucherStatus(voucher, end)).toBe('ended')
    expect(getSaleVoucherStatus({ ...voucher, remainingQuota: 0 }, start)).toBe('sold-out')
    expect(getSaleVoucherStatus({ ...voucher, categoryUsed: true }, start)).toBe('category-used')
    expect(getSaleVoucherStatus(voucher, start, true)).toBe('purchased')
  })
  it('calculates savings and percentages from voucher data', () => {
    expect(getSaleVoucherPricing(fixture())).toEqual({ savings: 150000, discountPercent: 75, claimedPercent: 60 })
    expect(getSaleVoucherPricing({ ...fixture(), price: 200000, remainingQuota: 3000 })).toEqual({ savings: 0, discountPercent: 0, claimedPercent: 0 })
  })
})

describe('voucher details integration functions', () => {
  it('loads only the requested ID through the injected port', async () => {
    const voucher = fixture(), findById = vi.fn().mockResolvedValue(voucher)
    expect(await getVoucherDetails({ findById }, 'zara')).toEqual(voucher)
    expect(findById).toHaveBeenCalledWith('zara')
  })
  it('rejects missing/invalid IDs, malformed data and transport failures', async () => {
    await expect(getVoucherDetails({ findById: async () => null }, 'missing')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(getVoucherDetails({ findById: async () => fixture() }, '')).rejects.toMatchObject({ code: 'INVALID_ID' })
    await expect(getVoucherDetails({ findById: async () => ({ ...fixture(), price: -1 }) }, 'zara')).rejects.toMatchObject({ code: 'INVALID_DATA' })
    await expect(getVoucherDetails({ findById: async () => ({ ...fixture(), endsAt: 'bad' }) }, 'zara')).rejects.toMatchObject({ code: 'INVALID_DATA' })
    await expect(getVoucherDetails({ findById: async () => { throw new Error('Offline') } }, 'zara')).rejects.toThrow('Offline')
  })
  it('confirms a local purchase immutably and decrements only one stock unit', () => {
    const voucher = fixture(), result = previewBuyVoucher(voucher, start, false)
    expect(result.voucher.remainingQuota).toBe(1203)
    expect(result.paid).toBe(50000)
    expect(result.confirmationId).toBe('DEMO-ZARA')
    expect(voucher.remainingQuota).toBe(1204)
  })
  it('rejects repeat purchases, unavailable status and non-preview mode', () => {
    const voucher = fixture()
    expect(() => previewBuyVoucher(voucher, start, true)).toThrow()
    expect(() => previewBuyVoucher(voucher, start - 1, false)).toThrow()
    expect(() => previewBuyVoucher(voucher, end, false)).toThrow()
    expect(() => previewBuyVoucher({ ...voucher, remainingQuota: 0 }, start, false)).toThrow()
    expect(() => previewBuyVoucher({ ...voucher, categoryUsed: true }, start, false)).toThrow()
    expect(() => previewBuyVoucher({ ...voucher, mode: 'live' as 'preview' }, start, false)).toThrow()
  })
})
