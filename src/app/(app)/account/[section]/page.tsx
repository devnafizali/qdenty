import { headers }   from 'next/headers'
import { redirect }  from 'next/navigation'
import { auth }      from '@/lib/auth'
import { db }        from '@/db'
import { userProfile, notificationPref, apiKey, teamMember, order, session, webhookEndpoint } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import AccountLayout from '@/components/account/account-layout'
import type { Metadata } from 'next'
import '../account.css'

const VALID_SECTIONS = ['profile','security','billing','notifications','api','team','danger'] as const
type Section = typeof VALID_SECTIONS[number]

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params
  const titles: Record<string, string> = {
    profile: 'Profile', security: 'Security', billing: 'Plan & Billing',
    notifications: 'Notifications', api: 'API Keys', team: 'Team', danger: 'Danger Zone',
  }
  return { title: `${titles[section] ?? 'Account'} — Qdenty` }
}

export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!VALID_SECTIONS.includes(section as Section)) redirect('/account/profile')

  const sess = await auth.api.getSession({ headers: await headers() })
  if (!sess) redirect('/sign-in')

  const u      = sess.user as { id: string; name: string; email: string; planId?: string; slug?: string; image?: string }
  const userId = u.id

  const [profile, notifs, apiKeys, orders, teamMembers, sessions, webhooks] = await Promise.all([
    db.select().from(userProfile).where(eq(userProfile.userId, userId)).then(r => r[0] ?? null),
    db.select().from(notificationPref).where(eq(notificationPref.userId, userId)).then(r => r[0] ?? null),
    db.select().from(apiKey).where(and(eq(apiKey.userId, userId), isNull(apiKey.revokedAt))),
    db.select().from(order).where(eq(order.userId, userId)),
    db.select().from(teamMember).where(eq(teamMember.ownerId, userId)),
    db.select({
      id: session.id, ipAddress: session.ipAddress,
      userAgent: session.userAgent, createdAt: session.createdAt,
    }).from(session).where(eq(session.userId, userId)),
    db.select({
      id: webhookEndpoint.id, url: webhookEndpoint.url,
      active: webhookEndpoint.active, createdAt: webhookEndpoint.createdAt,
    }).from(webhookEndpoint).where(eq(webhookEndpoint.userId, userId)),
  ])

  return (
    <div className="screen">
      <AccountLayout
        section={section as Section}
        userData={{
          id:     u.id,
          name:   u.name,
          email:  u.email,
          slug:   u.slug ?? null,
          planId: u.planId ?? 'free',
          image:  u.image ?? null,
        }}
        profile={profile ? {
          pronouns: profile.pronouns ?? '',
          phone:    profile.phone    ?? '',
          title:    profile.title    ?? '',
          bio:      profile.bio      ?? '',
          location: profile.location ?? '',
          links:    (profile.links   ?? []) as string[],
        } : { pronouns: '', phone: '', title: '', bio: '', location: '', links: [] }}
        notifications={{
          scanAlerts:     notifs?.scanAlerts     ?? true,
          weeklyDigest:   notifs?.weeklyDigest   ?? true,
          productNews:    notifs?.productNews    ?? true,
          securityAlerts: notifs?.securityAlerts ?? true,
        }}
        apiKeys={apiKeys.map(k => ({
          id:         k.id,
          label:      k.label,
          keyPrefix:  k.keyPrefix,
          createdAt:  k.createdAt.toISOString(),
          lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        }))}
        orders={orders.map(o => ({
          id:            o.id,
          planName:      o.planName,
          amount:        o.amount,
          currency:      o.currency,
          country:       o.country ?? null,
          annual:        o.annual,
          invoiceNumber: o.invoiceNumber ?? null,
          createdAt:     o.createdAt.toISOString(),
        }))}
        teamMembers={teamMembers.map(m => ({
          id:           m.id,
          invitedEmail: m.invitedEmail,
          role:         m.role,
          acceptedAt:   m.acceptedAt?.toISOString() ?? null,
          createdAt:    m.createdAt.toISOString(),
        }))}
        sessions={sessions.map(s => ({
          id:         s.id,
          ipAddress:  s.ipAddress ?? null,
          userAgent:  s.userAgent ?? null,
          createdAt:  s.createdAt.toISOString(),
        }))}
        apiUsage={{ used: apiKeys.length * 120, limit: u.planId === 'atelier' ? 999999 : u.planId === 'pro' ? 5000 : 0 }}
        webhooks={webhooks.map(w => ({
          id:        w.id,
          url:       w.url,
          active:    w.active,
          createdAt: w.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
