import { NextRequest } from 'next/server'
import { verifyApiKey, apiError } from '@/lib/api-auth'
import { db } from '@/db'
import { qrCode } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'
import { hasTier } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  const codes = await db
    .select({
      id:        qrCode.id,
      label:     qrCode.label,
      type:      qrCode.type,
      payload:   qrCode.payload,
      status:    qrCode.status,
      scans:     qrCode.scans,
      color:     qrCode.color,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
    })
    .from(qrCode)
    .where(eq(qrCode.userId, apiUser.id))
    .orderBy(desc(qrCode.createdAt))

  return Response.json({ data: codes, count: codes.length })
}

export async function POST(req: NextRequest) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  if (!hasTier(apiUser.planId, 'pro')) {
    return apiError('Code creation via API requires Professional plan', 403)
  }

  let body: { label?: string; type?: string; payload?: string; color?: string } = {}
  try { body = await req.json() } catch { return apiError('Invalid JSON body') }

  const { label, type, payload, color } = body
  if (!label || typeof label !== 'string') return apiError('"label" is required')
  if (!type  || typeof type  !== 'string') return apiError('"type" is required')
  if (!payload || typeof payload !== 'string') return apiError('"payload" is required')

  const id = generateId()
  await db.insert(qrCode).values({
    id,
    userId:    apiUser.id,
    label:     label.trim(),
    type,
    payload,
    color:     color ?? '#0f0e0c',
    status:    'live',
    scans:     0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const [created] = await db.select().from(qrCode).where(eq(qrCode.id, id)).limit(1)
  return Response.json({ data: created }, { status: 201 })
}
