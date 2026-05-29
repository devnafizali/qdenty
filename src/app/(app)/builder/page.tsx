import { headers }      from 'next/headers'
import { auth }         from '@/lib/auth'
import { getCodeForEdit } from '@/app/actions/builder'
import BuilderClient    from '@/components/builder/builder-client'
import { db }           from '@/db'
import { userProfile }  from '@/db/schema'
import { eq }           from 'drizzle-orm'
import type { Metadata } from 'next'
import './builder.css'

export const metadata: Metadata = { title: 'Builder — Qdenty' }

interface Props {
  searchParams: Promise<{ edit?: string }>
}

export default async function BuilderPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)

  const { edit } = await searchParams
  const user   = session?.user as { id: string; name: string; email: string; planId?: string; slug?: string } | undefined
  const planId = user?.planId ?? (session ? 'free' : 'guest')

  let editCode: {
    id: string; type: string; color: string; status: string
    templateData: Record<string, unknown> | null
  } | null = null

  if (edit && session) {
    const row = await getCodeForEdit(edit)
    if (row) {
      editCode = {
        id:           row.id,
        type:         row.type,
        color:        row.color,
        status:       row.status,
        templateData: row.templateData as Record<string, unknown> | null,
      }
    }
  }

  let userIdentity: {
    slug: string | null; name: string; email: string
    title: string; bio: string; phone: string; links: string[]
  } | null = null

  if (user) {
    const profile = await db.select().from(userProfile).where(eq(userProfile.userId, user.id)).then(r => r[0] ?? null)
    userIdentity = {
      slug:  user.slug ?? null,
      name:  user.name ?? '',
      email: user.email ?? '',
      title: profile?.title ?? '',
      bio:   profile?.bio   ?? '',
      phone: profile?.phone ?? '',
      links: (profile?.links ?? []) as string[],
    }
  }

  return (
    <div className="screen">
      <div className="builder-intro">
        <h2>
          Tell us <span className="it">what</span> it should do.
        </h2>
      </div>
      <BuilderClient planId={planId} editCode={editCode} isGuest={!session} userIdentity={userIdentity} />
    </div>
  )
}
