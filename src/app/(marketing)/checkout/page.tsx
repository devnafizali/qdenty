import { Suspense } from 'react'
import CheckoutClient from '@/components/marketing/checkout-client'

export const metadata = { title: 'Checkout — qdenty' }

export default function CheckoutPage() {
  return (
    <section className="screen" id="checkout" style={{ paddingTop: 48 }}>
      <Suspense fallback={<div style={{ padding: 64, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Loading…</div>}>
        <CheckoutClient />
      </Suspense>
    </section>
  )
}
