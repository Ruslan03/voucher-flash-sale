import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route Guard Middleware
 * Protects authenticated routes (/dashboard, /vouchers) and redirects unauthenticated requests to /login.
 * Redirects logged-in users away from /login to /dashboard.
 */

const protectedRoutes = ['/dashboard', '/vouchers']
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get('session_token')?.value

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Guard protected routes: redirect to login if session token is missing
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', request.url)
    const target = `${pathname}${search}`
    if (target !== '/dashboard') {
      redirectUrl.searchParams.set('redirect', target)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Guard auth routes: redirect to dashboard if user already has an active session token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
