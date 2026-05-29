import { notFound }     from 'next/navigation'
import { headers }      from 'next/headers'
import { db }           from '@/db'
import { user, userProfile } from '@/db/schema'
import { eq }           from 'drizzle-orm'
import type { Metadata } from 'next'
import Link             from 'next/link'
import type { CvData }  from '@/db/schema'
import { auth }         from '@/lib/auth'
import { PubCvActions } from '@/components/public/pub-cv-actions'
import PreviewWrapper   from '@/components/public/preview-wrapper'
import ScaledCvDoc      from '@/components/cv-builder/scaled-cv-doc'
import '../../public.css'
import '../../../(app)/cv-builder/cv-builder.css'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [row] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.slug, slug))
    .limit(1)
  if (!row) return { title: 'CV · qdenty' }
  return {
    title: `${row.name} · CV · qdenty`,
    openGraph: { title: `${row.name} · Curriculum Vitæ`, type: 'profile' },
  }
}

export default async function PublicCvPage({ params }: Props) {
  const { slug } = await params

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const viewer  = session?.user as { slug?: string } | undefined
  const isOwner = !!viewer?.slug && viewer.slug === slug

  const [row] = await db
    .select({
      name:   user.name,
      slug:   user.slug,
      cvData: userProfile.cvData,
    })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(eq(user.slug, slug))
    .limit(1)

  if (!row || !row.cvData) notFound()

  const cv     = row.cvData as CvData
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qdenty.io'
  const pubUrl  = `${APP_URL}/cv/${slug}`

  const content = (
    <div className="pub-cv-page">
      <div className="pub-cv-bar">
        <Link href={`/u/${slug}`} className="pub-cv-back">← {cv.name}&apos;s identity page</Link>
        <PubCvActions url={pubUrl} name={cv.name} />
      </div>
      <div className="pub-cv-doc-wrap">
        <ScaledCvDoc cv={cv} cvUrl={pubUrl} />
      </div>
    </div>
  )

  if (isOwner) {
    return (
      <div className="prv-page">
        <div className="prv-page-inner">
          <div className="prv-head">
            <h2>The CV that <span className="it">updates</span><br />itself.</h2>
            <div className="prv-head-sub">
              <span className="lbl">Live CV · {pubUrl.replace(`${APP_URL}/`, '')}</span>
              The QR on the printed CV always points here. Edit once, every copy updates.
            </div>
          </div>
          <PreviewWrapper kind="CV" url={pubUrl} editPath="/cv-builder">
            {content}
          </PreviewWrapper>
        </div>
      </div>
    )
  }

  return content
}
