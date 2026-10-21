import Image from 'next/image'
import Link from 'next/link'
import avatar from '../../assets/avatar.jpg'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { formatWib } from '../lib/format'
import styles from './dashboard-header.module.css'

export function DashboardHeader({ now, user }: { now: number; user: { phone: string; tier: string } }) {
  return (
    <>
      <aside className={styles.announcement}>
        <div className={styles.announcementInner}><p><span className={styles.kilat}>Kilat WIB</span><span className={styles.announcementText}>Promo Eksklusif Setiap Jam 12:00 WIB · Kuota Sangat Terbatas</span></p>
          <span className={styles.clock}><Icon name="schedule" className={styles.clockIcon} />Waktu perangkat WIB: <time>{formatWib(now)}</time></span></div>
      </aside>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/dashboard" className={styles.brand}><span className={styles.brandMark}><Icon name="bolt" className={styles.brandIcon} /></span><span><strong>PromoRush</strong><small>Indonesia Flash Market</small></span></Link>
          <div className={styles.account}>
            <Image src={avatar} width={36} height={36} className={styles.avatar} alt="Avatar akun pengguna" />
            <div className={styles.user}><strong>{user.phone}<Icon name="verified" className={styles.verified} /></strong><small>{user.tier}</small></div>
            <details className={styles.menu}><summary aria-label="Menu akun"><Icon name="expand_more" /></summary><nav aria-label="Navigasi akun"><a href="#owned-vouchers">Kupon saya</a><a href="#vouchers-grid">Katalog voucher</a><Link href="/login">Kembali ke login</Link></nav></details>
          </div>
        </div>
      </header>
    </>
  )
}
