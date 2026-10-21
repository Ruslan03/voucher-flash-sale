/**
 * COMPOSITION ROOT — Dependency Injection Registry
 * The single source of truth for instantiating infrastructure adapters
 * and binding them to use case port interfaces.
 */

import type { VoucherRepository } from '@/features/voucher/use-cases/voucher-repository'
import { InMemoryVoucherRepository } from '@/features/voucher/infrastructure/in-memory-voucher-repository'
import { ApiVoucherRepository } from '@/features/voucher/infrastructure/api-voucher-repository'
import type { DashboardRepository } from '@/features/dashboard/use-cases/dashboard-repository'
import { DemoDashboardRepository } from '@/features/dashboard/infrastructure/demo-dashboard-repository'

/** Explicit preview adapter until the dashboard backend contract is available. */
export function createDashboardRepository(): DashboardRepository {
  return new DemoDashboardRepository()
}

export function createVoucherRepository(): VoucherRepository {
  // During local development or when mock flag is active, use the in-memory adapter
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
    process.env.NODE_ENV !== 'production'

  if (useMocks) {
    return new InMemoryVoucherRepository()
  }

  return new ApiVoucherRepository()
}
