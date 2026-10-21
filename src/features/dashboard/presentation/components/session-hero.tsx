import type { SaleSession, SessionStatus } from '../../domain/dashboard'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { formatCountdown, formatDashboardDate } from '../lib/format'
import styles from './session-hero.module.css'

export function SessionHero({ session, now, status }: {
  session: SaleSession; now: number; status: SessionStatus
}) {
  const countdown = formatCountdown((status === 'upcoming' ? Date.parse(session.startsAt) : Date.parse(session.endsAt)) - now)
  return (
    <section className={styles.hero} data-state={status} aria-labelledby="sale-title">
      <div className={styles.copy}>
        <div className={styles.meta}><span className={styles.badge}><Icon name={status === 'ended' ? 'lock' : 'bolt'} className={styles.smallIcon} />{status === 'upcoming' ? 'Flash Sale Segera Dimulai' : status === 'live' ? 'Sesi Sedang Berlangsung' : 'Sesi Flash Sale Selesai'}</span><span>{formatDashboardDate(session.startsAt)} · {status === 'ended' ? 'Sesi ditutup' : '15 menit rush window'}</span></div>
        <h1 id="sale-title">{status === 'ended' ? 'Sesi Hari Ini Telah Berakhir' : status === 'live' ? <>Rush Window Aktif! <em>Ambil Vouchermu Sekarang</em></> : <>Kupon Belanja Kilat <em>Diskon Hingga 90%</em></>}</h1>
        {status === 'ended' && <p>Sesi flash sale telah selesai. Anda tetap dapat melihat kupon yang sudah dimiliki dan menjelajahi katalog.</p>}
        <a href="#vouchers-grid" className={styles.explore}>{status === 'live' ? 'Klaim Voucher Sekarang' : 'Eksplor Penawaran'}<Icon name="arrow_downward" className={styles.linkIcon} /></a>
      </div>
      <div className={styles.timer}>
        <p><Icon name="timer" className={styles.smallIcon} />{status === 'upcoming' ? 'Hitung Mundur Flash Sale' : status === 'live' ? 'Jendela Belanja Segera Ditutup' : 'Sesi Selesai'}</p>
        <div className={styles.digits} role="timer" aria-label={countdown}>
          {countdown.split(':').map((value, index) => <div key={index}><strong>{value}</strong><small>{['Jam', 'Menit', 'Detik'][index]}</small></div>)}
        </div>
      </div>
    </section>
  )
}
