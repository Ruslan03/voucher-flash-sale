import { assertPaymentStatusRecord, PaymentStatusError, type PaymentStatusRecord } from '../domain/payment-status'
import type { PaymentStatusRepository } from './payment-status-repository'
export async function getPaymentStatus(repository: PaymentStatusRepository, id: string): Promise<PaymentStatusRecord> {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new PaymentStatusError('INVALID_ID', 'ID transaksi tidak valid.')
  const record = await repository.findById(id)
  if (!record) throw new PaymentStatusError('NOT_FOUND', 'Transaksi tidak ditemukan.')
  assertPaymentStatusRecord(record)
  if (record.id !== id) throw new PaymentStatusError('INVALID_DATA', 'Data pembayaran tidak valid.')
  return record
}
