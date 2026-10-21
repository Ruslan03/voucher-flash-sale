import { SaleVoucherError, type SaleVoucher } from '../domain/sale-voucher'
import type { VoucherDetailsRepository } from './voucher-details-repository'

export async function getVoucherDetails(repo: VoucherDetailsRepository, id: string): Promise<SaleVoucher> {
  if (!/^[a-z0-9-]+$/.test(id)) throw new SaleVoucherError('INVALID_ID', 'ID voucher tidak valid.')
  const voucher = await repo.findById(id)
  if (!voucher) throw new SaleVoucherError('NOT_FOUND', 'Voucher tidak ditemukan.')
  if (voucher.id !== id || !voucher.name || !Number.isFinite(voucher.faceValue) || voucher.faceValue <= 0 ||
      !Number.isFinite(voucher.price) || voucher.price < 0 || voucher.price > voucher.faceValue ||
      !Number.isInteger(voucher.totalQuota) || voucher.totalQuota <= 0 || !Number.isInteger(voucher.remainingQuota) ||
      voucher.remainingQuota < 0 || voucher.remainingQuota > voucher.totalQuota ||
      !Number.isFinite(Date.parse(voucher.startsAt)) || !Number.isFinite(Date.parse(voucher.endsAt)) ||
      !Number.isFinite(Date.parse(voucher.fetchedAt)) || Date.parse(voucher.endsAt) <= Date.parse(voucher.startsAt) ||
      !Number.isFinite(voucher.minimumTransaction) || voucher.minimumTransaction < 0 || !Number.isInteger(voucher.validityDays) || voucher.validityDays <= 0) {
    throw new SaleVoucherError('INVALID_DATA', 'Data voucher tidak valid.')
  }
  return voucher
}
