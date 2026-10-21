import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiVoucherDetailsRepository } from './api-voucher-details-repository'
import { HttpError, httpClient } from '@/shared/infrastructure/http/http-client'

vi.mock('@/shared/infrastructure/http/http-client', async () => {
  const actual = await vi.importActual<typeof import('@/shared/infrastructure/http/http-client')>(
    '@/shared/infrastructure/http/http-client'
  )
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
    },
  }
})

describe('ApiVoucherDetailsRepository', () => {
  const baseUrl = 'https://api.promorush.local'
  const mockGet = vi.mocked(httpClient.get)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockDetailSuccess = {
    status: true,
    code: 'SUCCESS',
    message: 'Voucher detail retrieved',
    data: {
      voucherProductId: 'vp_fnb',
      name: 'Voucher F&B Rp50.000',
      category: 'FOOD_BEVERAGE',
      discountValue: { amount: 50000, currency: 'IDR' },
      price: { amount: 10000, currency: 'IDR' },
      minTransaction: { amount: 100000, currency: 'IDR' },
      rules: ['Tidak dapat ditukar tunai', 'Sisa diskon hangus'],
      stockStatus: 'AVAILABLE',
      customerState: 'ELIGIBLE',
    },
  }

  const mockSession = {
    status: true,
    data: {
      sessionId: 's_01HQX',
      status: 'OPEN',
      opensAt: '2026-10-24T05:00:00Z',
      closesAt: '2026-10-24T05:15:00Z',
      serverTime: '2026-10-24T05:02:00Z',
    },
  }

  it('fetches voucher details and maps correctly', async () => {
    mockGet.mockImplementation(async (url: string) => {
      if (url.includes('/product/v1/catalog/vp_fnb')) return mockDetailSuccess
      if (url.includes('/product/v1/sessions/active')) return mockSession
      throw new Error(`Unexpected url: ${url}`)
    })

    const repo = new ApiVoucherDetailsRepository(baseUrl, 'token_xyz')
    const voucher = await repo.findById('vp_fnb')

    expect(voucher).not.toBeNull()
    expect(voucher?.id).toBe('vp_fnb')
    expect(voucher?.name).toBe('Voucher F&B Rp50.000')
    expect(voucher?.category).toBe('food')
    expect(voucher?.categoryLabel).toBe('Food & Beverage')
    expect(voucher?.price).toBe(10000)
    expect(voucher?.faceValue).toBe(60000)
    expect(voucher?.minimumTransaction).toBe(100000)
    expect(voucher?.terms).toHaveLength(2)
    expect(voucher?.terms[0].description).toBe('Tidak dapat ditukar tunai')
    expect(voucher?.startsAt).toBe('2026-10-24T05:00:00Z')
    expect(voucher?.endsAt).toBe('2026-10-24T05:15:00Z')
    expect(voucher?.categoryUsed).toBe(false)
  })

  it('maps SOLD_OUT stockStatus to 0 remainingQuota', async () => {
    mockGet.mockImplementation(async (url: string) => {
      if (url.includes('/product/v1/catalog/vp_sold')) {
        return {
          status: true,
          data: {
            ...mockDetailSuccess.data,
            voucherProductId: 'vp_sold',
            stockStatus: 'SOLD_OUT',
          },
        }
      }
      return mockSession
    })

    const repo = new ApiVoucherDetailsRepository(baseUrl)
    const voucher = await repo.findById('vp_sold')
    expect(voucher?.remainingQuota).toBe(0)
  })

  it('returns null on 404 HttpError', async () => {
    mockGet.mockImplementation(async (url: string) => {
      if (url.includes('/product/v1/catalog/unknown')) {
        throw new HttpError(404, 'Not Found', url)
      }
      return mockSession
    })

    const repo = new ApiVoucherDetailsRepository(baseUrl)
    const voucher = await repo.findById('unknown')
    expect(voucher).toBeNull()
  })

  it('returns null if response status is false or missing voucherProductId', async () => {
    mockGet.mockImplementation(async () => {
      return { status: false, code: 'NOT_FOUND', message: 'Not found', data: {} }
    })

    const repo = new ApiVoucherDetailsRepository(baseUrl)
    const voucher = await repo.findById('non_existent')
    expect(voucher).toBeNull()
  })

  it('passes getVoucherDetails use case validation', async () => {
    const { getVoucherDetails } = await import('../use-cases/get-voucher-details')
    mockGet.mockImplementation(async (url: string) => {
      if (url.includes('/product/v1/catalog/vp_fnb')) return mockDetailSuccess
      if (url.includes('/product/v1/sessions/active')) return mockSession
      throw new Error(`Unexpected url: ${url}`)
    })

    const repo = new ApiVoucherDetailsRepository(baseUrl)
    const voucher = await getVoucherDetails(repo, 'vp_fnb')
    expect(voucher.id).toBe('vp_fnb')
    expect(voucher.price).toBe(10000)
  })
})
