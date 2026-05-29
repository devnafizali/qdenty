import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { stripe, STRIPE_PRICES, stripeConfigured } from '@/lib/stripe'
import { db } from '@/db'
import { user as userTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  if (!stripeConfigured() || !stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json() as {
    planId:  string
    annual:  boolean
    country: string
    email:   string
    name:    string
  }

  const { planId, annual, country, email, name } = body

  const prices = STRIPE_PRICES[planId]
  if (!prices) {
    return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
  }

  const priceId = annual ? prices.annual : prices.monthly
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured for this plan/period' }, { status: 503 })
  }

  // Retrieve or create Stripe customer
  const u = session.user as { id: string; stripeCustomerId?: string }
  let customerId = u.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    email || session.user.email,
      name:     name  || session.user.name,
      metadata: { userId: u.id, country },
    })
    customerId = customer.id
    await db.update(userTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(userTable.id, u.id))
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer:             customerId,
    payment_method_types: ['card'],
    mode:                 'subscription',
    line_items: [{
      price:    priceId,
      quantity: 1,
    }],
    success_url: `${APP_URL}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${APP_URL}/checkout?plan=${planId}&annual=${annual}`,
    metadata: {
      userId:  u.id,
      planId,
      country,
      annual:  String(annual),
    },
    subscription_data: {
      metadata: { userId: u.id, planId },
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
