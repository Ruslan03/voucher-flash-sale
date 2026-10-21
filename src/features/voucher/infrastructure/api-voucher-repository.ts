import type { Voucher } from '../domain/voucher'
import type { VoucherRepository } from '../use-cases/voucher-repository'
import { httpClient } from '@/shared/infrastructure/http/http-client'

export class ApiVoucherRepository implements VoucherRepository {
  constructor(private readonly baseUrl: string = '/api/vouchers') {}

  async findAll(): Promise<Voucher[]> {
    return httpClient.get<Voucher[]>(this.baseUrl)
  }

  async findById(id: string): Promise<Voucher | null> {
    try {
      return await httpClient.get<Voucher>(`${this.baseUrl}/${id}`)
    } catch {
      return null
    }
  }

  async save(voucher: Voucher): Promise<void> {
    await httpClient.post(this.baseUrl, voucher)
  }

  async claimVoucher(id: string, userId: string): Promise<Voucher> {
    return httpClient.post<Voucher>(`${this.baseUrl}/${id}/claim`, { userId })
  }
}
