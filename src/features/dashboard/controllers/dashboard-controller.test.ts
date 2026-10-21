import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDashboardController } from './dashboard-controller'
import { DemoDashboardRepository } from '../infrastructure/demo-dashboard-repository'

const { load } = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('@/composition/registry', () => ({ createDashboardRepository: () => ({ load }) }))
beforeEach(() => { load.mockReset() })
describe('dashboard server controller', () => {
  it('returns loaded data using the composed port', async () => {
    const data = await new DemoDashboardRepository(() => 0).load()
    load.mockResolvedValue(data)
    const result = await getDashboardController()
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.offers).toHaveLength(5)
  })
  it('maps failures without exposing internal error details', async () => {
    load.mockRejectedValue(new Error('private transport details'))
    expect(await getDashboardController()).toEqual({ success: false, error: { code: 'DASHBOARD_UNAVAILABLE', message: 'Dashboard belum dapat dimuat. Silakan coba lagi.' } })
  })
})
