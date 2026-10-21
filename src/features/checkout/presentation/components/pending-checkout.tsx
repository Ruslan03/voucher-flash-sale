import type { CheckoutOrder } from '../../domain/checkout'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { ReservationCountdown } from './reservation-countdown'
import { PaymentInstructions } from './payment-instructions'
import { CheckoutReceipt } from './checkout-receipt'
import styles from './pending-checkout.module.css'
export function PendingCheckout({ order, now, busy, onCheck }: { order: CheckoutOrder; now: number; busy: boolean; onCheck: () => void }) {
  return <section className={styles.pending}><header><div className={styles.spinner}><Icon name="hourglass_top" /></div><span className={styles.order}>Order {order.orderId}</span><h1>Menunggu Konfirmasi Pembayaran</h1><p>Selesaikan pembayaran sebelum batas waktu berakhir untuk mengamankan kupon flash sale Anda.</p></header><ReservationCountdown expiresAt={order.expiresAt} now={now} /><PaymentInstructions order={order} /><CheckoutReceipt order={order} /><aside className={styles.notice}><Icon name="verified" /><p>Preview dapat dilanjutkan setelah refresh jika penyimpanan browser tersedia. Status demo diperiksa otomatis setiap 20 detik.</p></aside><Button className={styles.check} disabled={busy} onClick={onCheck}><Icon name="refresh" />{busy ? 'Memeriksa...' : 'Cek Status Pembayaran'}</Button></section>
}
