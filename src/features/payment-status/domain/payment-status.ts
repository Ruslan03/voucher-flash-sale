export type PaymentStatusRecord = {
  id: string; orderId: string; mode: 'preview' | 'live'; transactedAt: string
  paymentMethod: string; amount: number; faceValue: number
} & ({ status: 'success'; validUntil: string } | { status: 'failed'; failureReason: string })
export class PaymentStatusError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'PaymentStatusError' }
}
export function assertPaymentStatusRecord(value: unknown): asserts value is PaymentStatusRecord {
  if (!value || typeof value !== 'object') throw new PaymentStatusError('INVALID_DATA', 'Data pembayaran tidak valid.')
  const record = value as Record<string, unknown>
  const nonEmpty = (field: unknown) => typeof field === 'string' && field.trim().length > 0
  const validDate = (field: unknown) => typeof field === 'string' && Number.isFinite(Date.parse(field))
  if (!nonEmpty(record.id) || !nonEmpty(record.orderId) || !nonEmpty(record.paymentMethod) ||
      !['preview', 'live'].includes(record.mode as string) || !validDate(record.transactedAt) ||
      !Number.isSafeInteger(record.amount) || (record.amount as number) < 0 ||
      !Number.isSafeInteger(record.faceValue) || (record.faceValue as number) < (record.amount as number) ||
      (record.status !== 'success' && record.status !== 'failed') ||
      (record.status === 'success' && (!validDate(record.validUntil) || Date.parse(record.validUntil as string) <= Date.parse(record.transactedAt as string))) ||
      (record.status === 'failed' && !nonEmpty(record.failureReason))) {
    throw new PaymentStatusError('INVALID_DATA', 'Data pembayaran tidak valid.')
  }
}
