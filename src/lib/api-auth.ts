import { NextRequest } from 'next/server'
import { db } from '@/db'
import { apiKey, user } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { hashValue } from '@/lib/utils'

export interface ApiUser {
  id:     string
  planId: string
}

export async function verifyApiKey(req: NextRequest): Promise<ApiUser | null> {
  const auth  = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!token) return null

  const hash = hashValue(token)

  const [row] = await db
    .select({
      keyId:  apiKey.id,
      userId: apiKey.userId,
      planId: user.planId,
    })
    .from(apiKey)
    .innerJoin(user, eq(user.id, apiKey.userId))
    .where(and(eq(apiKey.keyHash, hash), isNull(apiKey.revokedAt)))
    .limit(1)

  if (!row) return null

  // Fire-and-forget lastUsedAt update — don't await
  db.update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKey.id, row.keyId))
    .catch(() => {})

  return { id: row.userId, planId: row.planId ?? 'free' }
}

export function apiError(msg: string, status = 400) {
  return Response.json({ error: msg }, { status })
}
