import type { DashboardRepository } from '../use-cases/dashboard-repository'
import type { DashboardSnapshot } from '../domain/dashboard'

export class DemoDashboardRepository implements DashboardRepository {
  constructor(private readonly now: () => number = Date.now) {}
  async load(): Promise<DashboardSnapshot> {
    const now = this.now(), start = now + 23 * 60000, end = start + 15 * 60000
    const startsAt = new Date(start).toISOString()
    return {
      mode: 'preview', fetchedAt: new Date(now).toISOString(),
      session: { startsAt, endsAt: new Date(end).toISOString() },
      user: { phone: '+62 812-3456-7890', tier: 'Akun Prioritas Gold · Demo' },
      offers: [
        { id: 'kopi', merchant: 'Kopi Kenangan', subtitle: 'Kenangan Mantan & Toast', category: 'food', originalPrice: 50000, price: 5000, totalQuota: 10000, remainingQuota: 10000, availableAt: new Date(start + 5 * 60000).toISOString() },
        { id: 'zara', merchant: 'Zara / MAP', subtitle: 'Semua Outlet & App', category: 'fashion', originalPrice: 200000, price: 75000, totalQuota: 10000, remainingQuota: 3240, availableAt: startsAt },
        { id: 'tokopedia', merchant: 'Tokopedia Gadget', subtitle: 'Voucher Smartphone Official', category: 'electronics', originalPrice: 500000, price: 350000, totalQuota: 3000, remainingQuota: 1450, availableAt: startsAt },
        { id: 'mcd', merchant: "McDonald's", subtitle: 'Paket Hemat Berdua', category: 'food', originalPrice: 60000, price: 10000, totalQuota: 5000, remainingQuota: 0, availableAt: startsAt },
        { id: 'samsung', merchant: 'Samsung Authorized', subtitle: 'Galaxy Buds & Aksesoris', category: 'electronics', originalPrice: 300000, price: 100000, totalQuota: 5000, remainingQuota: 890, availableAt: startsAt },
      ],
      owned: [{ id: 'demo-uniqlo', offerId: 'uniqlo', code: 'DEMO-PR-UQ882', merchant: 'Uniqlo', category: 'fashion', savings: 70000, paid: 30000, expiresAt: new Date(end + 7 * 86400000).toISOString() }],
    }
  }
}
