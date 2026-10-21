import type { ComponentProps } from 'react'
import '../../shared.css'

export function Badge({ className = '', ...props }: ComponentProps<'span'>) {
  return <span {...props} className={`ui-badge ${className}`} />
}
