import type { ReactNode } from 'react'
import { Icon } from '../atoms/icon'

export interface FormFieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

/** Input owns aria-describedby; this wrapper owns the associated text IDs. */
export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>{label}</label>
      {children}
      {hint && <p id={`${id}-hint`} className="ui-field__hint"><Icon name="info" className="text-primary-container text-[14px]" />{hint}</p>}
      {error && <p id={`${id}-error`} className="ui-field__error" role="alert">{error}</p>}
    </div>
  )
}
