import { Redis } from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined
}

export const redis = globalThis.__redis ?? new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: false,
})

if (process.env.NODE_ENV !== 'production') globalThis.__redis = redis

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Redis]', err.message)
  }
})
