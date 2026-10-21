import { describe, expect, it, vi } from 'vitest'
import { filterDashboardOffers, getOfferState, getSessionStatus, type DashboardSnapshot } from '../domain/dashboard'
import { loadDashboard } from './load-dashboard'
import { previewPurchase } from './preview-purchase'

const start = Date.parse('2026-10-24T05:00:00Z')
export function dashboardFixture(): DashboardSnapshot {
  return { mode: 'preview', fetchedAt: new Date(start - 60000).toISOString(),
    session: { startsAt: new Date(start).toISOString(), endsAt: new Date(start + 900000).toISOString() },
    user: { phone: '+62 812-3456-7890', tier: 'Akun Demo' }, owned: [],
    offers: [{ id: 'coffee', merchant: 'Kopi', subtitle: 'Coffee', category: 'food', originalPrice: 50000, price: 5000, totalQuota: 10, remainingQuota: 4, availableAt: new Date(start).toISOString() },
      { id: 'fashion', merchant: 'Fashion', subtitle: 'Clothes', category: 'fashion', originalPrice: 200000, price: 75000, totalQuota: 10, remainingQuota: 2, availableAt: new Date(start).toISOString() }] }
}

describe('dashboard session and offer rules', () => {
  it('uses exact start/end boundaries and clamps state to ended at close', () => {
    const { session } = dashboardFixture()
    expect(getSessionStatus(session, start - 1)).toBe('upcoming')
    expect(getSessionStatus(session, start)).toBe('live')
    expect(getSessionStatus(session, start + 900000)).toBe('ended')
  })
  it('filters categories without modifying the catalog', () => {
    const { offers } = dashboardFixture()
    expect(filterDashboardOffers(offers, 'food').map(o => o.id)).toEqual(['coffee'])
    expect(filterDashboardOffers(offers, 'all')).toEqual(offers)
    expect(filterDashboardOffers([], 'electronics')).toEqual([])
    expect(offers).toHaveLength(2)
  })
  it('distinguishes upcoming, available, sold out, owned, category-used and ended', () => {
    const snapshot = dashboardFixture(), offer = snapshot.offers[0]
    expect(getOfferState(offer, snapshot, start - 1)).toBe('upcoming')
    expect(getOfferState(offer, snapshot, start)).toBe('available')
    expect(getOfferState({ ...offer, availableAt: new Date(start + 5000).toISOString() }, snapshot, start)).toBe('upcoming')
    expect(getOfferState({ ...offer, remainingQuota: 0 }, snapshot, start)).toBe('sold-out')
    const owned = { id: 'owned', offerId: 'other', code: 'DEMO', merchant: 'Other', category: 'food' as const, savings: 1, paid: 1, expiresAt: snapshot.session.endsAt }
    expect(getOfferState(offer, { ...snapshot, owned: [owned] }, start)).toBe('category-used')
    expect(getOfferState(offer, { ...snapshot, owned: [{ ...owned, offerId: offer.id }] }, start)).toBe('owned')
    expect(getOfferState(offer, snapshot, start + 900000)).toBe('ended')
  })
})

describe('dashboard integration use cases', () => {
  it('loads through the injected repository and propagates its failure', async () => {
    const snapshot = dashboardFixture(), load = vi.fn().mockResolvedValue(snapshot)
    expect(await loadDashboard({ load })).toEqual(snapshot)
    expect(load).toHaveBeenCalledTimes(1)
    await expect(loadDashboard({ load: async () => { throw new Error('Offline') } })).rejects.toThrow('Offline')
  })
  it('accepts an empty catalog and rejects invalid session/quota data', async () => {
    const snapshot = dashboardFixture()
    expect((await loadDashboard({ load: async () => ({ ...snapshot, offers: [] }) })).offers).toEqual([])
    await expect(loadDashboard({ load: async () => ({ ...snapshot, session: { ...snapshot.session, endsAt: 'bad' } }) })).rejects.toThrow('Invalid dashboard data')
    await expect(loadDashboard({ load: async () => ({ ...snapshot, offers: [{ ...snapshot.offers[0], remainingQuota: 11 }] }) })).rejects.toThrow('Invalid dashboard data')
  })
  it('creates an owned demo coupon and decrements only the selected offer without mutating input', () => {
    const snapshot = dashboardFixture(), result = previewPurchase(snapshot, 'coffee', start)
    expect(result.snapshot.owned).toHaveLength(1)
    expect(result.coupon.code).toContain('DEMO-')
    expect(result.coupon.savings).toBe(45000)
    expect(result.snapshot.offers[0].remainingQuota).toBe(3)
    expect(result.snapshot.offers[1].remainingQuota).toBe(2)
    expect(snapshot.owned).toHaveLength(0)
    expect(snapshot.offers[0].remainingQuota).toBe(4)
    expect(() => previewPurchase(result.snapshot, 'coffee', start)).toThrow()
    const sameCategory = { ...result.snapshot, offers: [...result.snapshot.offers, { ...snapshot.offers[0], id: 'second-coffee' }] }
    expect(() => previewPurchase(sameCategory, 'second-coffee', start)).toThrow()
  })
  it('blocks missing, unavailable, sold-out, closed and non-preview purchases', () => {
    const snapshot = dashboardFixture()
    expect(() => previewPurchase(snapshot, 'missing', start)).toThrow()
    expect(() => previewPurchase(snapshot, 'coffee', start - 1)).toThrow()
    expect(() => previewPurchase(snapshot, 'coffee', start + 900000)).toThrow()
    expect(() => previewPurchase({ ...snapshot, offers: [{ ...snapshot.offers[0], remainingQuota: 0 }] }, 'coffee', start)).toThrow()
    expect(() => previewPurchase({ ...snapshot, mode: 'live' as 'preview' }, 'coffee', start)).toThrow()
  })
})
