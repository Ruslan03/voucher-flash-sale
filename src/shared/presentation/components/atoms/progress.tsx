import type { ComponentProps } from 'react'
import styles from './progress.module.css'

export function Progress({ className = '', ...props }: ComponentProps<'progress'>) {
  return <progress {...props} className={`${styles.bar} ${className}`} />
}
