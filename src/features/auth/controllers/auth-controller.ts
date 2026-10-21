'use server'

import { cookies } from 'next/headers'
import { createAuthRepository } from '@/composition/registry'
import { requestOtpUseCase } from '../use-cases/request-otp'
import { verifyOtpUseCase } from '../use-cases/verify-otp'
import {
  type ActionResult,
  failureResult,
  successResult,
} from '@/shared/domain/result'
import {
  AuthError,
  AuthValidationError,
  InvalidOtpError,
  RateLimitedError,
  type RequestOtpResponse,
  type VerifyOtpResponse,
} from '../domain/auth'

/**
 * Controller / Server Action: Request OTP verification code for customer login.
 */
export async function requestOtpAction(
  phone: string
): Promise<ActionResult<RequestOtpResponse>> {
  try {
    const repo = createAuthRepository()
    const result = await requestOtpUseCase(repo, phone)
    return successResult(result)
  } catch (error) {
    if (error instanceof RateLimitedError) {
      return failureResult(error.message, 'RATE_LIMITED')
    }
    if (error instanceof AuthValidationError) {
      return failureResult(error.message, 'VALIDATION_ERROR')
    }
    if (error instanceof AuthError) {
      return failureResult(error.message, error.code)
    }
    const message = error instanceof Error ? error.message : 'Gagal mengirim kode OTP.'
    return failureResult(message, 'OTP_REQUEST_FAILED')
  }
}

/**
 * Controller / Server Action: Validate OTP code and authenticate customer.
 * Sets secure HTTP-only session cookie upon successful verification.
 */
export async function verifyOtpAction(
  phone: string,
  otp: string
): Promise<ActionResult<VerifyOtpResponse>> {
  try {
    const repo = createAuthRepository()
    const result = await verifyOtpUseCase(repo, phone, otp)

    try {
      const cookieStore = await cookies()
      cookieStore.set('session_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: result.expiresIn,
        path: '/',
      })
    } catch {
      // Allow execution in test or non-cookie contexts
    }

    return successResult(result)
  } catch (error) {
    if (error instanceof InvalidOtpError) {
      return failureResult(error.message, 'INVALID_OTP')
    }
    if (error instanceof AuthValidationError) {
      return failureResult(error.message, 'VALIDATION_ERROR')
    }
    if (error instanceof AuthError) {
      return failureResult(error.message, error.code)
    }
    const message = error instanceof Error ? error.message : 'Gagal memverifikasi kode OTP.'
    return failureResult(message, 'OTP_VERIFY_FAILED')
  }
}
