export type DashboardCategory = 'food' | 'fashion' | 'electronics'
export type SessionStatus = 'upcoming' | 'live' | 'ended'
export type OfferState = 'upcoming' | 'available' | 'sold-out' | 'category-used' | 'owned' | 'ended'

export interface SaleSession { startsAt: string; endsAt: string }
export interface DashboardOffer {
  id: string
  merchant: string
  subtitle: string
  category: DashboardCategory
  originalPrice: number
  price: number
  totalQuota: number
  remainingQuota: number
  availableAt: string
}
export interface OwnedCoupon {
  id: string
  offerId: string
  code: string
  merchant: string
  category: DashboardCategory
  savings: number
  paid: number
  expiresAt: string
}
export interface DashboardSnapshot {
  mode: 'preview'
  fetchedAt: string
  session: SaleSession
  user: { phone: string; tier: string }
  offers: DashboardOffer[]
  owned: OwnedCoupon[]
}

export class DashboardError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'DashboardError' }
}

export function getSessionStatus(session: SaleSession, now: number): SessionStatus {
  if (now < Date.parse(session.startsAt)) return 'upcoming'
  return now >= Date.parse(session.endsAt) ? 'ended' : 'live'
}

export function getOfferState(offer: DashboardOffer, snapshot: DashboardSnapshot, now: number): OfferState {
  if (snapshot.owned.some(coupon => coupon.offerId === offer.id)) return 'owned'
  if (getSessionStatus(snapshot.session, now) === 'ended') return 'ended'
  if (offer.remainingQuota <= 0) return 'sold-out'
  if (snapshot.owned.some(coupon => coupon.category === offer.category)) return 'category-used'
  if (getSessionStatus(snapshot.session, now) === 'upcoming' || now < Date.parse(offer.availableAt)) return 'upcoming'
  return 'available'
}

export function filterDashboardOffers(offers: DashboardOffer[], category: DashboardCategory | 'all'): DashboardOffer[] {
  return category === 'all' ? offers : offers.filter(offer => offer.category === category)
}
