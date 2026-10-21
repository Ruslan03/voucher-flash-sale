import { getSaleVoucherPricing, getSaleVoucherStatus, type SaleVoucher } from '../../domain/sale-voucher'
import { Button } from '@/shared/presentation/components/atoms/button'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { Progress } from '@/shared/presentation/components/atoms/progress'
import { formatRupiah, formatCountdown } from '@/shared/presentation/lib/commerce-format'
import styles from './purchase-card.module.css'
const labels = { live: 'LIVE', upcoming: 'SEGERA DIMULAI', 'sold-out': 'HABIS TERJUAL', ended: 'SESI SELESAI', 'category-used': 'KUOTA KATEGORI TERPAKAI', purchased: 'SUDAH DIMILIKI' }
export function PurchaseCard({ voucher, now, purchased, onBuy, onShare }: { voucher: SaleVoucher; now: number; purchased: boolean; onBuy: () => void; onShare: () => void }) {
  const status = getSaleVoucherStatus(voucher, now, purchased), pricing = getSaleVoucherPricing(voucher)
  return <aside className={styles.card}><div className={styles.status}><b>{labels[status]}</b>{(status === 'live' || status === 'upcoming') && <span>{status === 'upcoming' ? 'Mulai dalam' : 'Berakhir dalam'} <strong role="timer" aria-label="Waktu tersisa">{formatCountdown(Date.parse(status === 'upcoming' ? voucher.startsAt : voucher.endsAt) - now)}</strong></span>}</div>
    <p className={styles.caption}>Harga Kilat Spesial</p><div className={styles.price}>{formatRupiah(voucher.price)}</div><div className={styles.discount}><del>{formatRupiah(voucher.faceValue)}</del><b>-{pricing.discountPercent}% OFF</b></div>
    <div className={styles.stock}><div><strong>Sisa {voucher.remainingQuota.toLocaleString('id-ID')}</strong><span>/ {voucher.totalQuota.toLocaleString('id-ID')} kupon</span></div><Progress aria-label="Kuota terklaim" max={voucher.totalQuota} value={voucher.totalQuota - voucher.remainingQuota} /><small>{pricing.claimedPercent}% kuota telah terklaim</small></div>
    <Button className={styles.buy} data-purchase disabled={status !== 'live'} onClick={onBuy}><Icon name="bolt" />{status === 'live' ? 'Beli Sekarang' : labels[status]}</Button>
    <div className={styles.share}><Button variant="outline" onClick={onShare}>Bagikan Kupon Ini <Icon name="arrow_forward" /></Button></div>
    <p className={styles.preview}>Preview lokal • Tanpa pembayaran nyata</p>
  </aside>
}
