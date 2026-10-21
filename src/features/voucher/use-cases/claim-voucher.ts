import type { Voucher } from '../domain/voucher'
import { decrementVoucherQuota } from '../domain/voucher'
import type { VoucherRepository } from './voucher-repository'
import { VoucherNotFoundError } from './get-voucher-by-id'
import { domainEventBus } from '@/shared/domain/domain-event-bus'

export async function claimVoucher(
  repo: VoucherRepository,
  voucherId: string,
  userId: string = 'guest-user',
  now: Date = new Date()
): Promise<Voucher> {
  const voucher = await repo.findById(voucherId)
  if (!voucher) {
    throw new VoucherNotFoundError(voucherId)
  }

  // Domain rule enforcement
  const updatedVoucher = decrementVoucherQuota(voucher, now)

  // Persist updated state via repository port
  await repo.save(updatedVoucher)

  // Notify decoupled listeners via domain event bus
  await domainEventBus.publish({
    eventName: 'VOUCHER_CLAIMED',
    occurredOn: new Date(),
    voucherId,
    userId,
    remainingQuota: updatedVoucher.remainingQuota,
  })

  return updatedVoucher
}
