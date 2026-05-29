import { headers }    from 'next/headers'
import { auth }      from '@/lib/auth'
import { db }        from '@/db'
import { user as userTable, userProfile } from '@/db/schema'
import { eq }        from 'drizzle-orm'
import Link          from 'next/link'
import MarketingQr   from '@/components/marketing/marketing-qr'
import IdentityFrame from '@/components/identity/identity-frame'
import type { Metadata } from 'next'
import { Mail, Phone, MapPin, BadgeCheck, ExternalLink } from 'lucide-react'

export const metadata: Metadata = { title: 'Identity Page — qdenty' }

const DEMO = {
  name:     'Adelaide Marlow',
  pronouns: 'she / her',
  title:    'Editorial Designer',
  location: 'Lisbon, Portugal',
  email:    'adelaide@studio.co',
  phone:    '+351 912 345 678',
  bio:      'Designer at the intersection of editorial and digital. Making beautiful things scannable.',
  links:    ['linkedin.com/in/adelaide', 'behance.net/adelaideM', 'instagram.com/adelaideM'],
  slug:     'adelaide',
}

export default async function IdentityPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const u = session?.user as { id: string; name: string; email: string; slug?: string } | undefined

  let profile: {
    name: string; email: string; slug: string | null
    pronouns: string; title: string; location: string
    phone: string; bio: string; links: string[]
  } | null = null

  if (u) {
    const [row] = await db
      .select({
        name:     userTable.name,
        email:    userTable.email,
        slug:     userTable.slug,
        pronouns: userProfile.pronouns,
        title:    userProfile.title,
        location: userProfile.location,
        phone:    userProfile.phone,
        bio:      userProfile.bio,
        links:    userProfile.links,
      })
      .from(userTable)
      .leftJoin(userProfile, eq(userProfile.userId, userTable.id))
      .where(eq(userTable.id, u.id))
      .limit(1)

    if (row) {
      profile = {
        name:     row.name,
        email:    row.email,
        slug:     row.slug ?? null,
        pronouns: row.pronouns ?? '',
        title:    row.title    ?? '',
        location: row.location ?? '',
        phone:    row.phone    ?? '',
        bio:      row.bio      ?? '',
        links:    (row.links   ?? []) as string[],
      }
    }
  }

  const d = profile ?? { ...DEMO, slug: DEMO.slug, bio: DEMO.bio }
  const isReal = !!profile

  const initials    = d.name.split(' ').filter(Boolean).slice(0,2).map(s => s[0].toUpperCase()).join('')
  const [first, ...rest] = d.name.split(' ')
  const last        = rest.join(' ')
  const profileUrl  = d.slug
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://qdenty.io'}/u/${d.slug}`
    : null
  const idNum = (d.name.charCodeAt(0) * 91 % 9999).toString().padStart(4, '0')

  const FIELDS = [
    { k: 'Display Name',    v: d.name },
    ...(d.pronouns ? [{ k: 'Pronouns', v: d.pronouns, it: true }] : []),
    ...(d.title    ? [{ k: 'Title',    v: d.title }]               : []),
    ...(d.location ? [{ k: 'Location', v: d.location }]            : []),
    { k: 'Email',           v: d.email },
    ...(d.phone    ? [{ k: 'Phone',    v: d.phone }]                : []),
    ...(d.bio      ? [{ k: 'Bio',      v: d.bio, span: true }]      : []),
    ...(d.links.length > 0 ? [{ k: 'Linked Profiles', v: d.links.join(' · '), span: true }] : []),
    { k: 'Code Validity',   v: 'lifetime',  it: true },
  ]

  return (
    <section className="screen" id="identity">
      <div className="screen-tag"><b>§ 04</b> Identity Profile</div>

      <div className="identity-page">
        <IdentityFrame>

          {/* ── Left: identity card ── */}
          <div className="identity-card">
            <div className="ic-head">
              <div className="ic-logo">qdenty<sup>™</sup></div>
              <div className="ic-verified"><BadgeCheck size={13} strokeWidth={2.5} /> Verified</div>
            </div>

            <div className="ic-avatar" data-initials={initials} />

            <div className="ic-name">
              {first} <span className="it">{last}</span>
            </div>
            {d.title    && <div className="ic-role">{d.title}</div>}

            <div className="ic-contact-mini">
              <div><Mail size={12} className="lbl" /><span>{d.email}</span></div>
              {d.phone    && <div><Phone size={12} className="lbl" /><span>{d.phone}</span></div>}
              {d.location && <div><MapPin size={12} className="lbl" /><span>{d.location}</span></div>}
            </div>

            <div className="ic-qr-row">
              <div className="ic-qr">
                <MarketingQr
                  value={profileUrl ?? 'https://qdenty.io/identity'}
                  size={116}
                  color="#0f0e0c"
                  bg="#f3efe7"
                />
              </div>
              <div className="ic-qr-l">
                <div className="ic-qr-h">Scan to <span className="it">connect</span></div>
                <div className="ic-qr-p">
                  {isReal && profileUrl
                    ? `qdenty.io/u/${d.slug}`
                    : 'Save contact · open profile · share back'}
                </div>
              </div>
            </div>

            <div className="ic-foot">
              <span>ID · #A4-{idNum}</span>
              <span>Issued · {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* ── Right: identity info ── */}
          <div className="identity-info">
            {isReal ? (
              <>
                <h2>Your <span className="it">identity</span><br />card.</h2>
                <p className="ii-lede">
                  This is exactly what people see when they scan your QR. Keep it updated — the code never changes, your details always do.
                </p>
              </>
            ) : (
              <>
                <h2>The page <span className="it">behind</span><br />your code.</h2>
                <p className="ii-lede">
                  Every Identity QR points to a hosted, editable profile page. Update your number, add a new portfolio, change your job — the code never changes. Scanners always see the latest version.
                </p>
              </>
            )}

            <div className="ii-list">
              {FIELDS.map((f, i) => (
                <div key={i} className="row" style={f.span ? { gridColumn: 'span 2' } : {}}>
                  <div className="k">{f.k}</div>
                  <div className={`v${f.it ? ' it' : ''}`}>{f.v}</div>
                </div>
              ))}
            </div>

            {!isReal && (
              <div className="identity-action-bar">
                <Link href={`/u/${DEMO.slug}`} className="pri"><ExternalLink size={14} strokeWidth={2} /> View live profile</Link>
                <Link href="/sign-up">Create yours free</Link>
                <Link href="/builder?type=identity">Generate Identity QR</Link>
                <Link href="/cv">Download Résumé</Link>
              </div>
            )}

            {isReal && (
              <div className="identity-action-bar">
                {profileUrl && (
                  <Link href={profileUrl} className="pri" target="_blank"><ExternalLink size={14} strokeWidth={2} /> View public page</Link>
                )}
                <Link href="/account/profile">Edit profile details</Link>
                <Link href="/builder?type=identity">Get Identity QR</Link>
                {!d.slug && (
                  <Link href="/account/profile" style={{ color: 'var(--accent)' }}>
                    ⚠ Set a public slug to activate your page
                  </Link>
                )}
              </div>
            )}
          </div>

        </IdentityFrame>
      </div>
    </section>
  )
}
