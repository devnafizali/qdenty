/**
 * Edge-compatible bot detection — no Node.js APIs, no ioredis.
 * Safe to import in Next.js middleware (Edge Runtime).
 */
import { NextRequest } from 'next/server'

const BOT_RE = /bot|crawler|spider|scraper|curl|wget|python-requests|go-http-client|java\//i

export function isBot(ua: string | null): boolean {
  if (!ua || ua.length < 10) return true
  return BOT_RE.test(ua)
}

export function clientIP(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
