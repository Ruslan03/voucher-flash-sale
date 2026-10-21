import {
  SaleVoucherError,
  type SaleVoucher,
} from '../domain/sale-voucher'
import type { VoucherDetailsRepository } from '../use-cases/voucher-details-repository'
import { HttpError, httpClient } from '@/shared/infrastructure/http/http-client'
import { mapBackendCategory } from '@/features/dashboard/infrastructure/api-dashboard-repository'

export interface ApiVoucherDetailData {
  voucherProductId: string
  name: string
  category: string
  description?: string
  discountValue?: { amount: number; currency: string }
  price?: { amount: number; currency: string }
  minTransaction?: { amount: number; currency: string }
  validityDays?: number
  merchantScope?: string
  merchants?: string[]
  rules?: string[]
  stockStatus: string
  customerState?: string
  totalQuota?: number
  remainingQuota?: number
  startsAt?: string
  endsAt?: string
}

interface ApiResponse<T> {
  status: boolean
  code?: string
  message?: string
  errorMessage?: string | null
  errorData?: unknown
  data?: T
}

interface ApiSessionData {
  sessionId?: string
  status?: string
  opensAt?: string
  closesAt?: string
  serverTime?: string
}

/**
 * INFRASTRUCTURE LAYER — Real HTTP Adapter for Voucher Details
 * Connects to external Catalog Voucher Detail API adhering to docs/api-contract-v1.md.
 */
export class ApiVoucherDetailsRepository implements VoucherDetailsRepository {
  constructor(
    private readonly baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '',
    private readonly token?: string
  ) {}

  async findById(id: string): Promise<SaleVoucher | null> {
    const headers: Record<string, string> = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const [voucherRes, sessionRes] = await Promise.all([
        httpClient
          .get<ApiResponse<ApiVoucherDetailData>>(
            `${this.baseUrl}/product/v1/catalog/${encodeURIComponent(id)}`,
            { headers }
          )
          .catch(err => {
            if (err instanceof HttpError && (err.status === 404 || err.status === 400)) {
              return null
            }
            throw err
          }),
        httpClient
          .get<ApiResponse<ApiSessionData>>(`${this.baseUrl}/product/v1/sessions/active`, {
            headers,
          })
          .catch(err => {
            console.warn('[ApiVoucherDetailsRepository] Failed to fetch session:', err)
            return null
          }),
      ])

      if (
        !voucherRes ||
        !voucherRes.status ||
        !voucherRes.data ||
        !voucherRes.data.voucherProductId
      ) {
        return null
      }

      const data = voucherRes.data
      const sessionData = sessionRes?.data
      const now = Date.now()
      const serverTime =
        sessionData?.serverTime && Number.isFinite(Date.parse(sessionData.serverTime))
          ? sessionData.serverTime
          : new Date(now).toISOString()

      let startsAt = data.startsAt || sessionData?.opensAt
      let endsAt = data.endsAt || sessionData?.closesAt

      if (!startsAt || !Number.isFinite(Date.parse(startsAt))) {
        startsAt = new Date(now - 5 * 60 * 1000).toISOString()
      }
      if (
        !endsAt ||
        !Number.isFinite(Date.parse(endsAt)) ||
        Date.parse(endsAt) <= Date.parse(startsAt)
      ) {
        endsAt = new Date(Date.parse(startsAt) + 15 * 60 * 1000).toISOString()
      }

      const cat = mapBackendCategory(data.category)
      const categoryLabel =
        cat === 'food'
          ? 'Food & Beverage'
          : cat === 'fashion'
            ? 'Fashion & Lifestyle'
            : 'Electronics & Gadgets'

      const price = typeof data.price?.amount === 'number' ? data.price.amount : 0
      const discount =
        typeof data.discountValue?.amount === 'number' ? data.discountValue.amount : 0
      const faceValue = Math.max(price, discount > 0 ? price + discount : price * 2 || 10000)

      const totalQuota =
        typeof data.totalQuota === 'number' && data.totalQuota > 0 ? data.totalQuota : 1000
      const isSoldOut = data.stockStatus === 'SOLD_OUT'
      let remainingQuota =
        typeof data.remainingQuota === 'number'
          ? data.remainingQuota
          : isSoldOut
            ? 0
            : totalQuota
      if (remainingQuota < 0) remainingQuota = 0
      if (remainingQuota > totalQuota) remainingQuota = totalQuota

      const minTrx =
        typeof data.minTransaction?.amount === 'number' ? data.minTransaction.amount : 0
      const validityDays =
        typeof data.validityDays === 'number' && data.validityDays > 0 ? data.validityDays : 7

      const terms =
        Array.isArray(data.rules) && data.rules.length
          ? data.rules.map((rule, idx) => ({
              title: `Ketentuan ${idx + 1}`,
              description: typeof rule === 'string' ? rule : JSON.stringify(rule),
            }))
          : [
              {
                title: 'Pembatasan Kuota',
                description: 'Maksimal 1 voucher per kategori per pengguna.',
              },
              {
                title: 'Ketentuan Penukaran',
                description: 'Tidak dapat ditukar dengan uang tunai.',
              },
              {
                title: 'Ketentuan Sisa Diskon',
                description: 'Sisa nilai diskon yang tidak terpakai akan hangus.',
              },
            ]

      const merchants =
        Array.isArray(data.merchants) && data.merchants.length
          ? data.merchants
          : [data.name || 'Merchant Resmi']

      return {
        mode: 'live',
        id,
        name: data.name,
        category: cat,
        categoryLabel,
        description:
          data.description ||
          'Voucher belanja resmi untuk menikmati penawaran spesial di merchant favorit Anda.',
        faceValue,
        price,
        minimumTransaction: minTrx,
        validityDays,
        merchantScope:
          data.merchantScope ||
          'Berlaku di seluruh outlet merchant resmi yang berpartisipasi.',
        merchants,
        terms,
        totalQuota,
        remainingQuota,
        startsAt,
        endsAt,
        fetchedAt: serverTime,
        categoryUsed: data.customerState === 'INELIGIBLE',
      }
    } catch (error) {
      if (error instanceof SaleVoucherError) throw error
      throw new SaleVoucherError(
        'VOUCHER_API_ERROR',
        error instanceof Error ? error.message : 'Gagal memuat detail voucher dari server.'
      )
    }
  }
}
