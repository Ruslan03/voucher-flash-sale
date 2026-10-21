import type { DashboardOffer, OfferState } from '../../domain/dashboard'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Progress } from '@/shared/presentation/components/atoms/progress'
import { MerchantHeading } from './merchant-heading'
import { formatRupiah } from '../lib/format'
import styles from './offer-card.module.css'

const stateLabels: Record<OfferState, string> = {
  upcoming: 'Segera tersedia', available: 'LIVE · SEDANG DISERBU', 'sold-out': 'KUOTA HABIS',
  'category-used': 'KUOTA KATEGORI TERPAKAI', owned: 'BERHASIL DIMILIKI', ended: 'SESI SELESAI',
}

export function OfferCard({ offer, state, onPurchase }: { offer: DashboardOffer; state: OfferState; onPurchase: (id: string) => void }) {
  const buttonLabel = state === 'available' ? `Beli Voucher ${formatRupiah(offer.price)}` : state === 'upcoming' ? 'Belum Dimulai' : state === 'sold-out' ? 'Habis Terjual' : state === 'category-used' ? 'Kuota kategori terpakai' : state === 'owned' ? 'Sudah dimiliki' : 'Sesi selesai'
  return (
    <article className={styles.card} data-state={state} data-offer-id={offer.id}>
      <div className={styles.ribbon}><span>{stateLabels[state]}</span><span>{state === 'available' ? 'Kuota terbatas' : 'Preview'}</span></div>
      <div className={styles.body}>
        <MerchantHeading merchant={offer.merchant} subtitle={offer.subtitle} category={offer.category} />
        <div className={styles.price}><div><small>Nilai Promo</small><strong>Hemat {formatRupiah(offer.originalPrice - offer.price)}</strong></div><div><del>{formatRupiah(offer.originalPrice)}</del><b>Bayar {formatRupiah(offer.price)}</b></div></div>
        <div className={styles.stock}><span>{state === 'sold-out' ? 'Seluruh kuota telah terklaim' : `Sisa ${offer.remainingQuota.toLocaleString('id-ID')} / ${offer.totalQuota.toLocaleString('id-ID')} kupon`}</span><Progress aria-label={`Kuota terpakai ${offer.merchant}`} value={offer.totalQuota - offer.remainingQuota} max={offer.totalQuota} /></div>
      </div>
      <div className={styles.bottom}><Button className={styles.action} disabled={state !== 'available'} onClick={() => onPurchase(offer.id)}><Icon name={state === 'available' ? 'bolt' : 'lock'} className={styles.actionIcon} />{buttonLabel}</Button></div>
    </article>
  )
}
