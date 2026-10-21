import { describe, expect, it } from 'vitest'
import {
  AuthError,
  AuthValidationError,
  InvalidOtpError,
  RateLimitedError,
  normalizePhoneNumber,
  validateOtp,
  validatePhoneNumber,
} from './auth'

describe('Auth Domain', () => {
  describe('normalizePhoneNumber', () => {
    it('normalizes international format with +62 to 08', () => {
      expect(normalizePhoneNumber('+628123456789')).toBe('08123456789')
      expect(normalizePhoneNumber('+62 812-3456-7890')).toBe('081234567890')
    })

    it('normalizes prefix 62 without plus to 08', () => {
      expect(normalizePhoneNumber('628123456789')).toBe('08123456789')
    })

    it('normalizes prefix 8 directly to 08', () => {
      expect(normalizePhoneNumber('8123456789')).toBe('08123456789')
      expect(normalizePhoneNumber('812-3456-7890')).toBe('081234567890')
    })

    it('preserves valid 08 prefix', () => {
      expect(normalizePhoneNumber('08123456789')).toBe('08123456789')
    })

    it('removes spaces, dashes, and parentheses', () => {
      expect(normalizePhoneNumber('(0812) 3456-789')).toBe('08123456789')
    })
  })

  describe('validatePhoneNumber', () => {
    it('accepts valid Indonesian phone numbers', () => {
      expect(() => validatePhoneNumber('08123456789')).not.toThrow()
      expect(() => validatePhoneNumber('0812345678901')).not.toThrow()
    })

    it('rejects empty or whitespace-only phone numbers', () => {
      expect(() => validatePhoneNumber('')).toThrow(AuthValidationError)
      expect(() => validatePhoneNumber('   ')).toThrow('Nomor telepon wajib diisi')
    })

    it('rejects phone numbers that do not start with 08', () => {
      expect(() => validatePhoneNumber('02112345678')).toThrow(
        'Nomor telepon harus dimulai dengan 08'
      )
    })

    it('rejects numbers that are too short (< 10 digits) or too long (> 15 digits)', () => {
      expect(() => validatePhoneNumber('081234567')).toThrow(
        'Nomor telepon minimal 10 digit'
      )
      expect(() => validatePhoneNumber('08123456789012345')).toThrow(
        'Nomor telepon maksimal 15 digit'
      )
    })

    it('rejects numbers containing non-numeric characters', () => {
      expect(() => validatePhoneNumber('081234abcd')).toThrow(
        'Nomor telepon hanya boleh berisi angka'
      )
    })
  })

  describe('validateOtp', () => {
    it('accepts valid 6-digit OTP', () => {
      expect(() => validateOtp('123456')).not.toThrow()
      expect(() => validateOtp('000000')).not.toThrow()
    })

    it('rejects empty or invalid length OTP', () => {
      expect(() => validateOtp('')).toThrow(AuthValidationError)
      expect(() => validateOtp('12345')).toThrow('Kode OTP harus terdiri dari 6 digit angka')
      expect(() => validateOtp('1234567')).toThrow('Kode OTP harus terdiri dari 6 digit angka')
    })

    it('rejects non-numeric OTP', () => {
      expect(() => validateOtp('12345a')).toThrow('Kode OTP harus terdiri dari 6 digit angka')
    })
  })

  describe('Domain Error Classes', () => {
    it('RateLimitedError holds retryAfter', () => {
      const err = new RateLimitedError('Too many requests', 3600)
      expect(err.name).toBe('RateLimitedError')
      expect(err.message).toBe('Too many requests')
      expect(err.retryAfter).toBe(3600)
    })

    it('InvalidOtpError holds attemptsRemaining', () => {
      const err = new InvalidOtpError('Incorrect OTP', 2)
      expect(err.name).toBe('InvalidOtpError')
      expect(err.message).toBe('Incorrect OTP')
      expect(err.attemptsRemaining).toBe(2)
    })

    it('AuthError holds error code', () => {
      const err = new AuthError('General error', 'AUTH_ERROR')
      expect(err.name).toBe('AuthError')
      expect(err.code).toBe('AUTH_ERROR')
    })
  })
})
