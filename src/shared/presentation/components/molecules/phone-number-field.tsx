import type { ComponentProps } from 'react'
import { Icon } from '../atoms/icon'
import { Input } from '../atoms/input'
import { FormField } from './form-field'

type PhoneNumberFieldProps = Omit<ComponentProps<'input'>, 'id' | 'type' | 'children'> & {
  id: string
  label: string
  hint?: string
  error?: string
}

/** Indonesian national number entry. Formatting and validation belong to the feature. */
export function PhoneNumberField({ id, label, hint, error, className = '',
  'aria-describedby': describedBy, ...props }: PhoneNumberFieldProps) {
  const description = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <div className="ui-phone">
        <span className="ui-phone__prefix">
          <span aria-hidden="true" className="ui-phone__flag" />
          <span>+62</span>
        </span>
        <Input autoComplete="tel-national" inputMode="numeric" placeholder="e.g. 812-3456-7890"
          {...props} type="tel" id={id} className={`ui-phone__input ${className}`}
          aria-describedby={description} aria-invalid={error ? true : props['aria-invalid']} />
        <span className="ui-phone__suffix"><Icon name="smartphone" className="text-[20px]" /></span>
      </div>
    </FormField>
  )
}
