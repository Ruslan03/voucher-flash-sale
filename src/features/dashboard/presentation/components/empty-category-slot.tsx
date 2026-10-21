import type { DashboardCategory } from '../../domain/dashboard'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { categories } from '../lib/categories'
import styles from './empty-category-slot.module.css'

export function EmptyCategorySlot({ category, slot, onChoose }: { category: DashboardCategory; slot: number; onChoose: (category: DashboardCategory) => void }) {
  const meta = categories.find(item => item.value === category)!
  return <div className={styles.slot} data-category={category}>
    <div className={styles.top}><span>SLOT {slot}: KOSONG</span><b>Tersedia</b></div>
    <div className={styles.content}><span className={styles.mark}><Icon name={meta.icon} className={styles.icon} /></span><h3>Slot Kategori {meta.label}</h3><p>Anda belum mengklaim kupon {meta.short}. Kuota 1 kupon masih terbuka.</p></div>
    <a href="#vouchers-grid" className={styles.choose} onClick={() => onChoose(category)}><Icon name="add_circle" className={styles.smallIcon} />Pilih Voucher {meta.short}</a>
  </div>
}
