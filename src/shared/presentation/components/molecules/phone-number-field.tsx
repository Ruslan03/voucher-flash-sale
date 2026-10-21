'use client'

import { useState, type ComponentProps } from 'react'
import { Icon } from '../atoms/icon'
import { Input } from '../atoms/input'
import { FormField } from './form-field'
import { getPhoneNumberInputError } from './phone-number-validation'

type PhoneNumberFieldProps = Omit<ComponentProps<'input'>, 'id' | 'type' | 'children'> & {
  id: string
  label: string
  hint?: string
  error?: string
}

/** Digits-only phone entry; mobile length/prefix rules belong to the feature. */
export function PhoneNumberField({ id, label, hint, error, className = '',
  'aria-describedby': describedBy, onInput, ...props }: PhoneNumberFieldProps) {
  const [inputValue, setInputValue] = useState(String(props.defaultValue ?? ''))
  const value = props.value === undefined ? inputValue : String(props.value)
  const validationError = getPhoneNumberInputError(value) ?? error
  const description = [describedBy, hint && `${id}-hint`, validationError && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <FormField id={id} label={label} hint={hint} error={validationError}>
      <div className="ui-phone">
        <span className="ui-phone__prefix">
          <span aria-hidden="true" className="ui-phone__flag" />
          <span>+62</span>
        </span>
        <Input autoComplete="tel-national" placeholder="e.g. 81234567890"
          {...props} type="tel" inputMode="numeric" pattern="[0-9]*" id={id} className={`ui-phone__input ${className}`}
          onInput={event => { setInputValue(event.currentTarget.value); onInput?.(event) }}
          aria-describedby={description} aria-invalid={validationError ? true : props['aria-invalid']} />
        <span className="ui-phone__suffix"><Icon name="smartphone" className="text-[20px]" /></span>
      </div>
    </FormField>
  )
}
