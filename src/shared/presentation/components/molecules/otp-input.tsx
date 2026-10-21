'use client'

import { useRef } from 'react'
import styles from './otp-input.module.css'

interface OtpInputProps {
  id: string
  value: readonly string[]
  onChange: (value: string[]) => void
  label: string
  length?: number
  describedBy?: string
  disabled?: boolean
  autoFocus?: boolean
}

/** Controlled digit entry. Verification and resend policy belong to the feature. */
export function OtpInput({ id, value, onChange, label, length = 6, describedBy, disabled, autoFocus }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function insert(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, length - index)
    const next = Array.from({ length }, (_, i) => value[i] ?? '')
    if (!digits) next[index] = ''
    else Array.from(digits).forEach((digit, offset) => { next[index + offset] = digit })
    onChange(next)
    if (digits) inputs.current[Math.min(index + digits.length, length - 1)]?.focus()
  }

  return (
    <fieldset className={styles.fieldset} disabled={disabled} aria-describedby={describedBy}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.digits}>
        {Array.from({ length }, (_, index) => (
          <input key={index} id={`${id}-${index}`} ref={element => { inputs.current[index] = element }}
            className={styles.digit} type="text" inputMode="numeric" pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={length}
            aria-label={`Digit ${index + 1} of ${length}`} value={value[index] ?? ''} data-filled={Boolean(value[index])}
            autoFocus={autoFocus && index === 0} onChange={() => { /* Input events also cover OTP autofill. */ }}
            onFocus={event => event.currentTarget.select()}
            onInput={event => {
              const raw = event.currentTarget.value
              event.currentTarget.value = raw.replace(/\D/g, '').slice(0, 1)
              insert(index, raw)
            }}
            onPaste={event => { event.preventDefault(); insert(index, event.clipboardData.getData('text')) }}
            onKeyDown={event => {
              if (event.key === 'Backspace') {
                event.preventDefault()
                const target = value[index] ? index : Math.max(0, index - 1)
                const next = Array.from({ length }, (_, i) => value[i] ?? '')
                next[target] = ''; onChange(next); inputs.current[target]?.focus()
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault()
                inputs.current[Math.max(0, Math.min(length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)))]?.focus()
              }
            }} />
        ))}
      </div>
    </fieldset>
  )
}
