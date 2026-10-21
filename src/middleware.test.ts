import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

describe('Route Guard Middleware', () => {
  it('redirects unauthenticated users from /dashboard to /login', () => {
    const req = new NextRequest('https://example.com/dashboard')
    const res = middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://example.com/login')
  })

  it('redirects unauthenticated users from /vouchers/vp_fnb to /login with redirect query param', () => {
    const req = new NextRequest('https://example.com/vouchers/vp_fnb?ref=promo')
    const res = middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'https://example.com/login?redirect=%2Fvouchers%2Fvp_fnb%3Fref%3Dpromo'
    )
  })

  it('allows authenticated users to access protected routes', () => {
    const req = new NextRequest('https://example.com/dashboard', {
      headers: {
        cookie: 'session_token=valid_jwt_token',
      },
    })
    const res = middleware(req)

    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects logged-in users away from /login to /dashboard', () => {
    const req = new NextRequest('https://example.com/login', {
      headers: {
        cookie: 'session_token=valid_jwt_token',
      },
    })
    const res = middleware(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://example.com/dashboard')
  })

  it('allows unauthenticated users to access /login', () => {
    const req = new NextRequest('https://example.com/login')
    const res = middleware(req)

    expect(res.headers.get('location')).toBeNull()
  })

  it('allows public routes like home page /', () => {
    const req = new NextRequest('https://example.com/')
    const res = middleware(req)

    expect(res.headers.get('location')).toBeNull()
  })
})
