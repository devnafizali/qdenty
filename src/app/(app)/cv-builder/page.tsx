import { redirect }   from 'next/navigation'
import { headers }    from 'next/headers'
import { auth }       from '@/lib/auth'
import { db }         from '@/db'
import { userProfile } from '@/db/schema'
import { eq }         from 'drizzle-orm'
import CvBuilderClient from '@/components/cv-builder/cv-builder-client'
import './cv-builder.css'

export const metadata = { title: 'CV Builder · qdenty' }

export default async function CvBuilderPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const user    = session.user as { id: string; slug?: string; planId?: string }
  const slug    = user.slug ?? ''
  const planId  = user.planId ?? 'free'

  const [profile] = await db
    .select({ cvData: userProfile.cvData })
    .from(userProfile)
    .where(eq(userProfile.userId, user.id))
    .limit(1)

  return (
    <div className="screen">
      <div className="cvb-head">
        <div>
          <h2>Edit. Preview. <span className="it">Publish.</span></h2>
          <div className="cvb-sub">
            <span className="lbl">Live builder · changes apply to the QR instantly</span>
          </div>
        </div>
        {slug && (
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              className="btn-mini-ghost"
              href={`/u/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ Identity
            </a>
            <a
              className="btn-mini"
              href={`/cv/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview CV →
            </a>
          </div>
        )}
      </div>

      <CvBuilderClient
        planId={planId}
        slug={slug}
        initial={profile?.cvData ?? null}
      />
    </div>
  )
}
