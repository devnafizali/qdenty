import { NextRequest } from 'next/server'
import { verifyApiKey, apiError } from '@/lib/api-auth'
import { db } from '@/db'
import { qrCode } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

type QrCodeUpdate = Partial<Pick<InferSelectModel<typeof qrCode>, 'label' | 'payload' | 'color' | 'status'>> & { updatedAt: Date }

export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  const { id } = await params
  const [code] = await db
    .select()
    .from(qrCode)
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, apiUser.id)))
    .limit(1)

  if (!code) return apiError('Code not found', 404)
  return Response.json({ data: code })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  const { id } = await params
  const [existing] = await db
    .select({ id: qrCode.id })
    .from(qrCode)
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, apiUser.id)))
    .limit(1)

  if (!existing) return apiError('Code not found', 404)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { return apiError('Invalid JSON body') }

  const allowed = ['label', 'payload', 'color', 'status'] as const
  const update: QrCodeUpdate = { updatedAt: new Date() }
  for (const key of allowed) {
    if (key in body) (update as Record<string, unknown>)[key] = body[key]
  }

  await db.update(qrCode).set(update).where(eq(qrCode.id, id))

  const [updated] = await db.select().from(qrCode).where(eq(qrCode.id, id)).limit(1)
  return Response.json({ data: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await verifyApiKey(req)
  if (!apiUser) return apiError('Invalid or missing API key', 401)

  const { id } = await params
  const [existing] = await db
    .select({ id: qrCode.id })
    .from(qrCode)
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, apiUser.id)))
    .limit(1)

  if (!existing) return apiError('Code not found', 404)

  await db.delete(qrCode).where(eq(qrCode.id, id))
  return Response.json({ deleted: true })
}
