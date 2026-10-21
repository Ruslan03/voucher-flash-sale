import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiDashboardRepository, mapBackendCategory } from './api-dashboard-repository'
import { httpClient } from '@/shared/infrastructure/http/http-client'

vi.mock('@/shared/infrastructure/http/http-client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}))

describe('ApiDashboardRepository', () => {
  const baseUrl = 'https://api.promorush.local'
  const mockGet = vi.mocked(httpClient.get)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mapBackendCategory', () => {
    it('maps food categories correctly', () => {
      expect(mapBackendCategory('FOOD_BEVERAGE')).toBe('food')
      expect(mapBackendCategory('fnb')).toBe('food')
      expect(mapBackendCategory('KULINER')).toBe('food')
    })

    it('maps fashion categories correctly', () => {
      expect(mapBackendCategory('FASHION_LIFESTYLE')).toBe('fashion')
      expect(mapBackendCategory('clothing')).toBe('fashion')
    })

    it('maps electronics and other categories to electronics', () => {
      expect(mapBackendCategory('ELECTRONICS')).toBe('electronics')
      expect(mapBackendCategory('GADGET')).toBe('electronics')
      expect(mapBackendCategory('UNKNOWN')).toBe('electronics')
    })
  })

  describe('load', () => {
    const mockSession = {
      status: true,
      code: 'SUCCESS',
      message: 'Active session retrieved',
      data: {
        sessionId: 's_01HQX',
        sessionNumber: 1,
        status: 'OPEN',
        opensAt: '2026-10-24T05:00:00Z',
        closesAt: '2026-10-24T05:15:00Z',
        serverTime: '2026-10-24T05:02:00Z',
      },
    }

    const mockCatalog = {
      status: true,
      code: 'SUCCESS',
      message: 'Catalog retrieved',
      data: [
        {
          voucherProductId: 'vp_fnb',
          category: 'FOOD_BEVERAGE',
          name: 'Voucher F&B Rp50.000',
          discountValue: { amount: 50000, currency: 'IDR' },
          price: { amount: 10000, currency: 'IDR' },
          minTransaction: { amount: 100000, currency: 'IDR' },
          stockStatus: 'AVAILABLE',
          customerState: 'ELIGIBLE',
        },
        {
          voucherProductId: 'vp_fashion',
          category: 'FASHION_LIFESTYLE',
          name: 'Voucher Fashion Rp200.000',
          discountValue: { amount: 200000, currency: 'IDR' },
          price: { amount: 50000, currency: 'IDR' },
          minTransaction: { amount: 400000, currency: 'IDR' },
          stockStatus: 'SOLD_OUT',
          customerState: 'ELIGIBLE',
        },
      ],
    }

    const mockMyVouchers = {
      status: true,
      code: 'SUCCESS',
      message: 'My vouchers retrieved',
      data: [
        {
          voucherId: 'v_01HQX',
          voucherCode: 'PRM-FB-7K2M',
          category: 'FOOD_BEVERAGE',
          discountValue: { amount: 50000, currency: 'IDR' },
          minTransaction: { amount: 100000, currency: 'IDR' },
          status: 'ACTIVE',
          expiresAt: '2026-10-31T05:04:00Z',
        },
      ],
    }

    it('loads and maps dashboard data successfully with token', async () => {
      mockGet.mockImplementation(async (url: string) => {
        if (url.includes('/product/v1/sessions/active')) return mockSession
        if (url.includes('/product/v1/vouchers')) return mockCatalog
        if (url.includes('/v1/vouchers/my')) return mockMyVouchers
        throw new Error(`Unexpected url: ${url}`)
      })

      const repo = new ApiDashboardRepository(baseUrl, 'jwt_token_123', '08123456789')
      const snapshot = await repo.load()

      expect(snapshot.mode).toBe('live')
      expect(snapshot.fetchedAt).toBe('2026-10-24T05:02:00Z')
      expect(snapshot.session.startsAt).toBe('2026-10-24T05:00:00Z')
      expect(snapshot.session.endsAt).toBe('2026-10-24T05:15:00Z')
      expect(snapshot.user.phone).toBe('08123456789')

      // Offers validation
      expect(snapshot.offers).toHaveLength(2)
      const fnbOffer = snapshot.offers[0]
      expect(fnbOffer.id).toBe('vp_fnb')
      expect(fnbOffer.category).toBe('food')
      expect(fnbOffer.price).toBe(10000)
      expect(fnbOffer.originalPrice).toBe(60000) // price + discount
      expect(fnbOffer.remainingQuota).toBe(1000)

      const fashionOffer = snapshot.offers[1]
      expect(fashionOffer.id).toBe('vp_fashion')
      expect(fashionOffer.category).toBe('fashion')
      expect(fashionOffer.price).toBe(50000)
      expect(fashionOffer.remainingQuota).toBe(0) // SOLD_OUT

      // Owned coupons validation
      expect(snapshot.owned).toHaveLength(1)
      expect(snapshot.owned[0].code).toBe('PRM-FB-7K2M')
      expect(snapshot.owned[0].category).toBe('food')
      expect(snapshot.owned[0].savings).toBe(50000)
    })

    it('handles guest user without token without requesting my vouchers', async () => {
      mockGet.mockImplementation(async (url: string) => {
        if (url.includes('/product/v1/sessions/active')) return mockSession
        if (url.includes('/product/v1/vouchers')) return mockCatalog
        throw new Error(`Unexpected url: ${url}`)
      })

      const repo = new ApiDashboardRepository(baseUrl)
      const snapshot = await repo.load()

      expect(snapshot.owned).toHaveLength(0)
      expect(snapshot.user.phone).toBe('Tamu')
      expect(mockGet).not.toHaveBeenCalledWith(
        expect.stringContaining('/v1/vouchers/my'),
        expect.anything()
      )
    })

    it('gracefully handles missing session from API with default session window', async () => {
      mockGet.mockImplementation(async (url: string) => {
        if (url.includes('/product/v1/sessions/active')) return { status: false, data: null }
        if (url.includes('/product/v1/vouchers')) return { status: true, data: [] }
        return { status: true, data: [] }
      })

      const repo = new ApiDashboardRepository(baseUrl)
      const snapshot = await repo.load()

      expect(snapshot.offers).toHaveLength(0)
      expect(Number.isFinite(Date.parse(snapshot.session.startsAt))).toBe(true)
      expect(Number.isFinite(Date.parse(snapshot.session.endsAt))).toBe(true)
      expect(Date.parse(snapshot.session.endsAt)).toBeGreaterThan(
        Date.parse(snapshot.session.startsAt)
      )
    })

    it('throws DashboardError if catalog request fails', async () => {
      mockGet.mockImplementation(async (url: string) => {
        if (url.includes('/product/v1/sessions/active')) return mockSession
        if (url.includes('/product/v1/vouchers')) throw new Error('Network error')
        return { status: true, data: [] }
      })

      const repo = new ApiDashboardRepository(baseUrl)
      await expect(repo.load()).rejects.toThrow('Network error')
    })

    it('successfully passes loadDashboard use case validation', async () => {
      const { loadDashboard } = await import('../use-cases/load-dashboard')
      mockGet.mockImplementation(async (url: string) => {
        if (url.includes('/product/v1/sessions/active')) return mockSession
        if (url.includes('/product/v1/vouchers')) return mockCatalog
        if (url.includes('/v1/vouchers/my')) return mockMyVouchers
        return { status: true, data: [] }
      })

      const repo = new ApiDashboardRepository(baseUrl, 'token', '08123456789')
      const snapshot = await loadDashboard(repo)
      expect(snapshot.offers).toHaveLength(2)
      expect(snapshot.owned).toHaveLength(1)
    })
  })
})

