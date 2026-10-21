import { DashboardError, getOfferState, type DashboardSnapshot, type OwnedCoupon } from '../domain/dashboard'

export interface PreviewPurchase { snapshot: DashboardSnapshot; coupon: OwnedCoupon }
export function previewPurchase(snapshot: DashboardSnapshot, offerId: string, now: number): PreviewPurchase {
  if (snapshot.mode !== 'preview') throw new DashboardError('PREVIEW_ONLY', 'This action is available in preview mode only.')
  const offer = snapshot.offers.find(item => item.id === offerId)
  if (!offer) throw new DashboardError('NOT_FOUND', 'Voucher tidak ditemukan.')
  const state = getOfferState(offer, snapshot, now)
  if (state !== 'available') throw new DashboardError('NOT_AVAILABLE', 'Voucher tidak tersedia atau kuota kategori sudah terpakai.')
  const coupon: OwnedCoupon = {
    id: `demo-${offer.id}`, offerId: offer.id, code: `DEMO-${offer.id.toUpperCase()}`,
    merchant: offer.merchant, category: offer.category, savings: offer.originalPrice - offer.price,
    paid: offer.price, expiresAt: new Date(Date.parse(snapshot.session.endsAt) + 7 * 86400000).toISOString(),
  }
  return { coupon, snapshot: { ...snapshot, owned: [...snapshot.owned, coupon],
    offers: snapshot.offers.map(item => item.id === offerId ? { ...item, remainingQuota: item.remainingQuota - 1 } : item) } }
}
