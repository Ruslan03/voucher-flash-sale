import type { PaymentStatusRecord } from '../domain/payment-status'
/** Frontend read port, not an agreed backend response contract. */
export interface PaymentStatusRepository { findById(id: string): Promise<PaymentStatusRecord | null> }
