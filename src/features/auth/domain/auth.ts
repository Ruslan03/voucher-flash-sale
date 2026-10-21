/**
 * AUTH DOMAIN LAYER
 * Pure domain entities, value types, validation invariants, and error classes.
 * Free of UI, Next.js, and concrete infrastructure dependencies.
 */

export interface RequestOtpRequest {
  phone: string
}

export interface RequestOtpResponse {
  expiresAt: string
  cooldownSeconds: number
}

export interface VerifyOtpRequest {
  phone: string
  otp: string
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ApiResponse<T> {
  status: boolean
  code: string
  message: string
  errorMessage: string | null
  errorData: Record<string, unknown> | null
  data: T
}

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthValidationError'
  }
}

export class RateLimitedError extends Error {
  constructor(
    message: string = 'You have reached the maximum OTP request limit for this hour.',
    public readonly retryAfter?: number
  ) {
    super(message)
    this.name = 'RateLimitedError'
  }
}

export class InvalidOtpError extends Error {
  constructor(
    message: string = 'The OTP you entered is incorrect.',
    public readonly attemptsRemaining?: number
  ) {
    super(message)
    this.name = 'InvalidOtpError'
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AUTH_ERROR'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Normalizes user-entered Indonesian phone numbers into standardized '08...' format.
 * Examples:
 *   "+628123456789" -> "08123456789"
 *   "+62 812-3456-7890" -> "081234567890"
 *   "8123456789" -> "08123456789"
 *   "08123456789" -> "08123456789"
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return ''

  // Remove whitespace, dashes, plus sign, and parenthesis
  let cleaned = rawPhone.replace(/[\s\-\+\(\)]/g, '')

  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.slice(2)
  } else if (cleaned.startsWith('8')) {
    cleaned = '0' + cleaned
  }

  return cleaned
}

/**
 * Validates Indonesian phone numbers.
 * Invariants:
 * - Must not be empty
 * - Must contain only digits
 * - Must start with '08'
 * - Length between 10 and 15 digits
 */
export function validatePhoneNumber(phone: string): void {
  const trimmed = phone.trim()
  if (!trimmed) {
    throw new AuthValidationError('Nomor telepon wajib diisi')
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new AuthValidationError('Nomor telepon hanya boleh berisi angka')
  }

  if (!trimmed.startsWith('08')) {
    throw new AuthValidationError('Nomor telepon harus dimulai dengan 08')
  }

  if (trimmed.length < 10) {
    throw new AuthValidationError('Nomor telepon minimal 10 digit')
  }

  if (trimmed.length > 15) {
    throw new AuthValidationError('Nomor telepon maksimal 15 digit')
  }
}

/**
 * Validates 6-digit numeric OTP code.
 */
export function validateOtp(otp: string): void {
  const trimmed = otp.trim()
  if (!/^\d{6}$/.test(trimmed)) {
    throw new AuthValidationError('Kode OTP harus terdiri dari 6 digit angka')
  }
}
