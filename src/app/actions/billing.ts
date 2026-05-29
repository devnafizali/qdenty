'use server'
import { headers }   from 'next/headers'
import { auth }      from '@/lib/auth'
import { stripe, stripeConfigured } from '@/lib/stripe'
import { db }        from '@/db'
import { user as userTable, order } from '@/db/schema'
import { eq }        from 'drizzle-orm'
import { generateId } from '@/lib/utils'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function getBillingPortalUrl(): Promise<{ url: string } | { error: string }> {
  if (!stripeConfigured() || !stripe) {
    return { error: 'Stripe not configured' }
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorised' }

  const u = session.user as { id: string }
  const [row] = await db
    .select({ stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, u.id))
    .limit(1)

  if (!row?.stripeCustomerId) {
    return { error: 'No billing account found. Upgrade your plan first.' }
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   row.stripeCustomerId,
    return_url: `${APP_URL}/account/billing`,
  })

  return { url: portalSession.url }
}

export async function cancelSubscription(): Promise<{ ok: boolean } | { error: string }> {
  if (!stripeConfigured() || !stripe) {
    return { error: 'Stripe not configured' }
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorised' }

  const u = session.user as { id: string }
  const [row] = await db
    .select({
      stripeCustomerId:     userTable.stripeCustomerId,
      stripeSubscriptionId: userTable.stripeSubscriptionId,
    })
    .from(userTable)
    .where(eq(userTable.id, u.id))
    .limit(1)

  if (!row?.stripeSubscriptionId) {
    return { error: 'No active subscription found.' }
  }

  // Cancel at period end — user retains access until billing cycle ends
  await stripe.subscriptions.update(row.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  return { ok: true }
}

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  pro:     'Professional',
  atelier: 'Atelier',
}

const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 800,  annual: 7200  },  // cents
  pro:     { monthly: 2500, annual: 22800 },
  atelier: { monthly: 7900, annual: 75600 },
}

export async function completeSandboxPayment(input: {
  planId:     string
  annual:     boolean
  country:    string
  payMethod:  string
  fullName:   string
  email:      string
  amountUsd:  number  // already-computed total in display currency (stored as integer cents approximation)
}): Promise<{ orderNumber: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Not authenticated. Please sign in.' }

  const u = session.user as { id: string }
  const planName = PLAN_NAMES[input.planId]
  if (!planName) return { error: 'Invalid plan.' }

  const prices  = PLAN_PRICES[input.planId]
  const amount  = input.annual ? prices.annual : prices.monthly
  const orderId = generateId()
  const invNum  = 'QD-' + Date.now().toString(36).toUpperCase().slice(-7)

  await Promise.all([
    db.update(userTable)
      .set({ planId: input.planId, updatedAt: new Date() })
      .where(eq(userTable.id, u.id)),

    db.insert(order).values({
      id:            orderId,
      userId:        u.id,
      planId:        input.planId,
      planName,
      amount,
      currency:      'USD',
      country:       input.country,
      annual:        input.annual,
      status:        'paid',
      invoiceNumber: invNum,
      createdAt:     new Date(),
    }),
  ])

  return { orderNumber: invNum }
}
