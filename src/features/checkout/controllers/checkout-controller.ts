'use server'
import { createCheckoutRepository } from '@/composition/registry'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { CheckoutError, type CheckoutOrder } from '../domain/checkout'
import { loadCheckout } from '../use-cases/checkout-actions'
export async function getCheckoutController(id: string): Promise<ActionResult<CheckoutOrder>> {
  try { return successResult(await loadCheckout(createCheckoutRepository(), id)) }
  catch (error) { return error instanceof CheckoutError ? failureResult(error.message, error.code) : failureResult('Checkout belum dapat dimuat. Silakan coba lagi.', 'UNAVAILABLE') }
}
