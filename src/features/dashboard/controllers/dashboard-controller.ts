'use server'

import { cookies } from 'next/headers'
import type { DashboardSnapshot } from '../domain/dashboard'
import { failureResult, successResult, type ActionResult } from '@/shared/domain/result'
import { createDashboardRepository } from '@/composition/registry'
import { loadDashboard } from '../use-cases/load-dashboard'

export async function getDashboardController(): Promise<ActionResult<DashboardSnapshot>> {
  try {
    let token: string | undefined
    let phone: string | undefined
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('session_token')?.value
      phone = cookieStore.get('customer_phone')?.value
    } catch {
      // Allow execution in test or non-cookie contexts
    }

    const repo = createDashboardRepository(token, phone)
    return successResult(await loadDashboard(repo))
  } catch {
    return failureResult(
      'Dashboard belum dapat dimuat. Silakan coba lagi.',
      'DASHBOARD_UNAVAILABLE'
    )
  }
}
