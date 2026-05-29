'use server'
import bcrypt                from 'bcryptjs'
import { revalidatePath }   from 'next/cache'
import { headers }          from 'next/headers'
import { redirect }         from 'next/navigation'
import { auth }             from '@/lib/auth'
import { db }               from '@/db'
import {
  user, userProfile, notificationPref,
  apiKey, teamMember, account, session, webhookEndpoint,
} from '@/db/schema'
import { eq, and }          from 'drizzle-orm'
import { randomBytes }      from 'crypto'
import { generateId, generateApiToken, hashValue } from '@/lib/utils'
import { generateWebhookSecret } from '@/lib/webhook-deliver'

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user
}

/* ── Profile ──────────────────────────────────────────────── */
export async function updateProfile(input: {
  name:      string
  slug:      string
  pronouns:  string
  phone:     string
  title:     string
  bio:       string
  location:  string
}) {
  const u = await requireUser()

  // Fetch current slug before updating so we can revalidate the old path too
  const [existing] = await db.select({ slug: user.slug }).from(user).where(eq(user.id, u.id)).limit(1)
  const oldSlug = existing?.slug ?? null
  const newSlug = input.slug.trim() || null

  await db.update(user)
    .set({ name: input.name.trim(), slug: newSlug, updatedAt: new Date() })
    .where(eq(user.id, u.id))

  await db.insert(userProfile)
    .values({
      userId:   u.id,
      pronouns: input.pronouns,
      phone:    input.phone,
      title:    input.title,
      bio:      input.bio,
      location: input.location,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: {
        pronouns:  input.pronouns,
        phone:     input.phone,
        title:     input.title,
        bio:       input.bio,
        location:  input.location,
        updatedAt: new Date(),
      },
    })

  revalidatePath('/account/profile')

  // Revalidate public identity + CV pages for both old and new slug
  const slugsToRevalidate = [...new Set([oldSlug, newSlug].filter(Boolean))] as string[]
  for (const s of slugsToRevalidate) {
    revalidatePath(`/u/${s}`)
    revalidatePath(`/cv/${s}`)
  }
}

/* ── Password ─────────────────────────────────────────────── */
export async function changePassword(currentPw: string, newPw: string): Promise<{ error?: string }> {
  const u = await requireUser()

  const [cred] = await db.select({ password: account.password })
    .from(account)
    .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential')))

  if (!cred?.password) return { error: 'No password set on this account.' }

  const valid = await bcrypt.compare(currentPw, cred.password)
  if (!valid) return { error: 'Current password is incorrect.' }

  if (newPw.length < 8) return { error: 'New password must be at least 8 characters.' }

  const hashed = await bcrypt.hash(newPw, 12)
  await db.update(account)
    .set({ password: hashed, updatedAt: new Date() })
    .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential')))

  revalidatePath('/account/security')
  return {}
}

/* ── Notifications ────────────────────────────────────────── */
export async function updateNotifications(prefs: {
  scanAlerts:   boolean
  weeklyDigest: boolean
  productNews:  boolean
}) {
  const u = await requireUser()

  await db.insert(notificationPref)
    .values({
      userId:       u.id,
      scanAlerts:   prefs.scanAlerts,
      weeklyDigest: prefs.weeklyDigest,
      productNews:  prefs.productNews,
      securityAlerts: true,
      updatedAt:    new Date(),
    })
    .onConflictDoUpdate({
      target: notificationPref.userId,
      set: {
        scanAlerts:   prefs.scanAlerts,
        weeklyDigest: prefs.weeklyDigest,
        productNews:  prefs.productNews,
        updatedAt:    new Date(),
      },
    })

  revalidatePath('/account/notifications')
}

