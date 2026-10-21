import type { Voucher } from '../domain/voucher'
import type { VoucherRepository } from '../use-cases/voucher-repository'
import { httpClient } from '@/shared/infrastructure/http/http-client'

export class ApiVoucherRepository implements VoucherRepository {
  constructor(private readonly baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {}

  async findAll(): Promise<Voucher[]> {
    try {
      const res = await httpClient.get<unknown>(`${this.baseUrl}/product/v1/vouchers`)
      if (Array.isArray(res)) return res as Voucher[]
      if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: unknown }).data)) {
        return (res as { data: Voucher[] }).data
      }
      return []
    } catch {
      return []
    }
  }

  async findById(id: string): Promise<Voucher | null> {
    try {
      const res = await httpClient.get<unknown>(`${this.baseUrl}/product/v1/catalog/${id}`)
      if (res && typeof res === 'object' && 'data' in res) {
        return (res as { data: Voucher }).data
      }
      return (res as Voucher) || null
    } catch {
      return null
    }
  }

  async save(voucher: Voucher): Promise<void> {
    await httpClient.post(`${this.baseUrl}/product/v1/vouchers`, voucher)
  }

  async claimVoucher(id: string, userId: string): Promise<Voucher> {
    return httpClient.post<Voucher>(`${this.baseUrl}/v1/orders`, { voucherProductId: id, userId })
  }
}
