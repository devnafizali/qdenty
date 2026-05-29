import PricingClient from '@/components/marketing/pricing-client'

export const metadata = { title: 'Pricing — qdenty' }

export default function PricingPage() {
  return (
    <section className="screen" id="pricing">
      <div className="pricing-head">
        <div className="eyebrow">Five tiers · no surprises</div>
        <h2>Pay for <span className="it">power,</span><br />not for paper.</h2>
        <p>Generate without signing in. Make an account for dynamic codes. Subscribe when you need volume, validity, or analytics.</p>
      </div>
      <PricingClient />
    </section>
  )
}
