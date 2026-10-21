import { getSaleVoucherStatus, SaleVoucherError, type SaleVoucher } from '../domain/sale-voucher'

export interface VoucherPurchasePreview { voucher: SaleVoucher; confirmationId: string; paid: number }
export function previewBuyVoucher(voucher: SaleVoucher, now: number, purchased: boolean): VoucherPurchasePreview {
  if (voucher.mode !== 'preview') throw new SaleVoucherError('PREVIEW_ONLY', 'Konfirmasi ini hanya untuk preview lokal.')
  if (getSaleVoucherStatus(voucher, now, purchased) !== 'live') throw new SaleVoucherError('NOT_AVAILABLE', 'Voucher tidak tersedia untuk dibeli.')
  return { voucher: { ...voucher, remainingQuota: voucher.remainingQuota - 1 }, confirmationId: `DEMO-${voucher.id.toUpperCase()}`, paid: voucher.price }
}
