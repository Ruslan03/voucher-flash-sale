import type { CheckoutRepository } from '@/features/checkout/use-cases/checkout-repository'
import { PreviewCheckoutRepository } from '@/features/checkout/infrastructure/preview-checkout-repository'
import type { PaymentStatusRepository } from '@/features/payment-status/use-cases/payment-status-repository'
import { DemoPaymentStatusRepository } from '@/features/payment-status/infrastructure/demo-payment-status-repository'
import type { VoucherDetailsRepository } from '@/features/voucher-details/use-cases/voucher-details-repository'
import { ApiVoucherDetailsRepository } from '@/features/voucher-details/infrastructure/api-voucher-details-repository'
/**
 * COMPOSITION ROOT — Dependency Injection Registry
 * The single source of truth for instantiating infrastructure adapters
 * and binding them to use case port interfaces.
 * Production ready: strictly connects to API infrastructure adapters.
 */

import type { VoucherRepository } from '@/features/voucher/use-cases/voucher-repository'
import { ApiVoucherRepository } from '@/features/voucher/infrastructure/api-voucher-repository'
import type { DashboardRepository } from '@/features/dashboard/use-cases/dashboard-repository'
import { ApiDashboardRepository } from '@/features/dashboard/infrastructure/api-dashboard-repository'
import type { AuthRepository } from '@/features/auth/use-cases/auth-repository'
import { ApiAuthRepository } from '@/features/auth/infrastructure/api-auth-repository'

export function createDashboardRepository(token?: string, userPhone?: string): DashboardRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiDashboardRepository(baseUrl, token, userPhone)
}

export function createVoucherRepository(): VoucherRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiVoucherRepository(baseUrl)
}

export function createAuthRepository(): AuthRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiAuthRepository(baseUrl)
}

export function createVoucherDetailsRepository(token?: string): VoucherDetailsRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiVoucherDetailsRepository(baseUrl, token)
}

// /** Explicit local voucher-details preview adapter. */
// export function createVoucherDetailsRepository(): VoucherDetailsRepository { return new DemoVoucherDetailsRepository() }

/** Read-only local payment preview until the backend contract is agreed. */
export function createPaymentStatusRepository(): PaymentStatusRepository { return new DemoPaymentStatusRepository() }

/** Server fixture read; browser persistence is wired separately. */
export function createCheckoutRepository(): CheckoutRepository { return new PreviewCheckoutRepository() }
