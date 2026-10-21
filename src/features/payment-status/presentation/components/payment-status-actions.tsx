import Link from 'next/link'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import styles from './payment-status-actions.module.css'
export function PaymentStatusActions() {
  return <nav className={styles.actions} aria-label="Navigasi setelah pembayaran"><Link href="/dashboard"><Icon name="bolt" /><span>Kembali ke Dashboard Flash Sale</span></Link></nav>
}
