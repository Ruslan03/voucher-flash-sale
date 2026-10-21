import type { SaleVoucher } from '../../domain/sale-voucher'
import { formatRupiah } from '@/shared/presentation/lib/commerce-format'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './voucher-specifications.module.css'
export function VoucherSpecifications({ voucher }: { voucher: SaleVoucher }) {
  return <section className={styles.panel} aria-label="Spesifikasi voucher"><div className={styles.tiles}>
    <div><Icon name="receipt_long" /><span>MINIMUM TRANSAKSI</span><strong>{formatRupiah(voucher.minimumTransaction)}</strong></div>
    <div><Icon name="schedule" /><span>MASA BERLAKU</span><strong>{voucher.validityDays} Hari</strong><small>Sejak voucher diterbitkan</small></div>
    </div><h2>Cakupan Merchant</h2><p>{voucher.merchantScope}</p><div className={styles.merchants}>{voucher.merchants.map(merchant => <span key={merchant}>{merchant}</span>)}</div></section>
}
