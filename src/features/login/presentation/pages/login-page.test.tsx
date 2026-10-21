import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login-page'

vi.mock('next/font/local', () => ({ default: () => ({ className: 'test-icons' }) }))
vi.mock('../../assets/flash-sale-hero.jpg', () => ({ default: { src: '/test-hero.jpg', width: 512, height: 382 } }))

describe('login presentation', () => {
  it('keeps the phone field labelled and OTP unavailable until integration', () => {
    const html = renderToStaticMarkup(<LoginPage />)
    expect(html).toContain('for="phone-input"')
    expect(html).toContain('type="tel"')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>/)
    expect(html).toContain('aria-describedby="otp-status"')
    expect(html).toContain('id="otp-status"')
    expect(html).toContain('OTP delivery is not connected yet.')
    expect(html).toContain('Kopi Kenangan')
    expect(html).toContain('Zara / H&amp;M')
    expect(html).toContain('Tokopedia / Gadget')
  })
})
