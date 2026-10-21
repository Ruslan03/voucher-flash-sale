import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { PhoneNumberField } from '@/shared/presentation/components/molecules/phone-number-field'
import styles from './login-form.module.css'

export function LoginForm() {
  return (
    <section className={styles.panel} aria-labelledby="login-title">
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.eyebrow}><Icon name="bolt" className={styles.accessIcon} />EXCLUSIVE FLASH ACCESS</div>
          <h2 id="login-title" className={styles.title}>Sign in to PromoRush</h2>
          <p className={styles.description}>Enter your mobile phone number to receive a one-time verification code (OTP).</p>
        </header>
        <form className={styles.form}>
          <PhoneNumberField id="phone-input" label="Mobile Phone Number" required
            hint="We'll send an SMS or WhatsApp OTP verification code." />
          <Button className={styles.submit} disabled aria-describedby="otp-status">
            Send OTP<Icon name="arrow_forward" className={styles.arrow} />
          </Button>
          <p id="otp-status" className={styles.status}>OTP delivery is not connected yet.</p>
        </form>
      </div>
    </section>
  )
}
