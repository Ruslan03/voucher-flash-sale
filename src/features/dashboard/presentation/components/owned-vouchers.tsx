import type { DashboardCategory, OwnedCoupon } from '../../domain/dashboard'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { OwnedCouponCard } from './owned-coupon-card'
import { EmptyCategorySlot } from './empty-category-slot'
import styles from './owned-vouchers.module.css'

const slotOrder: DashboardCategory[] = ['fashion', 'food', 'electronics']

export function OwnedVouchers({ owned, onChoose, onDetails }: { owned: OwnedCoupon[]; onChoose: (category: DashboardCategory) => void; onDetails: (coupon: OwnedCoupon) => void }) {
  return <section className={styles.section} id="owned-vouchers" aria-labelledby="owned-title">
    <header className={styles.header}><div className={styles.title}><span className={styles.mark}><Icon name="confirmation_number" className={styles.icon} /></span><h2 id="owned-title">Kupon Saya Terklaim</h2><span className={styles.count}>{owned.length} Kupon Aktif</span></div><p>Kupon flash sale yang berhasil diamankan dan siap digunakan di merchant.</p></header>
    <div className={styles.slots}>{slotOrder.map((category, index) => {
      const coupon = owned.find(item => item.category === category)
      return coupon ? <OwnedCouponCard key={category} coupon={coupon} slot={index + 1} onDetails={onDetails} /> : <EmptyCategorySlot key={category} category={category} slot={index + 1} onChoose={onChoose} />
    })}</div>
  </section>
}
