import Stripe from 'stripe'

// Returns null when STRIPE_SECRET_KEY is not set (dev/test without Stripe)
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

export const stripe = getStripe()

// Price IDs per plan / billing period.
// Set these in your Stripe dashboard and add to .env.local.
export const STRIPE_PRICES: Record<string, { monthly: string; annual: string }> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_PRO_ANNUAL  ?? '',
  },
  atelier: {
    monthly: process.env.STRIPE_PRICE_ATELIER_MONTHLY ?? '',
    annual:  process.env.STRIPE_PRICE_ATELIER_ANNUAL  ?? '',
  },
}

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}
