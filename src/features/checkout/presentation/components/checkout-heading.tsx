import type { CheckoutOrder } from '../../domain/checkout'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './checkout-heading.module.css'
export function CheckoutHeading({ order }: { order: CheckoutOrder }) {
  return <header className={styles.heading}><div><h1>Checkout &amp; Pembayaran Kilat</h1><p>Selesaikan pembayaran sebelum batas waktu reservasi berakhir.</p></div><span className={styles.reservation}><Icon name="lock_clock" />Reservasi Kuota ID: {order.reservationId}</span></header>
}
