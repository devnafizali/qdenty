'use client'
import { useState } from 'react'
import Link from 'next/link'
import { planLabel } from '@/lib/utils'
import { getBillingPortalUrl, cancelSubscription } from '@/app/actions/billing'
import type { UserData, OrderRow } from '../account-layout'

const PLAN_DESC: Record<string, string> = {
  free:    'Free Account. Up to 10 saved codes and 2 dynamic links.',
  starter: 'Starter · 50 dynamic codes, all templates, vector exports.',
  pro:     'Professional · unlimited codes, team controls, API + analytics.',
  atelier: 'Atelier Enterprise · talk to your account manager for changes.',
}

const CURRENCY: Record<string, string> = {
  USD:'$', CAD:'C$', GBP:'£', JPY:'¥', INR:'₹', BRL:'R$', MXN:'MX$',
  SGD:'S$', ZAR:'R', AUD:'A$', AED:'د.إ', BDT:'৳', EUR:'€',
}

export default function BillingSection({ user, orders }: { user: UserData; orders: OrderRow[] }) {
  const isPaid             = ['starter','pro','atelier'].includes(user.planId)
  const [busy, setBusy]   = useState<string | null>(null)
  const [notice, setNote] = useState<string | null>(null)

  async function openPortal() {
    setBusy('portal')
    const result = await getBillingPortalUrl()
    setBusy(null)
    if ('url' in result) {
      window.location.href = result.url
    } else {
      setNote(result.error)
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel your subscription? You keep access until the end of the current billing period.')) return
    setBusy('cancel')
    const result = await cancelSubscription()
    setBusy(null)
    if ('ok' in result) {
      setNote('Subscription cancelled. Your plan stays active until the end of this billing period.')
    } else {
      setNote(result.error)
    }
  }

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">Plan &amp; <span className="it">billing.</span></h2>
        <p className="acct-sub-p">Manage your subscription and see past invoices.</p>
      </div>

      {notice && (
        <div className="acct-notice" style={{ marginBottom: 20 }}>
          {notice}
          <button className="acct-link" style={{ marginLeft: 12 }} onClick={() => setNote(null)}>×</button>
        </div>
      )}

      <div className={`plan-banner ${isPaid ? 'paid' : ''}`}>
        <div>
          <div className="plan-banner-lbl">Current plan</div>
          <div className="plan-banner-h">{planLabel(user.planId)}</div>
          <p className="plan-banner-p">{PLAN_DESC[user.planId] ?? PLAN_DESC.free}</p>
        </div>
        <div className="plan-banner-cta">
          {!isPaid && (
            <Link href="/pricing" className="btn-pri" style={{ textAlign: 'center' }}>Upgrade plan</Link>
          )}
          {isPaid && user.planId !== 'pro' && user.planId !== 'atelier' && (
            <Link href="/pricing" className="btn-pri" style={{ textAlign: 'center' }}>Upgrade to Pro</Link>
          )}
          {isPaid && (
            <button className="btn-mini-ghost" onClick={handleCancel} disabled={busy === 'cancel'}>
              {busy === 'cancel' ? 'Cancelling…' : 'Cancel plan'}
            </button>
          )}
        </div>
      </div>

      <h3 className="acct-h3">Payment method</h3>
      <div className="acct-card flex">
        {isPaid && orders.length > 0 ? (
          <>
            <div style={{ flex: 1 }}>
              <div className="acct-card-h">Card on file</div>
              <p className="acct-card-p">Managed via Stripe. Use the billing portal to update or replace.</p>
            </div>
            <button className="btn-mini-ghost" onClick={openPortal} disabled={busy === 'portal'}>
              {busy === 'portal' ? 'Loading…' : 'Manage →'}
            </button>
          </>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <div className="acct-card-h">No payment method on file</div>
              <p className="acct-card-p">Add one when you upgrade your plan.</p>
            </div>
            <Link href="/pricing" className="btn-mini">Add</Link>
          </>
        )}
      </div>

      <h3 className="acct-h3" style={{ marginTop: 32 }}>Invoices</h3>
      {orders.length === 0 ? (
        <div className="acct-empty">
          <div className="acct-empty-h">No invoices yet</div>
          <p className="acct-empty-p">Every payment will appear here as a downloadable invoice.</p>
        </div>
      ) : (
        <table className="acct-table">
          <thead>
            <tr><th>Date</th><th>Invoice</th><th>Plan</th><th>Amount</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const sym = CURRENCY[o.currency] ?? '€'
              const amt = (o.amount / 100).toLocaleString('en', { minimumFractionDigits: 2 })
              return (
                <tr key={o.id}>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td><span className="acct-table-mono">{o.invoiceNumber ?? o.id.slice(0, 8).toUpperCase()}</span></td>
                  <td>{o.planName} · {o.annual ? 'Annual' : 'Monthly'}</td>
                  <td><b>{sym}{amt}</b></td>
                  <td><span className="acct-pill on">Paid</span></td>
                  <td>
                    <a className="acct-link" href={`/api/invoice/${o.id}`} target="_blank" rel="noopener noreferrer">
                      ↓ Invoice
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}
