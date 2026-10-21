import { checkoutTotal, type CheckoutOrder } from '../../domain/checkout'
import { CopyButton } from '@/shared/presentation/components/molecules/copy-button'
import { formatRupiah } from '@/shared/presentation/lib/commerce-format'
import styles from './payment-instructions.module.css'
export function PaymentInstructions({ order }: { order: CheckoutOrder }) {
  return <section className={styles.panel} aria-label="Instruksi pembayaran"><header><h2>Metode: {order.method === 'xendit' ? 'Xendit Multibank / e-Wallet' : 'Midtrans QRIS / BCA VA'}</h2><b>{formatRupiah(checkoutTotal(order))}</b></header><div className={styles.account}><code>{order.virtualAccount?.replace(/(.{4})(?=.)/g, '$1 ')}</code>{order.virtualAccount && <CopyButton value={order.virtualAccount} label="Salin VA" />}</div><p>Nomor Virtual Account contoh. <strong>Jangan transfer dana.</strong> Instruksi pembayaran gateway belum terintegrasi.</p></section>
}
