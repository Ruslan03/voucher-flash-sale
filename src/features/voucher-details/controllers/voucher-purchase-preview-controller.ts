import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { SaleVoucherError, type SaleVoucher } from '../domain/sale-voucher'
import { previewBuyVoucher, type VoucherPurchasePreview } from '../use-cases/preview-buy-voucher'

export function voucherPurchasePreviewController(voucher: SaleVoucher, now: number, purchased: boolean): ActionResult<VoucherPurchasePreview> {
  try { return successResult(previewBuyVoucher(voucher, now, purchased)) }
  catch (error) { return error instanceof SaleVoucherError ? failureResult(error.message, error.code) : failureResult('Preview pembelian gagal.', 'PREVIEW_FAILED') }
}
