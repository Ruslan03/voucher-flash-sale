import { describe, expect, it } from 'vitest'
import { DemoDashboardRepository } from './demo-dashboard-repository'
import { previewPurchaseController } from '../controllers/dashboard-preview-controller'
import { formatCountdown, formatDashboardDate, formatRupiah, formatWib } from '../presentation/lib/format'

describe('dashboard adapter and preview controller', () => {
  const now = Date.parse('2026-10-24T04:37:00Z')
  it('provides deterministic isolated demo data with five offers and one owned category', async () => {
    const repo = new DemoDashboardRepository(() => now), first = await repo.load()
    expect(first.offers).toHaveLength(5)
    expect(first.owned[0].merchant).toBe('Uniqlo')
    expect(first.mode).toBe('preview')
    expect(Date.parse(first.session.startsAt) - now).toBe(23 * 60000)
    first.offers[0].remainingQuota = 1
    expect((await repo.load()).offers[0].remainingQuota).toBe(10000)
  })
  it('maps demo purchase success and domain failures into ActionResult', async () => {
    const snapshot = await new DemoDashboardRepository(() => now).load(), live = Date.parse(snapshot.session.startsAt) + 60000
    const result = previewPurchaseController(snapshot, 'tokopedia', live)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.snapshot.owned).toHaveLength(2)
    const failure = previewPurchaseController(snapshot, 'missing', live)
    expect(failure).toEqual({ success: false, error: { code: 'NOT_FOUND', message: 'Voucher tidak ditemukan.' } })
  })
})

describe('dashboard display functions', () => {
  it('formats prices, countdown, dates and clock explicitly in WIB', () => {
    expect(formatRupiah(5000)).toBe('Rp5.000')
    expect(formatRupiah(0)).toBe('Rp0')
    expect(formatCountdown(23 * 60000 + 1000)).toBe('00:23:01')
    expect(formatCountdown(-1000)).toBe('00:00:00')
    expect(formatCountdown(1)).toBe('00:00:01')
    expect(formatWib(Date.parse('2026-10-24T05:00:00Z'))).toBe('12:00:00')
    expect(formatDashboardDate('2026-10-24T05:00:00Z')).toContain('24')
  })
})
