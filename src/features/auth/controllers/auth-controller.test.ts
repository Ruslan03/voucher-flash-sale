import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestOtpAction, verifyOtpAction } from './auth-controller'
import * as registry from '@/composition/registry'
import {
  InvalidOtpError,
  RateLimitedError,
} from '../domain/auth'
import type { AuthRepository } from '../use-cases/auth-repository'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}))

describe('Auth Controller / Server Actions', () => {
  const mockRepo: AuthRepository = {
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(registry, 'createAuthRepository').mockReturnValue(mockRepo)
  })

  describe('requestOtpAction', () => {
    it('returns successResult with cooldown when OTP requested successfully', async () => {
      vi.mocked(mockRepo.requestOtp).mockResolvedValueOnce({
        expiresAt: '2026-10-21T12:01:00Z',
        cooldownSeconds: 60,
      })

      const res = await requestOtpAction('08123456789')
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.cooldownSeconds).toBe(60)
        expect(res.data.expiresAt).toBe('2026-10-21T12:01:00Z')
      }
    })

    it('returns RATE_LIMITED failureResult when repository throws RateLimitedError', async () => {
      vi.mocked(mockRepo.requestOtp).mockRejectedValueOnce(
        new RateLimitedError('You have reached the maximum OTP request limit for this hour.', 3600)
      )

      const res = await requestOtpAction('08123456789')
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(typeof res.error === 'object' ? res.error.code : '').toBe('RATE_LIMITED')
        expect(typeof res.error === 'object' ? res.error.message : '').toContain(
          'maximum OTP request limit'
        )
      }
    })

    it('returns VALIDATION_ERROR failureResult for invalid phone number', async () => {
      const res = await requestOtpAction('123')
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(typeof res.error === 'object' ? res.error.code : '').toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('verifyOtpAction', () => {
    it('returns successResult with tokens on valid OTP', async () => {
      vi.mocked(mockRepo.verifyOtp).mockResolvedValueOnce({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      })

      const res = await verifyOtpAction('08123456789', '123456')
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.accessToken).toBe('mock-access-token')
      }
    })

    it('returns INVALID_OTP failureResult when OTP is incorrect', async () => {
      vi.mocked(mockRepo.verifyOtp).mockRejectedValueOnce(
        new InvalidOtpError('The OTP you entered is incorrect. 2 attempts remaining.', 2)
      )

      const res = await verifyOtpAction('08123456789', '999999')
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(typeof res.error === 'object' ? res.error.code : '').toBe('INVALID_OTP')
        expect(typeof res.error === 'object' ? res.error.message : '').toContain(
          'OTP you entered is incorrect'
        )
      }
    })

    it('returns VALIDATION_ERROR failureResult for invalid OTP format', async () => {
      const res = await verifyOtpAction('08123456789', 'abc')
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(typeof res.error === 'object' ? res.error.code : '').toBe('VALIDATION_ERROR')
      }
    })
  })
})
