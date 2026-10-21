'use server'

import type { DashboardSnapshot } from '../domain/dashboard'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { createDashboardRepository } from '@/composition/registry'
import { loadDashboard } from '../use-cases/load-dashboard'

export async function getDashboardController(): Promise<ActionResult<DashboardSnapshot>> {
  try { return successResult(await loadDashboard(createDashboardRepository())) }
  catch { return failureResult('Dashboard belum dapat dimuat. Silakan coba lagi.', 'DASHBOARD_UNAVAILABLE') }
}
