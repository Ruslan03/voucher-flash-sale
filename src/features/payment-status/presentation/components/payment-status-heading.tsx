import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './payment-status-heading.module.css'
export function PaymentStatusHeading({ status }: { status: 'success' | 'failed' }) {
  const success = status === 'success'
  return <header className={styles.heading} data-status={status}>
    <div className={styles.indicator}><Icon name={success ? 'check_circle' : 'error_outline'} /></div>
    <h1>{success ? 'Pembayaran Berhasil! Kupon Telah Diamankan' : 'Transaksi Tidak Berhasil'}</h1>
    <p>{success ? 'Kupon flash sale Anda telah berhasil diverifikasi dan disimpan ke akun PromoRush.' : 'Transaksi tidak dapat diproses oleh penyedia pembayaran atau waktu otorisasi telah berakhir.'}</p>
  </header>
}
