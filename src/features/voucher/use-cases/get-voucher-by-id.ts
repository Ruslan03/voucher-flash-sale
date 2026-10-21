import type { Voucher } from '../domain/voucher'
import type { VoucherRepository } from './voucher-repository'

export class VoucherNotFoundError extends Error {
  constructor(id: string) {
    super(`Voucher with ID "${id}" was not found.`)
    this.name = 'VoucherNotFoundError'
  }
}

export async function getVoucherById(
  repo: VoucherRepository,
  id: string
): Promise<Voucher> {
  const voucher = await repo.findById(id)
  if (!voucher) {
    throw new VoucherNotFoundError(id)
  }
  return voucher
}
