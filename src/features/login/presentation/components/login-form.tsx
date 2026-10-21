'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OtpInput from 'react-otp-input'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { PhoneNumberField } from '@/shared/presentation/components/molecules/phone-number-field'
import { requestOtpAction, verifyOtpAction } from '@/features/auth/controllers/auth-controller'
import { useAppDispatch, setCredentials } from '@/composition/store'
import styles from './login-form.module.css'

function formatMaskedPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  let clean = digits
  if (clean.startsWith('62')) clean = clean.slice(2)
  else if (clean.startsWith('0')) clean = clean.slice(1)

  if (clean.length >= 7) {
    const prefix = clean.slice(0, 3)
    const suffix = clean.slice(-4)
    return `+62 ${prefix}-xxxx-${suffix}`
  }
  return `+62 ${clean || '812-xxxx-1234'}`
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams?.get('redirect') || searchParams?.get('returnUrl') || '/dashboard'
  const dispatch = useAppDispatch()
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
        dispatch(
          setCredentials({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            phone,
            expiresIn: res.data.expiresIn,
          })
        )
        setStep('success')
        setTimeout(() => {
          router.push(redirectTarget)
          router.refresh()
        }, 1200)
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
              Selamat datang di PromoRush. Mengarahkan Anda ke Dashboard...
            </p>
            <Button
              className={styles.submit}
              onClick={() => {
                router.push(redirectTarget)
                router.refresh()
              }}
            >
              Lanjut ke Dashboard
              <Icon name="arrow_forward" className={styles.arrow} />
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (step === 'otp') {
    return (
      <section className={styles.panel} aria-labelledby="verification-title">
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleChangePhone}
          >
            <Icon name="arrow_back" />
            <span>Back to login</span>
          </button>
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.eyebrow}>
              <Icon name="bolt" className={styles.accessIcon} />
              EXCLUSIVE FLASH ACCESS
            </div>
            <h2 id="verification-title" className={styles.title}>
              Enter Verification Code
            </h2>
            <p className={styles.description}>
              Code sent to{' '}
              <strong className={styles.highlightPhone}>
                {formatMaskedPhone(phone)}
              </strong>
            </p>
          </header>

          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <div>
              <label className={styles.codeLabel}>
                6-DIGIT SECURITY CODE
              </label>

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val)
                  if (errorMessage) setErrorMessage(null)
                }}
                numInputs={6}
                inputType="tel"
                skipDefaultStyles={true}
                shouldAutoFocus
                renderInput={(inputProps, index) => {
                  const isFilled = Boolean(otp[index])
                  return (
                    <input
                      {...inputProps}
                      className={`${styles.otpBox} ${
                        isFilled ? styles.otpBoxFilled : ''
                      }`}
                      aria-label={`Digit ${index + 1}`}
                    />
                  )
                }}
                containerStyle={styles.otpContainer}
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

            <div className={styles.infoBar}>
              <div className={styles.timerSection}>
                <Icon name="schedule" className={styles.timerIcon} />
                <span>Resend code in:</span>
                <span className={styles.timerBadge}>
                  {formatTimer(cooldown)}
                </span>
              </div>
              <button
                type="button"
                className={styles.smsButton}
                onClick={() => handleRequestOtp()}
                disabled={cooldown > 0 || isPending}
                title={cooldown > 0 ? `Tunggu ${cooldown} detik` : 'Kirim via SMS'}
              >
                <Icon name="sms" className={styles.smsIcon} />
                <span>Send via SMS</span>
              </button>
            </div>

            <button
              type="submit"
              className={styles.verifyButton}
              disabled={otp.length !== 6 || isPending}
            >
              <span>{isPending ? 'Verifying...' : 'Verify'}</span>
              <Icon name="lock" className={styles.lockIcon} />
            </button>

            <p className={styles.footerNote}>
              Didn&apos;t receive SMS?{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={handleChangePhone}
              >
                Change number or retry
              </button>
            </p>
          </form>
        </div>
        <div />
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
