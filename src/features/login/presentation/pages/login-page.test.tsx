import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login-page'

vi.mock('next/font/local', () => ({ default: () => ({ className: 'test-icons' }) }))
vi.mock('../../assets/flash-sale-hero.jpg', () => ({
  default: { src: '/test-hero.jpg', width: 512, height: 382 },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

import { RootProvider } from '@/composition/store/provider'

describe('login presentation', () => {
  it('renders integrated login screen with labelled phone field and ready OTP action', () => {
    const html = renderToStaticMarkup(
      <RootProvider>
        <LoginPage />
      </RootProvider>
    )
    expect(html).toContain('for="phone-input"')
    expect(html).toContain('type="tel"')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>/)
    expect(html).toContain('aria-describedby="otp-status"')
    expect(html).toContain('id="otp-status"')
    expect(html).toContain('Send OTP')
    expect(html).toContain('Kopi Kenangan')
    expect(html).toContain('Zara / H&amp;M')
    expect(html).toContain('Tokopedia / Gadget')
  })
})
