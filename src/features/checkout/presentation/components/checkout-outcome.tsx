import Link from 'next/link'
import type { CheckoutOrder } from '../../domain/checkout'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Button } from '@/shared/presentation/components/atoms/button'
import { CheckoutReceipt } from './checkout-receipt'
import styles from './checkout-outcome.module.css'
export function CheckoutOutcome({ order, state, onRetry }: { order: CheckoutOrder; state: 'success' | 'failed' | 'expired'; onRetry: () => void }) {
  return <section className={styles.outcome} data-state={state}><div className={styles.indicator}><Icon name={state === 'success' ? 'check_circle' : state === 'expired' ? 'timer_off' : 'error_outline'} /></div><h1>{state === 'success' ? 'Pembayaran Demo Berhasil' : state === 'expired' ? 'Waktu Pembayaran Habis' : 'Pembayaran Tidak Berhasil'}</h1><p>{state === 'success' ? 'Simulasi selesai. Tidak ada pembayaran atau penerbitan voucher nyata.' : state === 'expired' ? 'Batas waktu preview terlampaui. Pilih penawaran kembali dari Dashboard.' : 'Simulasi gateway timeout. Anda dapat mencoba kembali sebelum batas waktu berakhir.'}</p>{state === 'success' && <CheckoutReceipt order={order} />}<div className={styles.actions}>{state === 'failed' && <Button onClick={onRetry}>Coba Lagi</Button>}<Link href="/dashboard">Kembali ke Dashboard Flash Sale</Link></div></section>
}
