/**
 * DOMAIN LAYER — Voucher Bounded Context
 * Pure TypeScript entity & business invariants.
 * Zero framework, zero external dependencies.
 */

export type DiscountType = 'percentage' | 'fixed'

export type VoucherStatus = 'active' | 'upcoming' | 'expired' | 'depleted'

export interface Voucher {
  id: string
  code: string
  title: string
  description: string
  discountType: DiscountType
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  totalQuota: number
  remainingQuota: number
  startTime: string
  endTime: string
  category: 'electronics' | 'fashion' | 'groceries' | 'general'
}

export class VoucherValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VoucherValidationError'
  }
}

export class VoucherExpiredError extends Error {
  constructor(code: string) {
    super(`Voucher "${code}" has already expired.`)
    this.name = 'VoucherExpiredError'
  }
}

export class VoucherNotStartedError extends Error {
  constructor(code: string, startTime: string) {
    super(`Voucher "${code}" is not yet active. Starts at ${startTime}.`)
    this.name = 'VoucherNotStartedError'
  }
}

export class VoucherDepletedError extends Error {
  constructor(code: string) {
    super(`Voucher "${code}" quota is completely exhausted.`)
    this.name = 'VoucherDepletedError'
  }
}

/**
 * Validates invariant rules of a voucher entity
 */
export function validateVoucher(voucher: Voucher): void {
  if (!voucher.code || voucher.code.trim().length === 0) {
    throw new VoucherValidationError('Voucher code cannot be empty.')
  }
  if (!voucher.title || voucher.title.trim().length === 0) {
    throw new VoucherValidationError('Voucher title cannot be empty.')
  }
  if (voucher.discountValue <= 0) {
    throw new VoucherValidationError('Discount value must be greater than zero.')
  }
  if (voucher.discountType === 'percentage' && voucher.discountValue > 100) {
    throw new VoucherValidationError('Percentage discount cannot exceed 100%.')
  }
  if (voucher.totalQuota <= 0) {
    throw new VoucherValidationError('Total quota must be greater than zero.')
  }
  if (voucher.remainingQuota < 0 || voucher.remainingQuota > voucher.totalQuota) {
    throw new VoucherValidationError('Remaining quota must be between 0 and total quota.')
  }
  if (new Date(voucher.startTime) >= new Date(voucher.endTime)) {
    throw new VoucherValidationError('Start time must be strictly before end time.')
  }
}

/**
 * Determines current status based on time and quota
 */
export function getVoucherStatus(voucher: Voucher, now: Date = new Date()): VoucherStatus {
  if (voucher.remainingQuota <= 0) return 'depleted'
  const currentTime = now.getTime()
  if (currentTime < new Date(voucher.startTime).getTime()) return 'upcoming'
  if (currentTime > new Date(voucher.endTime).getTime()) return 'expired'
  return 'active'
}

/**
 * Evaluates whether a user can claim this voucher right now
 */
export function canClaimVoucher(
  voucher: Voucher,
  now: Date = new Date()
): { eligible: boolean; reason?: string } {
  const status = getVoucherStatus(voucher, now)
  if (status === 'upcoming') {
    return { eligible: false, reason: 'Flash sale has not started yet.' }
  }
  if (status === 'expired') {
    return { eligible: false, reason: 'Flash sale voucher has expired.' }
  }
  if (status === 'depleted') {
    return { eligible: false, reason: 'Flash sale quota has run out.' }
  }
  return { eligible: true }
}

/**
 * Pure calculation of discount amount for a given order total
 */
export function calculateDiscount(voucher: Voucher, orderAmount: number): number {
  if (orderAmount < voucher.minPurchase) {
    return 0
  }

  let calculated =
    voucher.discountType === 'percentage'
      ? (orderAmount * voucher.discountValue) / 100
      : voucher.discountValue

  if (voucher.maxDiscount && calculated > voucher.maxDiscount) {
    calculated = voucher.maxDiscount
  }

  return Math.min(calculated, orderAmount)
}

/**
 * Pure state transition: decrements quota safely
 */
export function decrementVoucherQuota(voucher: Voucher, now: Date = new Date()): Voucher {
  const check = canClaimVoucher(voucher, now)
  if (!check.eligible) {
    const status = getVoucherStatus(voucher, now)
    if (status === 'expired') throw new VoucherExpiredError(voucher.code)
    if (status === 'upcoming') throw new VoucherNotStartedError(voucher.code, voucher.startTime)
    throw new VoucherDepletedError(voucher.code)
  }

  return {
    ...voucher,
    remainingQuota: voucher.remainingQuota - 1,
  }
}
