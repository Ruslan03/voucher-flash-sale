import type { ComponentProps } from 'react'
import '../../shared.css'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input {...props} className={`ui-input ${className}`} />
}
