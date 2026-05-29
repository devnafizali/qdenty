'use server'
import { headers }      from 'next/headers'
import { eq }           from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db }           from '@/db'
import { user as userTable, userProfile } from '@/db/schema'
import type { CvData }  from '@/db/schema'
import { auth }         from '@/lib/auth'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user as { id: string }
}

export async function saveCv(cv: CvData): Promise<void> {
  const u = await requireUser()
  await db
    .insert(userProfile)
    .values({ userId: u.id, cvData: cv })
    .onConflictDoUpdate({ target: userProfile.userId, set: { cvData: cv } })

  const [row] = await db.select({ slug: userTable.slug }).from(userTable).where(eq(userTable.id, u.id)).limit(1)
  if (row?.slug) {
    revalidatePath(`/u/${row.slug}`)
    revalidatePath(`/cv/${row.slug}`)
  }
}

export async function loadCv(): Promise<CvData | null> {
  const user = await requireUser()
  const [row] = await db
    .select({ cvData: userProfile.cvData })
    .from(userProfile)
    .where(eq(userProfile.userId, user.id))
    .limit(1)
  return row?.cvData ?? null
}
