import type { Voucher } from '../domain/voucher'

/**
 * USE CASE / APPLICATION LAYER — Repository Port Interface
 * Abstract contract. Concrete infrastructure adapters implement this.
 */
export interface VoucherRepository {
  findAll(): Promise<Voucher[]>
  findById(id: string): Promise<Voucher | null>
  save(voucher: Voucher): Promise<void>
  claimVoucher(id: string, userId: string): Promise<Voucher>
}