/* ── API Keys ─────────────────────────────────────────────── */
export async function createApiKey(label: string): Promise<{ rawToken: string }> {
  const u = await requireUser()
  const raw    = generateApiToken('qd_live')
  const hashed = hashValue(raw)
  const prefix = raw.slice(0, 12)

  await db.insert(apiKey).values({
    id:        generateId(),
    userId:    u.id,
    label:     label.trim(),
    keyHash:   hashed,
    keyPrefix: prefix,
    createdAt: new Date(),
  })

  revalidatePath('/account/api')
  return { rawToken: raw }
}

export async function revokeApiKey(keyId: string) {
  const u = await requireUser()
  await db.delete(apiKey)
    .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, u.id)))
  revalidatePath('/account/api')
}

/* ── Team ─────────────────────────────────────────────────── */
export async function inviteTeamMember(email: string, role: string): Promise<{ inviteUrl: string }> {
  const u     = await requireUser()
  const token = randomBytes(24).toString('hex')
  const expires = new Date(Date.now() + 7 * 86400_000) // 7 days

  await db.insert(teamMember).values({
    id:              generateId(),
    ownerId:         u.id,
    invitedEmail:    email.toLowerCase().trim(),
    role,
    inviteToken:     token,
    inviteExpiresAt: expires,
    createdAt:       new Date(),
  })
  revalidatePath('/account/team')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return { inviteUrl: `${appUrl}/invite/${token}` }
}

export async function acceptInvite(token: string): Promise<{ error?: string }> {
  const u = await requireUser()

  const [invite] = await db.select().from(teamMember).where(eq(teamMember.inviteToken, token)).limit(1)
  if (!invite) return { error: 'Invite not found.' }
  if (invite.inviteExpiresAt && invite.inviteExpiresAt < new Date()) return { error: 'This invite has expired.' }
  if (invite.acceptedAt) return { error: 'Invite already accepted.' }
  if (invite.invitedEmail !== u.email) return { error: 'This invite was sent to a different email address.' }

  await db.update(teamMember)
    .set({ memberId: u.id, acceptedAt: new Date(), inviteToken: null })
    .where(eq(teamMember.id, invite.id))

  return {}
}

export async function removeTeamMember(memberId: string) {
  const u = await requireUser()
  await db.delete(teamMember)
    .where(and(eq(teamMember.id, memberId), eq(teamMember.ownerId, u.id)))
  revalidatePath('/account/team')
}

export async function updateTeamMemberRole(memberId: string, role: string) {
  const u = await requireUser()
  await db.update(teamMember)
    .set({ role })
    .where(and(eq(teamMember.id, memberId), eq(teamMember.ownerId, u.id)))
  revalidatePath('/account/team')
}

/* ── Danger ───────────────────────────────────────────────── */
export async function deleteAccount() {
  const u = await requireUser()
  await db.delete(user).where(eq(user.id, u.id))
  redirect('/sign-in')
}

export async function revokeSession(sessionId: string) {
  const u = await requireUser()
  await db.delete(session)
    .where(and(eq(session.id, sessionId), eq(session.userId, u.id)))
  revalidatePath('/account/security')
}

/* ── Webhooks ─────────────────────────────────────────────── */
export async function createWebhook(url: string): Promise<{ rawSecret: string }> {
  const u = await requireUser()
  const { raw, hash } = generateWebhookSecret()

  await db.insert(webhookEndpoint).values({
    id:         generateId(),
    userId:     u.id,
    url:        url.trim(),
    secretHash: hash,
    active:     true,
    createdAt:  new Date(),
  })
  revalidatePath('/account/api')
  return { rawSecret: raw }
}

export async function deleteWebhook(webhookId: string) {
  const u = await requireUser()
  await db.delete(webhookEndpoint)
    .where(and(eq(webhookEndpoint.id, webhookId), eq(webhookEndpoint.userId, u.id)))
  revalidatePath('/account/api')
}

export async function toggleWebhook(webhookId: string, active: boolean) {
  const u = await requireUser()
  await db.update(webhookEndpoint)
    .set({ active })
    .where(and(eq(webhookEndpoint.id, webhookId), eq(webhookEndpoint.userId, u.id)))
  revalidatePath('/account/api')
}
