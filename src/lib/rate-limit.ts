/**
 * Rate limiting for API route handlers (Node.js runtime only).
 * Do NOT import this in middleware — use bot-detect.ts there instead.
 */
import { redis } from './redis'

export { isBot, clientIP } from './bot-detect'

export async function rateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now    = Date.now()
  const cutoff = now - windowSecs * 1000
  const reset  = Math.floor(now / 1000) + windowSecs

  const pipe = redis.multi()
  pipe.zremrangebyscore(key, 0, cutoff)
  pipe.zadd(key, now, `${now}:${Math.random().toString(36).slice(2, 8)}`)
  pipe.zcard(key)
  pipe.expire(key, windowSecs)

  const results = await pipe.exec()
  const count = (results?.[2]?.[1] as number) ?? 0

  return {
    success:   count <= limit,
    remaining: Math.max(0, limit - count),
    reset,
  }
}
