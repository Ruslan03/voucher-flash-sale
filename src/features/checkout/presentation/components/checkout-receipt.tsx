import { checkoutTotal, type CheckoutOrder } from '../../domain/checkout'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { CopyButton } from '@/shared/presentation/components/molecules/copy-button'
import { formatRupiah } from '@/shared/presentation/lib/commerce-format'
import { formatPaymentDate } from '@/shared/presentation/lib/format-payment-date'
import styles from './checkout-receipt.module.css'
export function CheckoutReceipt({ order }: { order: CheckoutOrder }) {
  const paid = order.status === 'success'
  return <section className={styles.receipt} aria-label="Rincian Pembayaran"><header><h2><Icon name="receipt_long" />Rincian Pembayaran</h2><span data-paid={paid}>{paid ? 'LUNAS (DEMO)' : 'MENUNGGU PEMBAYARAN'}</span></header><dl><div><dt>Order ID</dt><dd className={styles.order}><code>{order.orderId}</code><CopyButton value={order.orderId} label="Salin Order ID" /></dd></div><div><dt>Waktu Transaksi</dt><dd><time dateTime={order.createdAt}>{formatPaymentDate(order.createdAt)}</time></dd></div><div><dt>Metode Pembayaran</dt><dd>{order.method === 'xendit' ? 'Xendit (Multibank / e-Wallet)' : 'Midtrans (BCA Virtual Account / QRIS)'}</dd></div><div className={styles.total}><dt><strong>{paid ? 'Total Dibayar (Demo)' : 'Total Tagihan'}</strong><small>Hemat {formatRupiah(order.voucher.faceValue - checkoutTotal(order))}</small></dt><dd><b>{formatRupiah(checkoutTotal(order))}</b><del>{formatRupiah(order.voucher.faceValue)}</del></dd></div></dl></section>
}
