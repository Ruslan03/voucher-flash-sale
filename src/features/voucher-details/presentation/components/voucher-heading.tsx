import type { SaleVoucher } from '../../domain/sale-voucher'
import styles from './voucher-heading.module.css'
export function VoucherHeading({ voucher }: { voucher: SaleVoucher }) {
  return <header className={styles.heading}><span>{voucher.categoryLabel}</span><h1>{voucher.name}</h1><p>{voucher.description}</p></header>
}
