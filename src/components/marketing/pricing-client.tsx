'use client'

import { useState } from 'react'
import Link from 'next/link'

const TIERS = [
  {
    id: 'guest',
    name: 'Guest',
    desc: 'For one-off codes. No account, no email, no fuss.',
    monthly: 0, annual: 0, label: 'free', period: 'No login required',
    validity: 'Validity · forever (static codes)',
    features: [
      { t: 'Up to 3 codes per session',     no: false },
      { t: 'Static codes only',             no: false },
      { t: '6 basic templates',             no: false },
      { t: 'PNG download · 600px',          no: false },
      { t: 'No analytics',                  no: true  },
      { t: 'No editing after generation',   no: true  },
      { t: 'No custom colours / logo',      no: true  },
    ],
    cta: 'Generate Now', href: '/builder',
  },
  {
    id: 'free',
    name: 'Free Account',
    nameEl: <>Free <span className="it">Account</span></>,
    desc: 'Personal use. Save codes, edit them, basic dynamic links.',
    monthly: 0, annual: 0, label: 'free', period: 'Per month · forever',
    validity: 'Validity · 12 months per dynamic code',
    features: [
      { t: 'Up to 10 saved codes',          no: false },
      { t: '2 dynamic codes · editable',    no: false },
      { t: 'All free templates (12)',        no: false },
      { t: 'PNG · JPG · SVG download',      no: false },
      { t: 'Basic scan analytics · 30 days',no: false },
      { t: '1 Identity Page + 1 CV',        no: false },
      { t: 'No custom branding',            no: true  },
    ],
    cta: 'Create Account', href: '/sign-up',
  },
  {
    id: 'starter',
    name: 'Starter',
    desc: 'For creators, freelancers, side projects. Everything dynamic.',
    monthly: 8, annual: 6, label: 'mo',
    period: 'Billed annually · $72/yr',
    validity: 'Validity · 3 years per code',
    tag: 'Popular',
    features: [
      { t: 'Up to 50 codes · all dynamic', no: false },
      { t: 'All 22 templates unlocked',    no: false },
      { t: 'PDF · EPS · vector exports',   no: false },
      { t: 'Logo + custom colours',        no: false },
      { t: 'Scan analytics · 12 months',   no: false },
      { t: 'Geo & device breakdowns',      no: false },
      { t: '3 CV templates · ATS check',   no: false },
      { t: 'Custom domain redirect',       no: false },
    ],
    cta: 'Start Starter',
  },
  {
    id: 'pro',
    name: 'Professional',
    desc: 'Small businesses & teams. Unlimited generation with team controls.',
    monthly: 25, annual: 19, label: 'mo',
    period: 'Billed annually · $228/yr',
    validity: 'Validity · lifetime, codes never expire',
    featured: true, tag: 'Recommended',
    features: [
      { t: 'Unlimited dynamic codes',        no: false },
      { t: 'Up to 5 team seats',             no: false },
      { t: 'All templates + bulk generation',no: false },
      { t: 'API access · 5,000 calls/mo',    no: false },
      { t: 'White-label landing pages',      no: false },
      { t: 'Full analytics + CSV export',    no: false },
      { t: 'All 12 CV templates',            no: false },
      { t: 'Password-protected codes',       no: false },
      { t: 'Priority support · 24h SLA',     no: false },
    ],
    cta: 'Go Professional',
  },
]

const ENTERPRISE = ['Unlimited seats', 'SSO / SAML', 'Dedicated CSM', 'On-prem option', 'Custom SLA · 4h', 'Audit logs · SOC2', 'Unlimited API', 'Custom integrations']

export default function PricingClient() {
  const [annual, setAnnual] = useState(true)

  return (
    <>
      <div className="billing-toggle">
        <div className="tg">
          <span className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Monthly</span>
          <span className={annual  ? 'on' : ''} onClick={() => setAnnual(true)}>Annual</span>
        </div>
        <span className="save">save up to 32%</span>
      </div>

      <div className="price-grid">
        {TIERS.map(t => {
          const price  = annual ? t.annual  : t.monthly
          const href   = t.href ?? `/checkout?plan=${t.id}&annual=${annual}`
          return (
            <div key={t.id} className={'price-tier' + (t.featured ? ' featured' : '')}>
              {t.tag && <span className="pt-tag">{t.tag}</span>}
              <div className="pt-name">{t.nameEl ?? t.name}</div>
              <div className="pt-desc">{t.desc}</div>
              <div className="pt-price">
                <span className="amount">{price}</span>
                <span className="curr">{t.monthly === 0 ? 'free' : '/' + t.label}</span>
              </div>
              <div className="pt-period">{t.period}</div>
              <div className="pt-validity">{t.validity}</div>
              <ul className="feat-list">
                {t.features.map((f, j) => (
                  <li key={j} className={f.no ? 'no' : ''}>{f.t}</li>
                ))}
              </ul>
              <Link href={href} className="pt-cta">{t.cta}</Link>
            </div>
          )
        })}
      </div>

      <div className="atelier-row">
        <div>
          <div className="lbl">Parent Company · Enterprise</div>
          <h3>Mabous Innovations<br /><span className="it">&amp; Engineering Ltd.</span></h3>
          <p style={{ color: 'var(--ink-mute)', fontSize: 14, marginTop: 8, textWrap: 'pretty' }}>
            The studio behind qdenty. For enterprise rollouts — events, hospitality, retail, education, government — talk to us about custom plans, on-prem hosting, and SLAs.
          </p>
        </div>
        <ul>
          {ENTERPRISE.map(l => <li key={l}>— {l}</li>)}
        </ul>
        <div className="ar-right">
          <div className="ar-gold">Dhaka · Lisbon</div>
          <div className="ar-talk">Talk to us</div>
          <button className="btn-pri" style={{ marginTop: 12 }}>Book a Call</button>
        </div>
      </div>
    </>
  )
}
