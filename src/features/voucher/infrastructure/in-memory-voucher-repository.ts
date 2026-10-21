import type { Voucher } from '../domain/voucher'
import type { VoucherRepository } from '../use-cases/voucher-repository'
import { claimVoucher } from '../use-cases/claim-voucher'
import { MOCK_VOUCHERS } from './mock-data'

// Persistent singleton in memory across hot reloads in dev
let globalMemoryStore: Voucher[] | null = null

export class InMemoryVoucherRepository implements VoucherRepository {
  private get store(): Voucher[] {
    if (!globalMemoryStore) {
      globalMemoryStore = JSON.parse(JSON.stringify(MOCK_VOUCHERS))
    }
    return globalMemoryStore!
  }

  async findAll(): Promise<Voucher[]> {
    return [...this.store]
  }

  async findById(id: string): Promise<Voucher | null> {
    const found = this.store.find((v) => v.id === id || v.code.toUpperCase() === id.toUpperCase())
    return found ? { ...found } : null
  }

  async save(voucher: Voucher): Promise<void> {
    const index = this.store.findIndex((v) => v.id === voucher.id)
    if (index >= 0) {
      this.store[index] = { ...voucher }
    } else {
      this.store.push({ ...voucher })
    }
  }

  async claimVoucher(id: string, userId: string): Promise<Voucher> {
    return claimVoucher(this, id, userId)
  }

  // Helper for testing/resetting in dev
  static resetStore(initial: Voucher[] = MOCK_VOUCHERS): void {
    globalMemoryStore = JSON.parse(JSON.stringify(initial))
  }
}
