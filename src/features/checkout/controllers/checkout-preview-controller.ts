import { createCheckoutPreviewRepository } from '@/composition/checkout-preview-registry'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { CheckoutError, type CheckoutOrder, type PaymentMethod } from '../domain/checkout'
import { loadCheckout, startCheckout, checkCheckout } from '../use-cases/checkout-actions'
async function preview(run: () => Promise<CheckoutOrder>): Promise<ActionResult<CheckoutOrder>> {
  try { return successResult(await run()) }
  catch (error) { return error instanceof CheckoutError ? failureResult(error.message, error.code) : failureResult('Simulasi checkout belum dapat diproses.', 'PREVIEW_FAILED') }
}
export async function restoreCheckoutPreview(id: string): Promise<ActionResult<CheckoutOrder>> { return preview(() => loadCheckout(createCheckoutPreviewRepository(), id)) }
export async function startCheckoutPreview(id: string, method: PaymentMethod): Promise<ActionResult<CheckoutOrder>> { return preview(() => startCheckout(createCheckoutPreviewRepository(), id, method, Date.now())) }
export async function checkCheckoutPreview(id: string): Promise<ActionResult<CheckoutOrder>> { return preview(() => checkCheckout(createCheckoutPreviewRepository(), id, Date.now())) }
