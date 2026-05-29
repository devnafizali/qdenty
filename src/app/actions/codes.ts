'use server'
import { revalidatePath } from 'next/cache'
import { headers }        from 'next/headers'
import { auth }           from '@/lib/auth'
import { db }             from '@/db'
import { qrCode }         from '@/db/schema'
import { eq, and }        from 'drizzle-orm'
import { generateId }     from '@/lib/utils'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user
}

export async function deleteCode(codeId: string) {
  const user = await requireUser()
  await db.delete(qrCode).where(and(eq(qrCode.id, codeId), eq(qrCode.userId, user.id)))
  revalidatePath('/dashboard')
}

export async function duplicateCode(codeId: string) {
  const user = await requireUser()
  const [orig] = await db.select().from(qrCode)
    .where(and(eq(qrCode.id, codeId), eq(qrCode.userId, user.id)))
  if (!orig) throw new Error('Code not found')

  await db.insert(qrCode).values({
    id:           generateId(),
    userId:       user.id,
    label:        `${orig.label} (copy)`,
    type:         orig.type,
    payload:      orig.payload,
    color:        orig.color,
    status:       'draft',
    templateData: orig.templateData,
    scans:        0,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  })
  revalidatePath('/dashboard')
}

export async function setCodeStatus(codeId: string, status: 'live' | 'draft' | 'exp') {
  const user = await requireUser()
  await db.update(qrCode)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(qrCode.id, codeId), eq(qrCode.userId, user.id)))
  revalidatePath('/dashboard')
}

export async function archiveAllCodes() {
  const user = await requireUser()
  await db.update(qrCode)
    .set({ status: 'exp', updatedAt: new Date() })
    .where(eq(qrCode.userId, user.id))
  revalidatePath('/dashboard')
}
