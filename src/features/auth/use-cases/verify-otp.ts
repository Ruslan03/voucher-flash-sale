import { normalizePhoneNumber, validateOtp, validatePhoneNumber } from '../domain/auth'
import type { VerifyOtpResponse } from '../domain/auth'
import type { AuthRepository } from './auth-repository'

/**
 * Use Case: Validate OTP for a customer phone number.
 * Validates inputs before calling repository port.
 */
export async function verifyOtpUseCase(
  repo: AuthRepository,
  rawPhone: string,
  rawOtp: string
): Promise<VerifyOtpResponse> {
  const normalizedPhone = normalizePhoneNumber(rawPhone)
  validatePhoneNumber(normalizedPhone)
  validateOtp(rawOtp)
  return repo.verifyOtp(normalizedPhone, rawOtp.trim())
}
