'use client'

import { Icon, type IconName } from '../atoms/icon'
import styles from './category-filter.module.css'

export interface FilterOption<T extends string> { value: T; label: string; icon: IconName }

export function CategoryFilter<T extends string>({ options, value, onChange, label = 'Kategori voucher' }: {
  options: readonly FilterOption<T>[]; value: T; onChange: (value: T) => void; label?: string
}) {
  return <div className={styles.filters} role="group" aria-label={label}>{options.map(option => (
    <button key={option.value} type="button" className={styles.filter} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
      <Icon name={option.icon} className={styles.icon} />{option.label}
    </button>
  ))}</div>
}
