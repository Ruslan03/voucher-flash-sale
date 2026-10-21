'use server'

import { createVoucherDetailsRepository } from '@/composition/registry'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { SaleVoucherError, type SaleVoucher } from '../domain/sale-voucher'
import { getVoucherDetails } from '../use-cases/get-voucher-details'

export async function getVoucherDetailsController(id: string): Promise<ActionResult<SaleVoucher>> {
  try { return successResult(await getVoucherDetails(createVoucherDetailsRepository(), id)) }
  catch (error) {
    return error instanceof SaleVoucherError ? failureResult(error.message, error.code) : failureResult('Detail voucher belum dapat dimuat. Silakan coba lagi.', 'UNAVAILABLE')
  }
}
