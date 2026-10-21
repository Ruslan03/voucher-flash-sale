import { PreviewCheckoutRepository } from '@/features/checkout/infrastructure/preview-checkout-repository'
import type { CheckoutRepository } from '@/features/checkout/use-cases/checkout-repository'
let repository: CheckoutRepository | undefined
/** Client-only composition, separated from server/API registry imports. */
export function createCheckoutPreviewRepository(): CheckoutRepository {
  if (typeof window === 'undefined') throw new Error('Checkout preview requires a browser')
  if (!repository) {
    let storage: Storage | undefined
    try { storage = window.localStorage } catch { /* Memory fallback only. */ }
    repository = new PreviewCheckoutRepository(storage)
  }
  return repository
}
