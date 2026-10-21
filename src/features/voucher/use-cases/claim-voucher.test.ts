import { describe, it, expect, beforeEach } from 'vitest'
import { claimVoucher } from './claim-voucher'
import { VoucherNotFoundError } from './get-voucher-by-id'
import type { VoucherRepository } from './voucher-repository'
import type { Voucher } from '../domain/voucher'
import { VoucherDepletedError } from '../domain/voucher'

describe('Use Case: claimVoucher', () => {
  let mockStore: Map<string, Voucher>
  let fakeRepo: VoucherRepository

  const sampleVoucher: Voucher = {
    id: 'v-100',
    code: 'MIDNIGHT70',
    title: 'Midnight Flash 70%',
    description: 'Flash sale voucher',
    discountType: 'percentage',
    discountValue: 70,
    minPurchase: 50_000,
    maxDiscount: 35_000,
    totalQuota: 5,
    remainingQuota: 2,
    startTime: '2026-10-01T00:00:00Z',
    endTime: '2026-10-31T23:59:59Z',
    category: 'electronics',
  }

  beforeEach(() => {
    mockStore = new Map()
    mockStore.set(sampleVoucher.id, { ...sampleVoucher })

    fakeRepo = {
      findAll: async () => Array.from(mockStore.values()),
      findById: async (id: string) => mockStore.get(id) ?? null,
      save: async (v: Voucher) => {
        mockStore.set(v.id, { ...v })
      },
      claimVoucher: async (id: string, userId: string) => {
        return claimVoucher(fakeRepo, id, userId)
      },
    }
  })

  it('claims voucher successfully and persists decremented quota', async () => {
    const fixedNow = new Date('2026-10-15T12:00:00Z')
    const result = await claimVoucher(fakeRepo, 'v-100', 'user-42', fixedNow)

    expect(result.remainingQuota).toBe(1)
    const stored = await fakeRepo.findById('v-100')
    expect(stored?.remainingQuota).toBe(1)
  })

  it('throws VoucherNotFoundError if voucher ID does not exist', async () => {
    await expect(claimVoucher(fakeRepo, 'v-missing', 'user-1')).rejects.toThrow(
      VoucherNotFoundError
    )
  })

  it('throws VoucherDepletedError when quota reaches 0', async () => {
    mockStore.set('v-100', { ...sampleVoucher, remainingQuota: 0 })
    const fixedNow = new Date('2026-10-15T12:00:00Z')

    await expect(claimVoucher(fakeRepo, 'v-100', 'user-1', fixedNow)).rejects.toThrow(
      VoucherDepletedError
    )
  })
})
