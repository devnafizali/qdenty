'use client'
import { useRouter }  from 'next/navigation'
import ProfileSection      from './sections/profile'
import SecuritySection     from './sections/security'
import BillingSection      from './sections/billing'
import NotificationsSection from './sections/notifications'
import ApiKeysSection      from './sections/api-keys'
import TeamSection         from './sections/team'
import DangerSection       from './sections/danger'
import { planLabel, userInitials } from '@/lib/utils'
import Link from 'next/link'

const SECTIONS = [
  { id: 'profile',       n: '01', label: 'Profile',       desc: 'Name, photo, public slug' },
  { id: 'security',      n: '02', label: 'Security',      desc: 'Password & sessions' },
  { id: 'billing',       n: '03', label: 'Plan & Billing', desc: 'Subscription · invoices' },
  { id: 'notifications', n: '04', label: 'Notifications', desc: 'What we email you' },
  { id: 'api',           n: '05', label: 'API Keys',      desc: 'For developers' },
  { id: 'team',          n: '06', label: 'Team',          desc: 'Seats & invites' },
  { id: 'danger',        n: '07', label: 'Danger Zone',   desc: 'Export · delete' },
]

export interface UserData {
  id: string; name: string; email: string
  slug: string | null; planId: string; image: string | null
}
export interface ProfileData {
  pronouns: string; phone: string; title: string
  bio: string; location: string; links: string[]
}
export interface NotifData {
  scanAlerts: boolean; weeklyDigest: boolean
  productNews: boolean; securityAlerts: boolean
}
export interface ApiKeyRow {
  id: string; label: string; keyPrefix: string
  createdAt: string; lastUsedAt: string | null
}
export interface OrderRow {
  id: string; planName: string; amount: number; currency: string
  country: string | null; annual: boolean; invoiceNumber: string | null; createdAt: string
}
export interface TeamMemberRow {
  id: string; invitedEmail: string; role: string
  acceptedAt: string | null; createdAt: string
}
export interface WebhookRow {
  id: string; url: string; active: boolean; createdAt: string
}
export interface SessionRow {
  id: string; ipAddress: string | null; userAgent: string | null; createdAt: string
}

interface Props {
  section:     string
  userData:    UserData
  profile:     ProfileData
  notifications: NotifData
  apiKeys:     ApiKeyRow[]
  orders:      OrderRow[]
  teamMembers: TeamMemberRow[]
  sessions:    SessionRow[]
  apiUsage:    { used: number; limit: number }
  webhooks:    WebhookRow[]
}

export default function AccountLayout({
  section, userData, profile, notifications,
  apiKeys, orders, teamMembers, sessions, apiUsage, webhooks,
}: Props) {
  const router = useRouter()
  const initials = userInitials(userData.name, userData.email)

  return (
    <>
      <div className="acct-intro">
        <h2>Your <span className="it">account.</span></h2>
      </div>

      <div className="acct-frame">
        {/* ── Rail ─────────────────────────────────────────── */}
        <aside className="acct-rail">
          <div className="acct-rail-ttl">Sections</div>
          <ul>
            {SECTIONS.map(s => (
              <li
                key={s.id}
                className={section === s.id ? 'on' : ''}
                onClick={() => router.push(`/account/${s.id}`)}
              >
                <div className="acct-rail-row">
                  <span className="n">{s.n}</span>
                  <span>
                    <span className="lbl">{s.label}</span>
                    <span className="desc">{s.desc}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="acct-rail-foot">
            <div className="rail-status">
              <div className="lbl">Plan</div>
              <div className="val">{planLabel(userData.planId)}</div>
              {!['pro','atelier'].includes(userData.planId) && (
                <Link href="/pricing">↗ Upgrade</Link>
              )}
            </div>
          </div>
        </aside>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="acct-main">
          {section === 'profile'       && <ProfileSection       user={userData} profile={profile} />}
          {section === 'security'      && <SecuritySection      sessions={sessions} />}
          {section === 'billing'       && <BillingSection       user={userData} orders={orders} />}
          {section === 'notifications' && <NotificationsSection prefs={notifications} />}
          {section === 'api'           && <ApiKeysSection       user={userData} apiKeys={apiKeys} apiUsage={apiUsage} webhooks={webhooks} />}
          {section === 'team'          && <TeamSection          user={userData} teamMembers={teamMembers} />}
          {section === 'danger'        && <DangerSection        user={userData} />}
        </div>
      </div>
    </>
  )
}
