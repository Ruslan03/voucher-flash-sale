import type { PaymentMethod } from '../../domain/checkout'
import { PaymentMethodOption } from './payment-method-option'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './payment-method-picker.module.css'
export function PaymentMethodPicker({ value, disabled, onChange }: { value: PaymentMethod; disabled?: boolean; onChange: (method: PaymentMethod) => void }) {
  return <section className={styles.panel}><header><h2><b>1</b>Pilih Metode Pembayaran</h2><small><Icon name="bolt" />Terverifikasi Otomatis</small></header><fieldset className={styles.options}><legend>Metode Pembayaran Online</legend>{(['midtrans', 'xendit'] as const).map(method => <PaymentMethodOption key={method} method={method} selected={value === method} disabled={disabled} onChange={onChange} />)}</fieldset><div className={styles.hint}><Icon name="info" /><p><strong>{value === 'midtrans' ? 'Proses Instan QRIS & Virtual Account' : 'Penyelesaian Multibank Xendit'}</strong><span>{value === 'midtrans' ? 'Pilihan QRIS / BCA Virtual Account Midtrans.' : 'Pilihan Virtual Account Mandiri, BNI, BRI dan e-Wallet.'} Pada preview ini, tombol Bayar membuka simulasi instruksi pembayaran.</span></p></div></section>
}
