import type { VoucherDetailsRepository } from '@/features/voucher-details/use-cases/voucher-details-repository'
import { DemoVoucherDetailsRepository } from '@/features/voucher-details/infrastructure/demo-voucher-details-repository'
/**
 * COMPOSITION ROOT — Dependency Injection Registry
 * The single source of truth for instantiating infrastructure adapters
 * and binding them to use case port interfaces.
 * API adapters and explicitly named local preview adapters are wired here.
 */

import type { VoucherRepository } from '@/features/voucher/use-cases/voucher-repository'
import { ApiVoucherRepository } from '@/features/voucher/infrastructure/api-voucher-repository'
import type { DashboardRepository } from '@/features/dashboard/use-cases/dashboard-repository'
import { DemoDashboardRepository } from '@/features/dashboard/infrastructure/demo-dashboard-repository'

/** Explicit preview adapter until the dashboard backend contract is available. */
export function createDashboardRepository(): DashboardRepository {
  return new DemoDashboardRepository()
}
import type { AuthRepository } from '@/features/auth/use-cases/auth-repository'
import { ApiAuthRepository } from '@/features/auth/infrastructure/api-auth-repository'

export function createVoucherRepository(): VoucherRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiVoucherRepository(baseUrl)
}

export function createAuthRepository(): AuthRepository {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return new ApiAuthRepository(baseUrl)
}

/** Explicit local voucher-details preview adapter. */
export function createVoucherDetailsRepository(): VoucherDetailsRepository { return new DemoVoucherDetailsRepository() }
