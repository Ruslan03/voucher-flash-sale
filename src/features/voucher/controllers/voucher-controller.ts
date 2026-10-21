'use server'

import { revalidatePath } from 'next/cache'
import { createVoucherRepository } from '@/composition/registry'
import { getVouchers } from '../use-cases/get-vouchers'
import { getVoucherById, VoucherNotFoundError } from '../use-cases/get-voucher-by-id'
import { claimVoucher } from '../use-cases/claim-voucher'
import {
  type ActionResult,
  successResult,
  failureResult,
} from '@/shared/domain/result'
import type { Voucher } from '../domain/voucher'
import {
  VoucherDepletedError,
  VoucherExpiredError,
  VoucherNotStartedError,
  VoucherValidationError,
} from '../domain/voucher'

/**
 * Controller: Retrieve list of flash sale vouchers
 */
export async function getVouchersController(
  category?: string
): Promise<ActionResult<Voucher[]>> {
  try {
    const repo = createVoucherRepository()
    const vouchers = await getVouchers(repo, category)
    return successResult(vouchers)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve vouchers.'
    return failureResult(message, 'INTERNAL_ERROR')
  }
}

/**
 * Controller: Retrieve single voucher detail
 */
export async function getVoucherByIdController(
  id: string
): Promise<ActionResult<Voucher>> {
  try {
    const repo = createVoucherRepository()
    const voucher = await getVoucherById(repo, id)
    return successResult(voucher)
  } catch (error) {
    if (error instanceof VoucherNotFoundError) {
      return failureResult(error.message, 'NOT_FOUND')
    }
    const message = error instanceof Error ? error.message : 'Internal server error.'
    return failureResult(message, 'INTERNAL_ERROR')
  }
}

/**
 * Controller / Server Action: Claim a voucher in real time
 */
export async function claimVoucherController(
  voucherId: string,
  userId: string = 'user-current'
): Promise<ActionResult<Voucher>> {
  try {
    const repo = createVoucherRepository()
    const voucher = await claimVoucher(repo, voucherId, userId)

    // Revalidate paths affected by quota changes
    revalidatePath('/')
    revalidatePath(`/vouchers/${voucherId}`)

    return successResult(voucher)
  } catch (error) {
    if (
      error instanceof VoucherNotFoundError ||
      error instanceof VoucherDepletedError ||
      error instanceof VoucherExpiredError ||
      error instanceof VoucherNotStartedError ||
      error instanceof VoucherValidationError
    ) {
      return failureResult(error.message, error.name)
    }
    const message = error instanceof Error ? error.message : 'Failed to claim voucher.'
    return failureResult(message, 'CLAIM_FAILED')
  }
}
