export type SaleVoucherStatus = 'upcoming' | 'live' | 'sold-out' | 'ended' | 'category-used' | 'purchased'
export interface SaleVoucher {
  mode: 'preview'
  id: string
  name: string
  category: 'food' | 'fashion' | 'electronics'
  categoryLabel: string
  description: string
  faceValue: number
  price: number
  minimumTransaction: number
  validityDays: number
  merchantScope: string
  merchants: string[]
  terms: { title: string; description: string }[]
  totalQuota: number
  remainingQuota: number
  startsAt: string
  endsAt: string
  fetchedAt: string
  categoryUsed: boolean
}
export class SaleVoucherError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'SaleVoucherError' }
}
export function getSaleVoucherStatus(voucher: SaleVoucher, now: number, purchased = false): SaleVoucherStatus {
  if (purchased) return 'purchased'
  if (now >= Date.parse(voucher.endsAt)) return 'ended'
  if (voucher.remainingQuota <= 0) return 'sold-out'
  if (voucher.categoryUsed) return 'category-used'
  return now < Date.parse(voucher.startsAt) ? 'upcoming' : 'live'
}
export function getSaleVoucherPricing(voucher: SaleVoucher): { savings: number; discountPercent: number; claimedPercent: number } {
  const savings = voucher.faceValue - voucher.price
  return { savings, discountPercent: Math.round(savings / voucher.faceValue * 100), claimedPercent: Math.round((voucher.totalQuota - voucher.remainingQuota) / voucher.totalQuota * 100) }
}
