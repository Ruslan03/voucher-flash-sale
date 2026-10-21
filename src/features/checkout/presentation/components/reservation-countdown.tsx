import { Icon } from '@/shared/presentation/components/atoms/icon'
import { formatCountdown } from '@/shared/presentation/lib/commerce-format'
import styles from './reservation-countdown.module.css'
export function ReservationCountdown({ expiresAt, now }: { expiresAt: string; now: number }) {
  const remaining = Date.parse(expiresAt) - now, label = formatCountdown(remaining).slice(3)
  return <div className={styles.countdown} data-urgent={remaining <= 60000}><span><Icon name="alarm" />Sisa Waktu Penahanan Kuota:</span><strong role="timer" aria-label={`Sisa waktu ${label}`}>{label}</strong></div>
}
