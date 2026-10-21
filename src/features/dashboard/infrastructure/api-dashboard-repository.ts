import {
  DashboardError,
  type DashboardCategory,
  type DashboardOffer,
  type DashboardSnapshot,
  type OwnedCoupon,
  type SaleSession,
} from '../domain/dashboard'
import type { DashboardRepository } from '../use-cases/dashboard-repository'
import { httpClient } from '@/shared/infrastructure/http/http-client'

export interface ApiSessionDto {
  sessionId?: string
  sessionNumber?: number
  status?: string
  opensAt?: string
  closesAt?: string
  serverTime?: string
}

export interface ApiCatalogItemDto {
  voucherProductId: string
  category: string
  name: string
  discountValue?: { amount: number; currency: string }
  price?: { amount: number; currency: string }
  minTransaction?: { amount: number; currency: string }
  stockStatus: string
  customerState?: string
  totalQuota?: number
  remainingQuota?: number
  availableAt?: string
}

export interface ApiMyVoucherDto {
  voucherId: string
  voucherCode: string
  category: string
  discountValue?: { amount: number; currency: string }
  minTransaction?: { amount: number; currency: string }
  status?: string
  expiresAt: string
}

interface ApiResponse<T> {
  status: boolean
  code?: string
  message?: string
  errorMessage?: string | null
  errorData?: unknown
  data?: T
}

export function mapBackendCategory(rawCategory: string): DashboardCategory {
  const norm = (rawCategory || '').toUpperCase()
  if (norm.includes('FOOD') || norm.includes('BEVERAGE') || norm.includes('FNB') || norm.includes('KULINER')) {
    return 'food'
  }
  if (norm.includes('FASHION') || norm.includes('LIFESTYLE') || norm.includes('CLOTH')) {
    return 'fashion'
  }
  return 'electronics'
}

/**
 * INFRASTRUCTURE LAYER — Real HTTP Adapter for Dashboard
 * Connects to external Flash Sale and Voucher APIs adhering to docs/api-contract-v1.md.
 */
export class ApiDashboardRepository implements DashboardRepository {
  constructor(
    private readonly baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '',
    private readonly token?: string,
    private readonly userPhone?: string
  ) {}

  async load(): Promise<DashboardSnapshot> {
    const headers: Record<string, string> = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let phone = this.userPhone
    if (!phone && this.token) {
      try {
        const payloadBase64 = this.token.split('.')[1]
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
          if (decoded.phone) {
            phone = decoded.phone
          }
        }
      } catch {
        // ignore decode failure
      }
    }

    const vouchersUrl = phone
      ? `${this.baseUrl}/product/v1/vouchers?phone=${encodeURIComponent(phone)}`
      : `${this.baseUrl}/product/v1/vouchers`

    try {
      const [sessionRes, catalogRes, myVouchersRes] = await Promise.all([
        httpClient
          .get<ApiResponse<ApiSessionDto>>(`${this.baseUrl}/product/v1/sessions/active`, { headers })
          .catch(err => {
            console.warn('[ApiDashboardRepository] Failed to fetch active session:', err)
            return null
          }),
        httpClient.get<ApiResponse<ApiCatalogItemDto[]>>(vouchersUrl, {
          headers,
        }),
        this.token
          ? httpClient
              .get<ApiResponse<ApiMyVoucherDto[]>>(
                `${this.baseUrl}/v1/vouchers/my?status=ACTIVE&limit=5`,
                { headers }
              )
              .catch(err => {
                console.warn('[ApiDashboardRepository] Failed to fetch my vouchers:', err)
                return { status: false, data: [] as ApiMyVoucherDto[] }
              })
          : Promise.resolve({ status: true, data: [] as ApiMyVoucherDto[] }),
      ])

      const now = Date.now()
      const sessionData = sessionRes?.data
      const serverTime =
        sessionData?.serverTime && Number.isFinite(Date.parse(sessionData.serverTime))
          ? sessionData.serverTime
          : new Date(now).toISOString()

      let startsAt = sessionData?.opensAt
      let endsAt = sessionData?.closesAt

      if (!startsAt || !Number.isFinite(Date.parse(startsAt))) {
        startsAt = new Date(now).toISOString()
      }
      if (
        !endsAt ||
        !Number.isFinite(Date.parse(endsAt)) ||
        Date.parse(endsAt) <= Date.parse(startsAt)
      ) {
        endsAt = new Date(Date.parse(startsAt) + 15 * 60 * 1000).toISOString()
      }

      const session: SaleSession = { startsAt, endsAt }

      const rawOffers = Array.isArray(catalogRes?.data) ? catalogRes.data : []
      const offers: DashboardOffer[] = rawOffers.map((item, index) => {
        const id = item.voucherProductId || `offer-${index}`
        const cat = mapBackendCategory(item.category)
        const price = typeof item.price?.amount === 'number' ? item.price.amount : 0
        const discount = typeof item.discountValue?.amount === 'number' ? item.discountValue.amount : 0

        // Ensure originalPrice >= price and finite
        const originalPrice = Math.max(
          price,
          discount > 0 ? price + discount : price * 2 || 10000
        )

        const isSoldOut = item.stockStatus === 'SOLD_OUT'
        const totalQuota =
          typeof item.totalQuota === 'number' && item.totalQuota > 0 ? item.totalQuota : 1000
        let remainingQuota =
          typeof item.remainingQuota === 'number' ? item.remainingQuota : isSoldOut ? 0 : totalQuota
        if (remainingQuota < 0) remainingQuota = 0
        if (remainingQuota > totalQuota) remainingQuota = totalQuota

        const availableAt =
          item.availableAt && Number.isFinite(Date.parse(item.availableAt))
            ? item.availableAt
            : startsAt

        const minTrx = item.minTransaction?.amount
        const subtitle = minTrx
          ? `Min. transaksi Rp${minTrx.toLocaleString('id-ID')}`
          : discount > 0
            ? `Diskon Rp${discount.toLocaleString('id-ID')}`
            : 'Voucher Flash Sale Spesial'

        return {
          id,
          merchant: item.name || `Voucher ${item.category || 'Spesial'}`,
          subtitle,
          category: cat,
          originalPrice,
          price,
          totalQuota,
          remainingQuota,
          availableAt,
        }
      })

      const rawOwned = Array.isArray(myVouchersRes?.data) ? myVouchersRes.data : []
      const owned: OwnedCoupon[] = rawOwned.map(item => {
        const cat = mapBackendCategory(item.category)
        const discount =
          typeof item.discountValue?.amount === 'number' ? item.discountValue.amount : 0
        return {
          id: item.voucherId,
          offerId: item.voucherId,
          code: item.voucherCode,
          merchant: `Voucher ${item.category}`,
          category: cat,
          savings: discount,
          paid: 0,
          expiresAt: item.expiresAt || endsAt,
        }
      })

      const user = {
        phone: this.userPhone || (this.token ? 'Pengguna Terverifikasi' : 'Tamu'),
        tier: this.token ? 'Akun Prioritas' : 'Silakan Login',
      }

      return {
        mode: 'live',
        fetchedAt: serverTime,
        session,
        user,
        offers,
        owned,
      }
    } catch (error) {
      if (error instanceof DashboardError) throw error
      throw new DashboardError(
        'DASHBOARD_API_ERROR',
        error instanceof Error ? error.message : 'Gagal memuat data dashboard.'
      )
    }
  }
}
