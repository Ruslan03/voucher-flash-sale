'use server'
import { createPaymentStatusRepository } from '@/composition/registry'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { PaymentStatusError, type PaymentStatusRecord } from '../domain/payment-status'
import { getPaymentStatus } from '../use-cases/get-payment-status'
export async function getPaymentStatusController(id: string): Promise<ActionResult<PaymentStatusRecord>> {
  try { return successResult(await getPaymentStatus(createPaymentStatusRepository(), id)) }
  catch (error) {
    return error instanceof PaymentStatusError ? failureResult(error.message, error.code) : failureResult('Status pembayaran belum dapat dimuat. Silakan coba lagi.', 'UNAVAILABLE')
  }
}
