'use client'

import { useState } from 'react'
import { OtpInput } from '@/shared/presentation/components/molecules/otp-input'
import styles from './otp-input-demo.module.css'

export function OtpInputDemo() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  return <div className={styles.demo}><OtpInput id="ds-otp" value={digits} onChange={setDigits} label="6-Digit Security Code" describedBy="ds-otp-hint" /><p id="ds-otp-hint" className={styles.hint}>Try typing or pasting six digits. This input does not verify a code.</p></div>
}
