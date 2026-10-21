import type { DashboardCategory } from '../../domain/dashboard'
import { Icon } from '@/shared/presentation/components/atoms/icon'
import { categories } from '../lib/categories'
import styles from './merchant-heading.module.css'

export function MerchantHeading({ merchant, subtitle, category }: { merchant: string; subtitle: string; category: DashboardCategory }) {
  const meta = categories.find(item => item.value === category)!
  return <div className={styles.heading} data-category={category}><span className={styles.mark}><Icon name={meta.icon} className={styles.icon} /></span><div className={styles.text}><div className={styles.name}><h3>{merchant}</h3><span>{meta.short}</span></div><p>{subtitle}</p></div></div>
}
