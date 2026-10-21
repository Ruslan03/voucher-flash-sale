import { Icon } from '@/shared/presentation/components/atoms/icon'
import type { SessionStatus } from '../../domain/dashboard'
import styles from './dashboard-footer.module.css'

export function DashboardFooter({ status }: { status: SessionStatus }) {
  return <>
    <aside className={styles.mobile}><div><small>{status === 'live' ? 'Sesi Berlangsung' : status === 'ended' ? 'Sesi Selesai' : 'Sesi Segera Dimulai'}</small><strong>Kuota terbatas · Preview</strong></div><a href="#vouchers-grid"><Icon name="bolt" className={styles.icon} />Lihat Voucher</a></aside>
    <footer className={styles.footer}><div><span className={styles.brand}><span><Icon name="bolt" className={styles.brandIcon} /></span>PromoRush</span><p>© 2026 PromoRush Indonesia · Demo UI, tanpa transaksi nyata.</p></div></footer>
  </>
}
