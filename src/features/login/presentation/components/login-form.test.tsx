import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './login-form'

vi.mock('next/font/local', () => ({ default: () => ({ className: 'test-icons' }) }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('LoginForm Component', () => {
  it('renders initial phone number entry step with accessible attributes', () => {
    const html = renderToStaticMarkup(<LoginForm />)

    expect(html).toContain('Sign in to PromoRush')
    expect(html).toContain('Mobile Phone Number')
    expect(html).toContain('id="phone-input"')
    expect(html).toContain('type="tel"')
    expect(html).toContain('+62')
    expect(html).toContain('Send OTP')
    expect(html).toContain('disabled=""')
  })
})
