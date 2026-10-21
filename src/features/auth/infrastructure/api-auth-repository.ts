import {
  AuthError,
  InvalidOtpError,
  RateLimitedError,
  type ApiResponse,
  type RequestOtpResponse,
  type VerifyOtpResponse,
} from '../domain/auth'
import type { AuthRepository } from '../use-cases/auth-repository'
import { HttpError, httpClient } from '@/shared/infrastructure/http/http-client'

/**
 * INFRASTRUCTURE LAYER — Real HTTP Adapter
 * Connects to external Auth API adhering to the agreed API contract.
 */
export class ApiAuthRepository implements AuthRepository {
  constructor(private readonly baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') {}

  async requestOtp(phone: string): Promise<RequestOtpResponse> {
    try {
      const res = await httpClient.post<ApiResponse<RequestOtpResponse>>(
        `${this.baseUrl}/auth/v1/otp/request`,
        { phone }
      )

      if (!res.status) {
        if (res.code === 'RATE_LIMITED') {
          const retryAfter = (res.errorData as { retryAfter?: number })?.retryAfter
          throw new RateLimitedError(res.errorMessage || res.message, retryAfter)
        }
        throw new AuthError(res.errorMessage || res.message, res.code)
      }

      return res.data
    } catch (error) {
      if (error instanceof RateLimitedError || error instanceof AuthError) {
        throw error
      }

      if (error instanceof HttpError && error.data) {
        const body = error.data as Partial<ApiResponse<unknown>>
        if (body.code === 'RATE_LIMITED') {
          const retryAfter = (body.errorData as { retryAfter?: number })?.retryAfter
          throw new RateLimitedError(body.errorMessage || body.message || error.message, retryAfter)
        }
        if (body.code) {
          throw new AuthError(body.errorMessage || body.message || error.message, body.code)
        }
      }

      throw error
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const res = await httpClient.post<ApiResponse<VerifyOtpResponse>>(
        `${this.baseUrl}/auth/v1/otp/verify`,
        { phone, otp }
      )

      if (!res.status) {
        if (res.code === 'INVALID_OTP') {
          const attempts = (res.errorData as { attemptsRemaining?: number })?.attemptsRemaining
          throw new InvalidOtpError(res.errorMessage || res.message, attempts)
        }
        throw new AuthError(res.errorMessage || res.message, res.code)
      }

      return res.data
    } catch (error) {
      if (error instanceof InvalidOtpError || error instanceof AuthError) {
        throw error
      }

      if (error instanceof HttpError && error.data) {
        const body = error.data as Partial<ApiResponse<unknown>>
        if (body.code === 'INVALID_OTP') {
          const attempts = (body.errorData as { attemptsRemaining?: number })?.attemptsRemaining
          throw new InvalidOtpError(body.errorMessage || body.message || error.message, attempts)
        }
        if (body.code) {
          throw new AuthError(body.errorMessage || body.message || error.message, body.code)
        }
      }

      throw error
    }
  }
}
