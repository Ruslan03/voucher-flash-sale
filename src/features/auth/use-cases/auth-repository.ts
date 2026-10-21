import type { RequestOtpResponse, VerifyOtpResponse } from '../domain/auth'

/**
 * AUTH APPLICATION LAYER — Repository Port Interface
 * Abstract contract for authentication data access.
 * Concrete infrastructure adapter (ApiAuthRepository) implements this.
 */
export interface AuthRepository {
  requestOtp(phone: string): Promise<RequestOtpResponse>
  verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse>
}
