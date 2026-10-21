import type { DashboardRepository } from './dashboard-repository'
import { DashboardError, type DashboardSnapshot } from '../domain/dashboard'

export async function loadDashboard(repo: DashboardRepository): Promise<DashboardSnapshot> {
  const data = await repo.load()
  const start = Date.parse(data.session.startsAt), end = Date.parse(data.session.endsAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !Number.isFinite(Date.parse(data.fetchedAt)) ||
      data.offers.some(offer => !offer.id || !Number.isFinite(Date.parse(offer.availableAt)) ||
        !Number.isInteger(offer.totalQuota) || offer.totalQuota <= 0 || !Number.isInteger(offer.remainingQuota) ||
        offer.remainingQuota < 0 || offer.remainingQuota > offer.totalQuota ||
        !Number.isFinite(offer.price) || !Number.isFinite(offer.originalPrice) || offer.price < 0 || offer.price > offer.originalPrice)) {
    throw new DashboardError('INVALID_DATA', 'Invalid dashboard data')
  }
  return data
}
