'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { PhoneNumberField } from '@/shared/presentation/components/molecules/phone-number-field'
import { requestOtpAction, verifyOtpAction } from '@/features/auth/controllers/auth-controller'
import styles from './login-form.module.css'

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer effect for OTP resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!phone.trim()) return

    setErrorMessage(null)
    startTransition(async () => {
      const res = await requestOtpAction(phone)
      if (res.success) {
        setCooldown(res.data.cooldownSeconds || 60)
        setStep('otp')
      } else {
        const message =
          typeof res.error === 'object' ? res.error.message : res.error
        setErrorMessage(message || 'Gagal mengirim OTP. Silakan coba lagi.')
      }
    })
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return

    setErrorMessage(null)
    startTransition(async () => {
      const res = await verifyOtpAction(phone, otp)
      if (res.success) {
        setStep('success')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1500)
      } else {
        const message =
          typeof res.error === 'object' ? res.error.message : res.error
        setErrorMessage(message || 'Kode OTP tidak valid.')
      }
    })
  }

  const handleChangePhone = () => {
    setStep('phone')
    setOtp('')
    setErrorMessage(null)
  }

  if (step === 'success') {
    return (
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.content}>
          <div className={styles.successCard}>
            <Icon name="verified" className={styles.successIcon} />
            <h2 id="login-title" className={styles.title}>
              Login Berhasil!
            </h2>
            <p className={styles.description}>
              Selamat datang di PromoRush. Mengarahkan Anda ke flash sale...
            </p>
            <Button
              className={styles.submit}
              onClick={() => {
                router.push('/')
                router.refresh()
              }}
            >
              Lanjut ke Flash Sale
              <Icon name="arrow_forward" className={styles.arrow} />
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (step === 'otp') {
    return (
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.eyebrow}>
              <Icon name="verified" className={styles.accessIcon} />
              VERIFIKASI OTP
            </div>
            <h2 id="login-title" className={styles.title}>
              Masukkan Kode OTP
            </h2>
            <p className={styles.description}>
              Kode verifikasi 6 digit telah dikirimkan ke:
            </p>
            <div className={styles.phoneBadge}>
              <Icon name="smartphone" />
              <span>{phone}</span>
              <button
                type="button"
                className={styles.changeButton}
                onClick={handleChangePhone}
                aria-label="Ganti nomor telepon"
              >
                Ganti
              </button>
            </div>
          </header>

          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <div className={styles.otpField}>
              <label htmlFor="otp-input" className={styles.otpLabel}>
                Kode Verifikasi 6 Digit
              </label>
              <input
                id="otp-input"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                disabled={isPending}
                required
                aria-describedby={
                  errorMessage ? 'otp-error-status' : 'otp-help-status'
                }
                aria-invalid={errorMessage ? 'true' : undefined}
                className={styles.otpInput}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div
                id="otp-error-status"
                className={styles.errorAlert}
                role="alert"
              >
                <Icon name="info" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className={styles.resendContainer}>
              <span id="otp-help-status">Tidak menerima kode?</span>
              {cooldown > 0 ? (
                <span>Kirim ulang dalam {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={() => handleRequestOtp()}
                  disabled={isPending}
                >
                  Kirim Ulang OTP
                </button>
              )}
            </div>

            <Button
              type="submit"
              className={styles.submit}
              disabled={otp.length !== 6 || isPending}
              aria-describedby={errorMessage ? 'otp-error-status' : undefined}
            >
              {isPending ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              <Icon name="arrow_forward" className={styles.arrow} />
            </Button>
          </form>
        </div>
      </section>
    )
  }

  // Step 1: Input Phone
  return (
    <section className={styles.panel} aria-labelledby="login-title">
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <Icon name="bolt" className={styles.accessIcon} />
            EXCLUSIVE FLASH ACCESS
          </div>
          <h2 id="login-title" className={styles.title}>
            Sign in to PromoRush
          </h2>
          <p className={styles.description}>
            Enter your mobile phone number to receive a one-time verification
            code (OTP).
          </p>
        </header>

        <form className={styles.form} onSubmit={handleRequestOtp}>
          <PhoneNumberField
            id="phone-input"
            name="phone"
            label="Mobile Phone Number"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (errorMessage) setErrorMessage(null)
            }}
            disabled={isPending}
            error={errorMessage || undefined}
            hint={
              !errorMessage
                ? "We'll send an SMS or WhatsApp OTP verification code."
                : undefined
            }
          />

          <Button
            type="submit"
            className={styles.submit}
            disabled={!phone.trim() || isPending}
            aria-describedby="otp-status"
          >
            {isPending ? 'Sending OTP...' : 'Send OTP'}
            <Icon name="arrow_forward" className={styles.arrow} />
          </Button>

          <p id="otp-status" className={styles.status}>
            {errorMessage
              ? errorMessage
              : 'Gunakan nomor WhatsApp / SMS aktif untuk verifikasi OTP.'}
          </p>
        </form>
      </div>
    </section>
  )
}
