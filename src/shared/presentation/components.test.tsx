import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './components/atoms/button'
import { PhoneNumberField } from './components/molecules/phone-number-field'
import { Progress } from './components/atoms/progress'

vi.mock('next/font/local', () => ({ default: () => ({ className: 'test-icons' }) }))

describe('shared presentation contracts', () => {
  it('preserves native progress values and an accessible label', () => {
    const html = renderToStaticMarkup(<Progress value={68} max={100} aria-label="Kuota terpakai" />)
    expect(html).toContain('value="68"')
    expect(html).toContain('max="100"')
    expect(html).toContain('aria-label="Kuota terpakai"')
  })
  it('defaults buttons to non-submit and forwards native accessibility attributes', () => {
    const html = renderToStaticMarkup(<Button disabled aria-describedby="status">Send OTP</Button>)
    expect(html).toContain('type="button"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-describedby="status"')
    expect(html).toContain('Send OTP')
  })

  it('allows an explicit submit button', () => {
    expect(renderToStaticMarkup(<Button type="submit">Continue</Button>)).toContain('type="submit"')
  })

  it('connects phone input to its label, hint, error and caller description', () => {
    const html = renderToStaticMarkup(
      <PhoneNumberField id="phone" name="phone" label="Mobile number" hint="Use your active number"
        error="Invalid number" required aria-describedby="privacy" defaultValue="8123456789" />,
    )
    expect(html).toContain('for="phone"')
    expect(html).toContain('id="phone"')
    expect(html).toContain('type="tel"')
    expect(html).toContain('name="phone"')
    expect(html).toContain('value="8123456789"')
    expect(html).toContain('required=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="privacy phone-hint phone-error"')
    expect(html).toContain('id="phone-hint"')
    expect(html).toContain('id="phone-error"')
    expect(html).toContain('+62')
  })

  it('does not mark a phone field invalid or refer to absent help text', () => {
    const html = renderToStaticMarkup(<PhoneNumberField id="phone" label="Mobile number" />)
    expect(html).not.toContain('aria-invalid="true"')
    expect(html).not.toContain('aria-describedby=')
  })
})
