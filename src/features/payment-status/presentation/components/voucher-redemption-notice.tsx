import type { PaymentStatusRecord } from '../../domain/payment-status'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { formatPaymentDate } from '../lib/format-payment-date'
import styles from './voucher-redemption-notice.module.css'
export function VoucherRedemptionNotice({ payment }: { payment: PaymentStatusRecord }) {
  if (payment.status !== 'success') return null
  return <aside className={styles.notice}><span className={styles.icon}><Icon name="qr_code_scanner" /></span><p><strong>Perhatian:</strong> Voucher berlaku hingga {formatPaymentDate(payment.validUntil, false)}. Tunjukkan QR code saat pembayaran di kasir atau masukkan kode voucher pada laman checkout aplikasi mitra.</p></aside>
}
