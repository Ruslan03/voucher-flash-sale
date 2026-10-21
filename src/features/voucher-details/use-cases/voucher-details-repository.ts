import type { SaleVoucher } from '../domain/sale-voucher'

/** Frontend read contract; map real API DTOs here once the backend contract is agreed. */
export interface VoucherDetailsRepository { findById(id: string): Promise<SaleVoucher | null> }
