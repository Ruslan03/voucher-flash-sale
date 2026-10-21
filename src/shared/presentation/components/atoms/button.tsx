import type { ComponentProps } from 'react'
import '../../shared.css'

type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'outline' }

export function Button({ type = 'button', variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ui-button ui-button--${variant} ${className}`} />
}
