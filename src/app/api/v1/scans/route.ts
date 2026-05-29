import { NextRequest } from 'next/server'
import { verifyApiKey, apiError } from '@/lib/api-auth'
import { db } from '@/db'
import { scanEvent, qrCode } from '@/db/schema'
import { eq, and, gte, inArray, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  const { searchParams } = new URL(req.url)
  const codeId    = searchParams.get('code_id')
  const sinceRaw  = searchParams.get('since')   // ISO date
  const limitRaw  = searchParams.get('limit')
  const limit     = Math.min(500, Math.max(1, parseInt(limitRaw ?? '100', 10) || 100))

  // Get user's code IDs for filtering
  const userCodes = await db
    .select({ id: qrCode.id })
    .from(qrCode)
    .where(eq(qrCode.userId, apiUser.id))

  const userCodeIds = userCodes.map(c => c.id)
  if (userCodeIds.length === 0) return Response.json({ data: [], count: 0 })

  const conditions = [inArray(scanEvent.codeId, userCodeIds)]
  if (codeId) conditions.push(eq(scanEvent.codeId, codeId))
  if (sinceRaw) {
    const since = new Date(sinceRaw)
    if (!isNaN(+since)) conditions.push(gte(scanEvent.scannedAt, since))
  }

  const scans = await db
    .select({
      id:         scanEvent.id,
      codeId:     scanEvent.codeId,
      scannedAt:  scanEvent.scannedAt,
      country:    scanEvent.country,
      city:       scanEvent.city,
      deviceType: scanEvent.deviceType,
      os:         scanEvent.os,
      browser:    scanEvent.browser,
      referrer:   scanEvent.referrer,
    })
    .from(scanEvent)
    .where(and(...conditions))
    .orderBy(desc(scanEvent.scannedAt))
    .limit(limit)

  return Response.json({ data: scans, count: scans.length })
}
