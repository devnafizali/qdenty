/**
 * Next.js Edge Middleware — runs at Edge Runtime (no Node.js APIs).
 * Only does: bot blocking, session cookie routing.
 * Rate limiting lives in API route handlers (Node.js runtime, uses ioredis).
 */
import { NextRequest, NextResponse } from 'next/server'
import { isBot, clientIP } from '@/lib/bot-detect'

const APP_ROUTES = ['/dashboard', '/account', '/analytics', '/cv-builder']

function getSessionToken(req: NextRequest): string | undefined {
  return (
    req.cookies.get('better-auth.session_token')?.value ||
    req.cookies.get('__Secure-better-auth.session_token')?.value
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua  = req.headers.get('user-agent')
  const ip  = clientIP(req)

  // ── Block scrapers/bots from app routes ──────────────────────
  if (APP_ROUTES.some(r => pathname.startsWith(r)) && isBot(ua)) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'X-Blocked-By': 'qdenty-shield' },
    })
  }

  // ── Protect app routes (routing only — real validation in layout) ─
  if (APP_ROUTES.some(r => pathname.startsWith(r))) {
    if (!getSessionToken(req)) {
      const target = new URL('/sign-in', req.url)
      target.searchParams.set('redirect', pathname)
      return NextResponse.redirect(target)
    }
  }

  // Forward pathname so server layouts can read it without needing next-url parsing
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)
  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.headers.set('x-real-ip', ip)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|images|icons).*)'],
}
