import type { OwnedCoupon } from '../../domain/dashboard'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { MerchantHeading } from './merchant-heading'
import { formatDashboardDate, formatRupiah } from '../lib/format'
import styles from './owned-coupon-card.module.css'

export function OwnedCouponCard({ coupon, slot, onDetails }: { coupon: OwnedCoupon; slot: number; onDetails: (coupon: OwnedCoupon) => void }) {
  return (
    <article className={styles.card}>
      <div className={styles.ribbon}><span><Icon name="task_alt" className={styles.tinyIcon} />SLOT {slot} · BERHASIL DIMILIKI</span><code>AKTIF</code></div>
      <div className={styles.body}>
        <MerchantHeading merchant={coupon.merchant} subtitle="Kuota kategori terpakai (1/1)" category={coupon.category} />
        <div className={styles.value}><div><small>Nilai Promo</small><strong>Diskon {formatRupiah(coupon.savings)}</strong></div><div><small>Status: Lunas</small><b>{formatRupiah(coupon.paid)}</b></div></div>
        <div className={styles.validity}><span>Kupon siap digunakan</span><span>s/d {formatDashboardDate(coupon.expiresAt)}</span></div>
      </div>
      <button className={styles.details} type="button" onClick={() => onDetails(coupon)}><Icon name="receipt_long" className={styles.smallIcon} />Lihat Detail Kupon</button>
    </article>
  )
}
