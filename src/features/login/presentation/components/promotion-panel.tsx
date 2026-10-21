import { Icon, type IconName } from '@/shared/presentation/components/atoms/icon'
import { Badge } from '@/shared/presentation/components/atoms/badge'
import { VoucherShowcase } from './voucher-showcase'
import styles from './promotion-panel.module.css'

const highlights: { icon: IconName; text: string }[] = [
  { icon: 'local_fire_department', text: 'Up to 90% OFF Top Brands' },
  { icon: 'timelapse', text: '15-Minute Rush Window' },
  { icon: 'flash_on', text: 'Instant Digital Voucher Claim' },
]

export function PromotionPanel() {
  return (
    <section className={styles.panel} aria-labelledby="promotion-title">
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><Icon name="bolt" className={styles.brandIcon} /></span>
          <div><span className={styles.brandName}>PromoRush</span><span className={styles.tagline}>INDONESIA FLASH MARKET</span></div>
        </div>
        <Badge className={styles.verified}><Icon name="verified" className={styles.verifiedIcon} />Verified Platform</Badge>
      </header>
      <div className={styles.message}>
        <div className={styles.schedule}>
          <span className={styles.indicator} aria-hidden="true"><span className={styles.ping} /><span className={styles.dot} /></span>
          <span className={styles.scheduleText}><Icon name="schedule" className={styles.scheduleIcon} />Every Saturday, 12:00–12:15 WIB</span>
        </div>
        <h1 id="promotion-title" className={styles.title}>Mega Voucher<br /><span>Flash Sale</span></h1>
        <div className={styles.highlights}>
          {highlights.map(({ icon, text }) => <Badge key={icon} className={styles.highlight}><Icon name={icon} className={styles.highlightIcon} />{text}</Badge>)}
        </div>
      </div>
      <VoucherShowcase />
      <footer className={styles.footer}>
        <span className={styles.redeem}><Icon name="redeem" className={styles.redeemIcon} /></span>
        <p>Over <strong>250,000+ vouchers</strong> redeemed every Saturday across Jakarta, Surabaya, &amp; Bandung.</p>
      </footer>
    </section>
  )
}
