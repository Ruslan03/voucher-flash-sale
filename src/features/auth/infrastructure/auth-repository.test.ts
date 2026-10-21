import { describe, expect, it, vi } from 'vitest'
import { ApiAuthRepository } from './api-auth-repository'
import { InvalidOtpError, RateLimitedError } from '../domain/auth'
import { HttpError, httpClient } from '@/shared/infrastructure/http/http-client'

describe('ApiAuthRepository (Production HTTP Adapter)', () => {
  it('requests OTP from API endpoint and parses response', async () => {
    const repo = new ApiAuthRepository('http://localhost:8080')
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      status: true,
      code: 'SUCCESS',
      message: 'OTP sent successfully',
      errorMessage: null,
      errorData: null,
      data: {
        expiresAt: '2026-10-21T12:01:00Z',
        cooldownSeconds: 60,
      },
    })

    const res = await repo.requestOtp('08123456789')
    expect(httpClient.post).toHaveBeenCalledWith('http://localhost:8080/auth/v1/otp/request', {
      phone: '08123456789',
    })
    expect(res.cooldownSeconds).toBe(60)
  })

  it('handles RATE_LIMITED error response from API', async () => {
    const repo = new ApiAuthRepository('http://localhost:8080')
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      status: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests',
      errorMessage: 'You have reached the maximum OTP request limit for this hour.',
      errorData: { retryAfter: 3600 },
      data: null,
    })

    await expect(repo.requestOtp('08123456789')).rejects.toThrow(RateLimitedError)
  })

  it('handles RATE_LIMITED error thrown as HttpError', async () => {
    const repo = new ApiAuthRepository('http://localhost:8080')
    vi.spyOn(httpClient, 'post').mockRejectedValueOnce(
      new HttpError(429, 'Too Many Requests', 'http://localhost:8080/auth/v1/otp/request', {
        status: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        errorMessage: 'You have reached the maximum OTP request limit for this hour.',
        errorData: { retryAfter: 3600 },
      })
    )

    await expect(repo.requestOtp('08123456789')).rejects.toThrow(RateLimitedError)
  })

  it('verifies OTP against API endpoint', async () => {
    const repo = new ApiAuthRepository('http://localhost:8080')
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      status: true,
      code: 'SUCCESS',
      message: 'Login successful',
      errorMessage: null,
      errorData: null,
      data: {
        accessToken: 'eyJhbGciOi...',
        refreshToken: 'eyJhbGciOi...',
        expiresIn: 3600,
      },
    })

    const res = await repo.verifyOtp('08123456789', '123456')
    expect(httpClient.post).toHaveBeenCalledWith('http://localhost:8080/auth/v1/otp/verify', {
      phone: '08123456789',
      otp: '123456',
    })
    expect(res.accessToken).toBe('eyJhbGciOi...')
  })

  it('handles INVALID_OTP error response from API', async () => {
    const repo = new ApiAuthRepository('http://localhost:8080')
    vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
      status: false,
      code: 'INVALID_OTP',
      message: 'Verification failed',
      errorMessage: 'The OTP you entered is incorrect. 2 attempts remaining.',
      errorData: { attemptsRemaining: 2 },
      data: {},
    })

    await expect(repo.verifyOtp('08123456789', '999999')).rejects.toThrow(InvalidOtpError)
  })
})
