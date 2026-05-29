import { notFound }   from 'next/navigation'
import { headers }    from 'next/headers'
import { db }         from '@/db'
import { user, userProfile } from '@/db/schema'
import { eq }         from 'drizzle-orm'
import type { Metadata } from 'next'
import { auth }       from '@/lib/auth'
import { VCardButton, ShareQuickItem } from '@/components/public/pub-id-actions'
import PreviewWrapper from '@/components/public/preview-wrapper'
import MarketingQr    from '@/components/marketing/marketing-qr'
import Link           from 'next/link'
import { Mail, Phone, MapPin, BadgeCheck, ExternalLink, FileText } from 'lucide-react'
import '../../public.css'
import '../../../(marketing)/marketing.css'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [row] = await db
    .select({ name: user.name, title: userProfile.title })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(eq(user.slug, slug))
    .limit(1)
  if (!row) return { title: 'Not found · qdenty' }
  return {
    title: `${row.name} · qdenty`,
    description: row.title ?? undefined,
    openGraph: { title: row.name, type: 'profile' },
  }
}

export default async function PublicIdentityPage({ params }: Props) {
  const { slug } = await params

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const viewer  = session?.user as { slug?: string } | undefined
  const isOwner = !!viewer?.slug && viewer.slug === slug

  const [row] = await db
    .select({
      name:     user.name,
      email:    user.email,
      slug:     user.slug,
      pronouns: userProfile.pronouns,
      phone:    userProfile.phone,
      title:    userProfile.title,
      bio:      userProfile.bio,
      location: userProfile.location,
      links:    userProfile.links,
      cvData:   userProfile.cvData,
    })
    .from(user)
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .where(eq(user.slug, slug))
    .limit(1)

  if (!row) notFound()

  const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || 'https://qdenty.io'
  const pubUrl   = `${APP_URL}/u/${slug}`
  const initials = row.name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
  const [first, ...rest] = row.name.split(' ')
  const last     = rest.join(' ')
  const links    = (row.links ?? []) as string[]
  const hasCv    = !!row.cvData
  const idNum    = (row.name.charCodeAt(0) * 91 % 9999).toString().padStart(4, '0')

  const FIELDS = [
    { k: 'Display Name', v: row.name },
    ...(row.pronouns ? [{ k: 'Pronouns',  v: row.pronouns, it: true }] : []),
    ...(row.title    ? [{ k: 'Title',     v: row.title }]              : []),
    ...(row.location ? [{ k: 'Location',  v: row.location }]           : []),
    { k: 'Email',          v: row.email,                link: `mailto:${row.email}` },
    ...(row.phone    ? [{ k: 'Phone',     v: row.phone, link: `tel:${row.phone.replace(/[^+0-9]/g,'')}` }] : []),
    ...(row.bio      ? [{ k: 'Bio',       v: row.bio,  span: true }]   : []),
    ...(links.length > 0 ? [{ k: 'Profiles', v: links.join(' · '), span: true }] : []),
  ]

  const content = (
    <div className="identity-screen" id="identity">
      <div className="identity-page">
        <div className="identity-frame">

          {/* ── Left: identity card ── */}
          <div className="identity-card">
            <div className="ic-head">
              <div className="ic-logo">qdenty<sup>™</sup></div>
              <div className="ic-verified"><BadgeCheck size={13} strokeWidth={2.5} /> Verified</div>
            </div>

            <div className="ic-avatar" data-initials={initials} />

            <div className="ic-name">
              {first} {last && <span className="it">{last}</span>}
            </div>
            {row.title && <div className="ic-role">{row.title}</div>}

            <div className="ic-contact-mini">
              <div><Mail size={12} className="lbl" /><span>{row.email}</span></div>
              {row.phone    && <div><Phone size={12} className="lbl" /><span>{row.phone}</span></div>}
              {row.location && <div><MapPin size={12} className="lbl" /><span>{row.location}</span></div>}
            </div>

            <div className="ic-qr-row">
              <div className="ic-qr">
                <MarketingQr value={pubUrl} size={116} color="#0f0e0c" bg="#f3efe7" />
              </div>
              <div className="ic-qr-l">
                <div className="ic-qr-h">Scan to <span className="it">connect</span></div>
                <div className="ic-qr-p">qdenty.io/u/{slug}</div>
              </div>
            </div>

            <div className="ic-foot">
              <span>ID · #A4-{idNum}</span>
              <span>Issued · {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* ── Right: details + actions ── */}
          <div className="identity-info">
            <h2>{first}&apos;s <span className="it">identity</span><br />page.</h2>
            {row.bio && <p className="ii-lede">{row.bio}</p>}

            <div className="ii-list">
              {FIELDS.map((f, i) => (
                <div key={i} className="row" style={f.span ? { gridColumn: 'span 2' } : {}}>
                  <div className="k">{f.k}</div>
                  <div className={`v${f.it ? ' it' : ''}`}>
                    {f.link ? <a href={f.link}>{f.v}</a> : f.v}
                  </div>
                </div>
              ))}
            </div>

            <div className="identity-action-bar">
              <VCardButton
                name={row.name}
                email={row.email}
                phone={row.phone ?? ''}
                slug={slug!}
                label="Save Contact"
              />
              <a href={`mailto:${row.email}`}>Email</a>
              {row.phone && (
                <a href={`tel:${row.phone.replace(/[^+0-9]/g, '')}`}>Call</a>
              )}
              <ShareQuickItem url={pubUrl} name={row.name} label="Share" />
              {hasCv && (
                <Link href={`/cv/${slug}`} className="pri"><FileText size={14} strokeWidth={2} /> View CV</Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  if (isOwner) {
    return (
      <div className="prv-page">
        <div className="prv-page-inner">
          <div className="prv-head">
            <h2>What people <span className="it">see</span><br />when they scan.</h2>
            <div className="prv-head-sub">
              <span className="lbl">Live preview · {pubUrl.replace('https://', '')}</span>
              This is the hosted page a scanner lands on. Tweak your details and it updates instantly.
            </div>
          </div>
          <PreviewWrapper kind="identity" url={pubUrl} editPath="/account/profile">
            {content}
          </PreviewWrapper>
        </div>
      </div>
    )
  }

  return content
}
