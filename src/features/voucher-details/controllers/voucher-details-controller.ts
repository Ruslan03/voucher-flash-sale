'use server'

import { cookies } from 'next/headers'
import { createVoucherDetailsRepository } from '@/composition/registry'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { SaleVoucherError, type SaleVoucher } from '../domain/sale-voucher'
import { getVoucherDetails } from '../use-cases/get-voucher-details'

export async function getVoucherDetailsController(id: string): Promise<ActionResult<SaleVoucher>> {
  try {
    let token: string | undefined
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('session_token')?.value
    } catch {
      // Allow execution in test or non-cookie contexts
    }

    const repo = createVoucherDetailsRepository(token)
    return successResult(await getVoucherDetails(repo, id))
  } catch (error) {
    return error instanceof SaleVoucherError
      ? failureResult(error.message, error.code)
      : failureResult('Detail voucher belum dapat dimuat. Silakan coba lagi.', 'UNAVAILABLE')
  }
}
