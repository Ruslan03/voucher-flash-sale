import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestOtpUseCase } from './request-otp'
import { verifyOtpUseCase } from './verify-otp'
import type { AuthRepository } from './auth-repository'
import { AuthValidationError } from '../domain/auth'

describe('Auth Use Cases', () => {
  const mockRepo: AuthRepository = {
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestOtpUseCase', () => {
    it('normalizes phone number before calling repository', async () => {
      vi.mocked(mockRepo.requestOtp).mockResolvedValueOnce({
        expiresAt: '2026-10-21T12:01:00Z',
        cooldownSeconds: 60,
      })

      const result = await requestOtpUseCase(mockRepo, '+62 812-3456-7890')

      expect(mockRepo.requestOtp).toHaveBeenCalledWith('081234567890')
      expect(result).toEqual({
        expiresAt: '2026-10-21T12:01:00Z',
        cooldownSeconds: 60,
      })
    })

    it('throws AuthValidationError when phone number is invalid without calling repo', async () => {
      await expect(requestOtpUseCase(mockRepo, '12345')).rejects.toThrow(AuthValidationError)
      expect(mockRepo.requestOtp).not.toHaveBeenCalled()
    })
  })

  describe('verifyOtpUseCase', () => {
    it('normalizes phone and validates OTP before calling repository', async () => {
      vi.mocked(mockRepo.verifyOtp).mockResolvedValueOnce({
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      })

      const result = await verifyOtpUseCase(mockRepo, '81234567890', '123456')

      expect(mockRepo.verifyOtp).toHaveBeenCalledWith('081234567890', '123456')
      expect(result.accessToken).toBe('mock-jwt-token')
    })

    it('rejects invalid OTP length before calling repository', async () => {
      await expect(verifyOtpUseCase(mockRepo, '08123456789', '123')).rejects.toThrow(
        AuthValidationError
      )
      expect(mockRepo.verifyOtp).not.toHaveBeenCalled()
    })

    it('rejects invalid phone before calling repository', async () => {
      await expect(verifyOtpUseCase(mockRepo, 'invalid', '123456')).rejects.toThrow(
        AuthValidationError
      )
      expect(mockRepo.verifyOtp).not.toHaveBeenCalled()
    })
  })
})
