import type { SaleVoucher } from '../../domain/sale-voucher'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './voucher-terms.module.css'
export function VoucherTerms({ terms }: { terms: SaleVoucher['terms'] }) {
  return <section className={styles.panel}><h2><Icon name="verified" />Terms & Conditions</h2><ol>{terms.map(term => <li key={term.title}><strong>{term.title}</strong><p>{term.description}</p></li>)}</ol></section>
}
