import localFont from 'next/font/local'
import type { ComponentProps } from 'react'
import '../../shared.css'

const symbols = localFont({
  src: '../../assets/material-symbols.ttf',
  display: 'block',
  weight: '400',
  preload: true,
  adjustFontFallback: false,
})

export type IconName = 'bolt' | 'verified' | 'schedule' | 'local_fire_department' |
  'timelapse' | 'flash_on' | 'restaurant' | 'checkroom' | 'devices' | 'redeem' |
  'smartphone' | 'info' | 'arrow_forward' | 'arrow_back' | 'lock' | 'local_cafe' |
  'styler' | 'headphones' | 'fastfood' | 'expand_more' | 'confirmation_number' |
  'task_alt' | 'receipt_long' | 'add_circle' | 'arrow_downward' | 'timer' | 'close' |
  'smartphone' | 'info' | 'arrow_forward' | 'arrow_back' | 'lock' | 'sms'

type IconProps = Omit<ComponentProps<'span'>, 'children'> & { name: IconName; label?: string }

/** Decorative by default. Supply label when the icon conveys meaning on its own. */
export function Icon({ name, label, className = '', ...props }: IconProps) {
  return <span {...props} className={`${symbols.className} ui-icon ${className}`}
    aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>{name}</span>
}
