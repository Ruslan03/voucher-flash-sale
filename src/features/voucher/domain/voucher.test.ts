import { describe, it, expect } from 'vitest'
import {
  type Voucher,
  validateVoucher,
  calculateDiscount,
  canClaimVoucher,
  decrementVoucherQuota,
  VoucherValidationError,
  VoucherDepletedError,
  VoucherExpiredError,
} from './voucher'

describe('Domain: Voucher Business Rules & Invariants', () => {
  const baseVoucher: Voucher = {
    id: 'v-1',
    code: 'FLASH50',
    title: 'Flash 50% Off Electronics',
    description: 'Special flash sale voucher',
    discountType: 'percentage',
    discountValue: 50,
    minPurchase: 100_000,
    maxDiscount: 50_000,
    totalQuota: 10,
    remainingQuota: 5,
    startTime: '2026-10-01T00:00:00Z',
    endTime: '2026-10-31T23:59:59Z',
    category: 'electronics',
  }

  it('validates a correct voucher without throwing', () => {
    expect(() => validateVoucher(baseVoucher)).not.toThrow()
  })

  it('throws VoucherValidationError if percentage exceeds 100', () => {
    const invalid = { ...baseVoucher, discountValue: 120 }
    expect(() => validateVoucher(invalid)).toThrow(VoucherValidationError)
  })

  it('throws VoucherValidationError if start time is after end time', () => {
    const invalid = {
      ...baseVoucher,
      startTime: '2026-11-01T00:00:00Z',
      endTime: '2026-10-01T00:00:00Z',
    }
    expect(() => validateVoucher(invalid)).toThrow(VoucherValidationError)
  })

  it('calculates percentage discount capped at maxDiscount', () => {
    // 50% of 200,000 is 100,000, but capped at 50,000
    const discount = calculateDiscount(baseVoucher, 200_000)
    expect(discount).toBe(50_000)
  })

  it('calculates 0 discount if order amount is below minPurchase', () => {
    const discount = calculateDiscount(baseVoucher, 50_000)
    expect(discount).toBe(0)
  })

  it('evaluates claim eligibility correctly', () => {
    const activeCheck = canClaimVoucher(baseVoucher, new Date('2026-10-15T12:00:00Z'))
    expect(activeCheck.eligible).toBe(true)

    const depletedVoucher = { ...baseVoucher, remainingQuota: 0 }
    const depletedCheck = canClaimVoucher(depletedVoucher, new Date('2026-10-15T12:00:00Z'))
    expect(depletedCheck.eligible).toBe(false)
    expect(depletedCheck.reason).toContain('quota has run out')
  })

  it('decrements quota safely on claim', () => {
    const claimed = decrementVoucherQuota(baseVoucher, new Date('2026-10-15T12:00:00Z'))
    expect(claimed.remainingQuota).toBe(4)
    expect(baseVoucher.remainingQuota).toBe(5) // Invariant: pure, non-mutating
  })

  it('throws VoucherDepletedError when attempting to claim empty quota', () => {
    const depleted = { ...baseVoucher, remainingQuota: 0 }
    expect(() => decrementVoucherQuota(depleted, new Date('2026-10-15T12:00:00Z'))).toThrow(
      VoucherDepletedError
    )
  })

  it('throws VoucherExpiredError when claiming after end time', () => {
    expect(() => decrementVoucherQuota(baseVoucher, new Date('2026-11-05T00:00:00Z'))).toThrow(
      VoucherExpiredError
    )
  })
})
