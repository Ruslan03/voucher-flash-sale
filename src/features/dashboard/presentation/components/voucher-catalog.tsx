import { CategoryFilter, type FilterOption } from '@/shared/presentation/components/molecules/category-filter'
import { filterDashboardOffers, getOfferState, type DashboardCategory, type DashboardSnapshot } from '../../domain/dashboard'
import { categories } from '../lib/categories'
import { OfferCard } from './offer-card'
import styles from './voucher-catalog.module.css'

const filters: FilterOption<DashboardCategory | 'all'>[] = [{ value: 'all', label: 'Semua Kupon', icon: 'confirmation_number' }, ...categories]

export function VoucherCatalog({ snapshot, category, now, onCategoryChange, onPurchase }: {
  snapshot: DashboardSnapshot; category: DashboardCategory | 'all'; now: number;
  onCategoryChange: (category: DashboardCategory | 'all') => void; onPurchase: (id: string) => void
}) {
  const offers = filterDashboardOffers(snapshot.offers, category)
  return <section className={styles.catalog} id="vouchers-grid" aria-labelledby="catalog-title">
    <CategoryFilter options={filters} value={category} onChange={onCategoryChange} />
    <header className={styles.header}><div><h2 id="catalog-title">Katalog Voucher Flash Sale Sedang &amp; Akan Dijual <span>{offers.length} Penawaran</span></h2><p>Pilih dan rebut voucher incaran Anda. Kuota dibatasi maks. 1 voucher per kategori per pengguna.</p></div></header>
    {offers.length ? <div className={styles.grid}>{offers.map(offer => <OfferCard key={offer.id} offer={offer} state={getOfferState(offer, snapshot, now)} onPurchase={onPurchase} />)}</div> : <div className={styles.empty}><h3>Belum ada penawaran</h3><p>Coba kategori lain atau muat ulang katalog.</p></div>}
  </section>
}
