'use server'
import { revalidatePath } from 'next/cache'
import { headers }        from 'next/headers'
import { redirect }       from 'next/navigation'
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

export interface CodeInput {
  label:        string
  type:         string
  payload:      string
  color:        string
  status:       'live' | 'draft'
  templateData: Record<string, unknown>
}

export async function createCode(input: CodeInput): Promise<{ id: string }> {
  const user = await requireUser()
  const id   = generateId()

  await db.insert(qrCode).values({
    id,
    userId:       user.id,
    label:        input.label,
    type:         input.type,
    payload:      input.payload,
    color:        input.color,
    status:       input.status,
    templateData: input.templateData,
    scans:        0,
    createdAt:    new Date(),
    updatedAt:    new Date(),
  })

  revalidatePath('/dashboard')
  return { id }
}

export async function updateCode(codeId: string, input: CodeInput): Promise<void> {
  const user = await requireUser()

  await db.update(qrCode)
    .set({
      label:        input.label,
      type:         input.type,
      payload:      input.payload,
      color:        input.color,
      status:       input.status,
      templateData: input.templateData,
      updatedAt:    new Date(),
    })
    .where(and(eq(qrCode.id, codeId), eq(qrCode.userId, user.id)))

  revalidatePath('/dashboard')
  revalidatePath(`/builder?edit=${codeId}`)
}

export async function getCodeForEdit(codeId: string) {
  const user = await requireUser()
  const [row] = await db.select().from(qrCode)
    .where(and(eq(qrCode.id, codeId), eq(qrCode.userId, user.id)))
  return row ?? null
}
