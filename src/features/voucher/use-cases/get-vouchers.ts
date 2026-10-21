import type { Voucher } from '../domain/voucher'
import type { VoucherRepository } from './voucher-repository'

export async function getVouchers(
  repo: VoucherRepository,
  category?: string
): Promise<Voucher[]> {
  const all = await repo.findAll()
  if (!category || category === 'all') {
    return all
  }
  return all.filter((v) => v.category === category)
}
