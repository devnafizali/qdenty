import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/db'
import { user as userTable, order } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import type Stripe from 'stripe'

// Stripe requires the raw body for signature verification — disable Next.js body parsing
export const runtime = 'nodejs'

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  pro:     'Professional',
  atelier: 'Atelier',
}

function uid() { return randomBytes(12).toString('hex') }

function invoiceNumber(): string {
  const now = new Date()
  const y   = now.getFullYear()
  const m   = String(now.getMonth() + 1).padStart(2, '0')
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `QD-${y}${m}-${seq}`
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  const sig  = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(sub)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(sub)
        break
      }
      case 'invoice.payment_failed': {
        // Log but don't crash — user retains access until grace period ends
        console.warn('invoice.payment_failed:', event.data.object)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!stripe) return
  const userId  = session.metadata?.userId
  const planId  = session.metadata?.planId  ?? 'starter'
  const country = session.metadata?.country ?? null
  const annual  = session.metadata?.annual === 'true'

  if (!userId) return

  // Get subscription details for amount
  let amountCents = 0
  let currency    = 'usd'
  let subId: string | null = null

  if (session.subscription) {
    const sub = await stripe.subscriptions.retrieve(session.subscription as string)
    subId = sub.id
    const item = sub.items.data[0]
    amountCents = item?.price?.unit_amount ?? 0
    currency    = item?.price?.currency?.toUpperCase() ?? 'USD'

    await db.update(userTable)
      .set({ stripeSubscriptionId: subId, planId })
      .where(eq(userTable.id, userId))
  }

  await db.update(userTable)
    .set({ planId })
    .where(eq(userTable.id, userId))

  // Create order / invoice record
  await db.insert(order).values({
    id:                    uid(),
    userId,
    stripePaymentIntentId: session.payment_intent as string | null ?? null,
    planId,
    planName:              PLAN_NAMES[planId] ?? planId,
    amount:                amountCents,
    currency:              currency.toUpperCase(),
    country,
    annual,
    status:                'paid',
    invoiceNumber:         invoiceNumber(),
  })
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId
  if (!userId) return
  const planId = sub.metadata?.planId ?? 'free'
  const status = sub.status

  if (status === 'active' || status === 'trialing') {
    await db.update(userTable).set({ planId }).where(eq(userTable.id, userId))
  } else if (status === 'past_due' || status === 'unpaid') {
    // Keep plan but could add a flag in future
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId
  if (!userId) return
  await db.update(userTable)
    .set({ planId: 'free', stripeSubscriptionId: null })
    .where(eq(userTable.id, userId))
}
