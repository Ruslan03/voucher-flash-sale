import { normalizePhoneNumber, validatePhoneNumber } from '../domain/auth'
import type { RequestOtpResponse } from '../domain/auth'
import type { AuthRepository } from './auth-repository'

/**
 * Use Case: Request OTP for a customer mobile number.
 * Validates and normalizes phone number before calling repository port.
 */
export async function requestOtpUseCase(
  repo: AuthRepository,
  rawPhone: string
): Promise<RequestOtpResponse> {
  const normalized = normalizePhoneNumber(rawPhone)
  validatePhoneNumber(normalized)
  return repo.requestOtp(normalized)
}
