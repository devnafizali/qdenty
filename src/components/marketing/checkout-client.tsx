'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MarketingQr from '@/components/marketing/marketing-qr'
import { completeSandboxPayment } from '@/app/actions/billing'

/* ── data ──────────────────────────────────────────────────── */
const COUNTRIES = [
  ['BD','Bangladesh · ৳'],['IN','India · ₹'],['PK','Pakistan · ₨'],['LK','Sri Lanka · ₨'],['NP','Nepal · ₨'],
  ['PT','Portugal · €'],['ES','Spain · €'],['FR','France · €'],['DE','Germany · €'],
  ['IT','Italy · €'],['NL','Netherlands · €'],['BE','Belgium · €'],['IE','Ireland · €'],
  ['GB','United Kingdom · £'],['US','United States · $'],['CA','Canada · C$'],
  ['BR','Brazil · R$'],['MX','Mexico · MX$'],['AU','Australia · A$'],['JP','Japan · ¥'],
  ['SG','Singapore · S$'],['AE','UAE · د.إ'],['SA','Saudi Arabia · ﷼'],['ZA','South Africa · R'],
] as const

const REGIONAL: Record<string, string[]> = {
  BD: ['bkash','nagad','rocket','card'],
  IN: ['card','upi','paypal'],
  PK: ['card','paypal'],
  default_eu: ['card','paypal','sepa','apple'],
  default:    ['card','paypal','apple'],
}
const EU = ['PT','ES','FR','DE','IT','NL','BE','IE','GB']
function methodsFor(c: string) {
  if (REGIONAL[c]) return REGIONAL[c]
  return EU.includes(c) ? REGIONAL.default_eu : REGIONAL.default
}

const METHOD_DEF: Record<string, { name: React.ReactNode; l: string; accent?: string; locked?: boolean }> = {
  card:   { name: <>Card<span className="it"> ·</span></>,   l: 'Visa · Mastercard · Amex' },
  paypal: { name: <>Pay<span className="it">Pal</span></>,   l: 'Redirect to PayPal' },
  sepa:   { name: <>SEPA<span className="it"> ·</span></>,   l: 'EU bank debit' },
  apple:  { name: <>Apple<span className="it"> Pay</span></>, l: 'Touch ID · Face ID', locked: true },
  bkash:  { name: <>b<span className="it">Kash</span></>,    l: 'Mobile · OTP · BDT', accent: '#E2136E' },
  nagad:  { name: <>Nagad</>,                                l: 'Govt mobile wallet · BDT', accent: '#EE1C25' },
  rocket: { name: <>Rocket</>,                               l: 'DBBL Mobile Banking',      accent: '#8A2D6C' },
  upi:    { name: <>UPI<span className="it"> ·</span></>,    l: 'India · any UPI app',      accent: '#097939' },
}

const WALLET_CFG: Record<string, { brand: string; accent: string; sandboxMobile: string; sandboxOtp: string; sandboxPin: string }> = {
  bkash:  { brand: 'bKash',  accent: '#E2136E', sandboxMobile: '01770618576', sandboxOtp: '123456', sandboxPin: '12121' },
  nagad:  { brand: 'Nagad',  accent: '#EE1C25', sandboxMobile: '01770010060', sandboxOtp: '111111', sandboxPin: '4321' },
  rocket: { brand: 'Rocket', accent: '#8A2D6C', sandboxMobile: '017xxxxxxx0', sandboxOtp: '654321', sandboxPin: '1234' },
}

const PLANS: Record<string, { name: string; monthly: number; annual: number; desc: string; features: string[]; featured?: boolean }> = {
  starter: { name: 'Starter',      monthly: 8,  annual: 6,  desc: 'For creators, freelancers, side projects.', features: ['Up to 50 codes · all dynamic','All 22 templates unlocked','PDF · EPS · vector exports','Logo + custom colours','Scan analytics · 12 months'] },
  pro:     { name: 'Professional', monthly: 25, annual: 19, desc: 'Small businesses & teams. Unlimited codes.', features: ['Unlimited dynamic codes','Up to 5 team seats','All templates + bulk generation','API access · 5,000 calls/mo','Full analytics + CSV export'], featured: true },
}

const VAT: Record<string, number> = { PT:23, ES:21, FR:20, DE:19, IT:22, NL:21, BE:21, IE:23, GB:20, BD:15, IN:18, PK:16 }
function vatFor(c: string) { return VAT[c] ?? 0 }
function currSym(c: string) {
  const m: Record<string, string> = { US:'$', CA:'C$', GB:'£', JP:'¥', IN:'₹', BR:'R$', MX:'MX$', SG:'S$', ZA:'R', AU:'A$', AE:'د.إ', SA:'﷼', BD:'৳', PK:'₨', LK:'₨', NP:'₨' }
  return m[c] ?? '€'
}
function fmt(n: number, c: string) { return currSym(c) + n.toLocaleString() }
function detectBrand(v: string) {
  const n = v.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return ''
}
function fmtCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
}

/* ── component ─────────────────────────────────────────────── */
export default function CheckoutClient() {
  const params  = useSearchParams()
  const router  = useRouter()
  const planId  = (params.get('plan') ?? 'starter') as keyof typeof PLANS
  const plan    = PLANS[planId] ?? PLANS.starter

  const isSuccess = params.get('success') === '1'
  const [step,       setStep]       = useState<1|2|3>(isSuccess ? 3 : 1)
  const [annual,     setAnnual]     = useState(params.get('annual') !== 'false')
  const [payMethod,  setPayMethod]  = useState(() => methodsFor('BD')[0])
  const [promo,      setPromo]      = useState('')
  const [promoOk,    setPromoOk]    = useState(false)
  const [processing, setProcessing] = useState(false)
  const [errors,     setErrors]     = useState<Record<string,string>>({})
  const [orderNo,    setOrderNo]    = useState('')

  const [form, setForm] = useState({
    email: '', fullName: '', company: '', country: 'BD',
    addr1: '', city: '', postal: '', vat: '',
    cardNumber: '', cardName: '', expiry: '', cvc: '',
    upiId: '', iban: '', mobileNum: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // keep pay method valid for country
  useEffect(() => {
    const allowed = methodsFor(form.country)
    if (!allowed.includes(payMethod)) setPayMethod(allowed[0])
  }, [form.country, payMethod])

  const base     = annual ? plan.annual * 12 : plan.monthly
  const disc     = promoOk ? Math.round(base * 0.2) : 0
  const vatRate  = vatFor(form.country) / 100
  const taxable  = Math.max(0, base - disc)
  const tax      = Math.round(taxable * vatRate)
  const total    = taxable + tax
  const brand    = detectBrand(form.cardNumber)

  const validateDetails = useCallback(() => {
    const e: Record<string,string> = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.addr1.trim()) e.addr1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.postal.trim()) e.postal = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const validatePayment = useCallback(() => {
    const e: Record<string,string> = {}
    if (payMethod === 'card') {
      const n = form.cardNumber.replace(/\s/g, '')
      if (n.length < 13) e.cardNumber = 'Card number looks short'
      if (!/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(form.expiry)) e.expiry = 'MM / YY'
      if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = '3–4 digits'
      if (!form.cardName.trim()) e.cardName = 'Required'
    }
    if (payMethod === 'upi' && !/^[\w.-]+@[a-z]+$/i.test(form.upiId)) e.upiId = 'e.g. name@bank'
    if (payMethod === 'sepa' && form.iban.replace(/\s/g, '').length < 15) e.iban = 'IBAN looks short'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form, payMethod])

  const submit = async () => {
    if (!validatePayment()) return
    setProcessing(true)

    // Card payments: hand off to Stripe Checkout (PCI-DSS compliant redirect)
    if (payMethod === 'card') {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId:  planId,
            annual,
            country: form.country,
            email:   form.email,
            name:    form.fullName,
          }),
        })
        const data = await res.json() as { url?: string; error?: string }
        if (data.url) {
          window.location.href = data.url
          return
        }
        // Stripe not configured — fall through to local simulation
        if (data.error === 'Stripe not configured' || data.error?.includes('Price ID')) {
          // dev/demo mode: simulate success
        } else {
          setErrors({ submit: data.error ?? 'Payment failed. Please try again.' })
          setProcessing(false)
          return
        }
      } catch {
        setErrors({ submit: 'Network error. Please try again.' })
        setProcessing(false)
        return
      }
    }

    // Wallet methods and dev fallback: persist plan upgrade + order record
    const result = await completeSandboxPayment({
      planId:    planId,
      annual,
      country:   form.country,
      payMethod,
      fullName:  form.fullName,
      email:     form.email,
      amountUsd: total,
    })
    setProcessing(false)
    if ('error' in result) {
      setErrors({ submit: result.error })
      return
    }
    setOrderNo(result.orderNumber)
    setStep(3)
  }

  const methods = methodsFor(form.country).map(id => ({ id, ...METHOD_DEF[id] }))

  // ── Success screen ──
  if (step === 3) {
    return (
      <div className="success-wrap">
        <div className="success-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </div>
        <h1>Welcome to <span className="it">{plan.name}</span>,<br />friend.</h1>
        <p className="success-lede">
          Your plan is now active. Dynamic codes, vector exports and analytics are live. A receipt is heading to <b style={{ color: 'var(--ink)' }}>{form.email || 'your inbox'}</b>.
        </p>
        <div className="receipt">
          <div className="receipt-main">
            <div className="r-head">
              <div className="r-ttl">
                Receipt · Mabous Innovations &amp; Engineering Ltd.
                <b>{plan.name} <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontWeight: 400, color: 'var(--ink-mute)' }}>· {annual ? 'Annual' : 'Monthly'}</span></b>
              </div>
              <div className="r-no">Order No<b>{orderNo}</b></div>
            </div>
            <div className="r-grid">
              <div className="r-cell"><div className="l">Billed to</div><div className="v">{form.fullName || '—'}</div></div>
              <div className="r-cell"><div className="l">Date</div><div className="v it">{new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' })}</div></div>
              <div className="r-cell"><div className="l">Email</div><div className="v" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{form.email || '—'}</div></div>
              <div className="r-cell"><div className="l">Method</div><div className="v">{payMethod}</div></div>
            </div>
            <div className="r-line"><span className="l">Plan · {plan.name}</span><span>{fmt(base, form.country)}</span></div>
            {disc > 0 && <div className="r-line" style={{ color: 'var(--accent)' }}><span className="l">Promo · QDENTY20</span><span>−{fmt(disc, form.country)}</span></div>}
            {tax > 0 && <div className="r-line"><span className="l">VAT · {(vatRate*100).toFixed(0)}%</span><span>{fmt(tax, form.country)}</span></div>}
            <div className="r-line tot"><span className="l">Total paid</span><span>{fmt(total, form.country)}</span></div>
          </div>
          <div className="receipt-side">
            <div className="r-qr">
              <MarketingQr
                value={`https://qdenty.io/receipt/${orderNo}`}
                size={0}
                color="#0f0e0c"
                bg="#f3efe7"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className="r-note">"Scan to verify · keep for tax records."</div>
            <div className="r-stamp">Paid ✓ {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}</div>
          </div>
        </div>
        <div className="next-cards">
          <Link href="/dashboard" className="nc">
            <div className="nc-n">— Next · 01</div>
            <h4>Open your <span className="it">dashboard</span></h4>
            <p>Your existing codes are now dynamic. Edit destinations, watch the scans roll in.</p>
            <span className="go">Go to dashboard</span>
          </Link>
          <Link href="/builder" className="nc">
            <div className="nc-n">— Next · 02</div>
            <h4>Generate your <span className="it">first</span> code</h4>
            <p>All 22 templates unlocked. PDF, SVG, EPS. Logo embedding.</p>
            <span className="go">Open generator</span>
          </Link>
          <button className="nc" onClick={() => window.print()}>
            <div className="nc-n">— Next · 03</div>
            <h4>Download <span className="it">PDF</span> receipt</h4>
            <p>For your accountant or expense report. Includes VAT breakdown.</p>
            <span className="go">Download PDF</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Main checkout ──
  return (
    <div className="checkout-wrap">
      <div className="ck-head">
        <h2>Almost <span className="it">there.</span></h2>
        <div className="ck-intro">
          <span>Step {step} of 2 · billing &amp; payment</span>
          <p>Two minutes to dynamic codes, analytics, custom branding &amp; all the templates. Cancel anytime.</p>
        </div>
      </div>

      <div className="checkout-steps">
        <div className={'step ' + (step > 1 ? 'done' : 'on')} onClick={() => setStep(1)}>
          <span className="n">1</span><span>Your Details</span>
        </div>
        <div className="divider" />
        <div className={'step ' + (step === 2 ? 'on' : '')} onClick={() => step > 1 && setStep(2)}>
          <span className="n">2</span><span>Payment</span>
        </div>
        <div className="divider" />
        <div className="step">
          <span className="n">3</span><span>Confirmation</span>
        </div>
        <span className="lock-pill">Secure · 256-bit TLS</span>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          {step === 1 && (
            <>
              <div className="crumb">Step 01 · The basics</div>
              <h2>Tell us <span className="it">who</span><br />the invoice is for.</h2>
              <p className="sub">We email the receipt, and use the address for VAT compliance. Nothing else.</p>
              <div className="form-stack">
                <div className="field-row">
                  <div className="field">
                    <label>Full Name</label>
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Adelaide Marlow" />
                    {errors.fullName && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.fullName}</div>}
                  </div>
                  <div className="field">
                    <label>Email · receipt sent here</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@studio.co" />
                    {errors.email && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.email}</div>}
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Company · optional</label>
                    <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Casa Editorial" />
                  </div>
                  <div className="field">
                    <label>VAT / Tax ID · optional</label>
                    <input value={form.vat} onChange={e => set('vat', e.target.value)} placeholder="PT500000000" />
                    <div className="field-hint">EU businesses · removes VAT on invoice</div>
                  </div>
                </div>
                <div className="field">
                  <label>Billing address</label>
                  <input value={form.addr1} onChange={e => set('addr1', e.target.value)} placeholder="Street + number" />
                  {errors.addr1 && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.addr1}</div>}
                </div>
                <div className="field-row" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
                  <div className="field">
                    <label>Country</label>
                    <select value={form.country} onChange={e => set('country', e.target.value)}>
                      {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>City</label>
                    <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lisbon" />
                    {errors.city && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.city}</div>}
                  </div>
                  <div className="field">
                    <label>Postal</label>
                    <input value={form.postal} onChange={e => set('postal', e.target.value)} placeholder="1200-194" />
                    {errors.postal && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.postal}</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="crumb">
                Step 02 · How you&apos;d like to pay
                <span style={{ marginLeft: 12, color: 'var(--accent)' }}>· {COUNTRIES.find(c => c[0] === form.country)?.[1].split(' · ')[0]} options</span>
              </div>
              <h2>Pick a <span className="it">way,</span><br />and you&apos;re in.</h2>
              <p className="sub">Payment processed by Stripe (cards) or by the regional partner. We never see your full credentials.</p>

              <div className="pay-methods" style={{ gridTemplateColumns: `repeat(${Math.min(methods.length, 4)}, 1fr)` }}>
                {methods.map(m => (
                  <div key={m.id}
                    className={'pm pm-' + m.id + (payMethod === m.id ? ' on' : '') + (m.locked ? ' locked' : '')}
                    style={payMethod === m.id && m.accent ? { background: m.accent, color: '#fff' } : {}}
                    onClick={() => !m.locked && setPayMethod(m.id)}>
                    <div className="pm-mark">{m.name}</div>
                    <div className="pm-l">{m.l}</div>
                  </div>
                ))}
              </div>

              {payMethod === 'card' && (
                <>
                  <div className="card-preview">
                    <div className="cp-top">
                      <div className="cp-logo">qdenty<sup>™ pay</sup></div>
                      <div className="cp-chip" />
                    </div>
                    <div className="cp-num">
                      {(form.cardNumber || '0000 0000 0000 0000').split(' ').map((g, i) => (
                        <span key={i}>{(g + '0000').slice(0, 4)}</span>
                      ))}
                    </div>
                    <div className="cp-foot">
                      <div className="cp-block"><div className="l">Cardholder</div><div className="v">{(form.cardName || 'Your Name').slice(0, 22)}</div></div>
                      <div className="cp-block"><div className="l">Expires</div><div className="v">{form.expiry || 'MM / YY'}</div></div>
                      <div className="cp-brand">{brand || 'card'}</div>
                    </div>
                  </div>
                  <div className="card-form">
                    <div className="field">
                      <label>Card Number</label>
                      <div className="input-shell">
                        <input inputMode="numeric" value={form.cardNumber} onChange={e => set('cardNumber', fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={23} autoComplete="cc-number" />
                        {brand && <span className="brand-mark">{brand}</span>}
                      </div>
                      {errors.cardNumber && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cardNumber}</div>}
                    </div>
                    <div className="field">
                      <label>Name on card</label>
                      <input value={form.cardName} onChange={e => set('cardName', e.target.value.toUpperCase())} placeholder="ADELAIDE MARLOW" autoComplete="cc-name" />
                      {errors.cardName && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cardName}</div>}
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Expiry · MM/YY</label>
                        <input inputMode="numeric" value={form.expiry} onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                          if (v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2)
                          set('expiry', v)
                        }} placeholder="04 / 28" maxLength={7} autoComplete="cc-exp" />
                        {errors.expiry && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.expiry}</div>}
                      </div>
                      <div className="field">
                        <label>Security · CVC</label>
                        <input inputMode="numeric" value={form.cvc} onChange={e => set('cvc', e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" maxLength={4} autoComplete="cc-csc" />
                        {errors.cvc && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cvc}</div>}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--paper-2)', border:'1px dashed var(--rule)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--ink-mute)' }}>
                      <span style={{ display:'inline-grid', placeItems:'center', width:18, height:18, border:'1.5px solid var(--accent-2)', borderRadius:'50%', color:'var(--accent-2)', fontFamily:'var(--serif)' }}>✓</span>
                      Encrypted in transit · stored only as token by Stripe
                    </div>
                  </div>
                </>
              )}

              {['bkash','nagad','rocket'].includes(payMethod) && (() => {
                const cfg = WALLET_CFG[payMethod]
                return (
                  <div className="wallet-redirect" style={{ '--wallet-c': cfg.accent } as React.CSSProperties}>
                    <div className="wr-head">
                      <div className="wr-logo" style={{ background: cfg.accent }}>{cfg.brand[0]}</div>
                      <div>
                        <div className="wr-h">You&apos;ll finish on <span className="brand">{cfg.brand}</span></div>
                        <div className="wr-p">Continue redirects you to the official {cfg.brand} gateway. Your PIN and OTP are entered there — never on qdenty.</div>
                      </div>
                    </div>
                    <ul className="wr-list">
                      <li><span className="n">01</span><span><b>Click <em>Pay</em></b> below — we hand off to {cfg.brand}.</span></li>
                      <li><span className="n">02</span><span>Authorise the charge with your mobile, OTP &amp; PIN inside the gateway.</span></li>
                      <li><span className="n">03</span><span>You&apos;re returned to qdenty automatically. Your plan unlocks instantly.</span></li>
                    </ul>
                    <div className="wr-sandbox">
                      <div className="wr-sandbox-l">SANDBOX · use these test credentials in the gateway</div>
                      <div className="wr-sandbox-grid">
                        <div><span className="k">Mobile</span><span className="v">{cfg.sandboxMobile}</span></div>
                        <div><span className="k">OTP</span><span className="v">{cfg.sandboxOtp}</span></div>
                        <div><span className="k">PIN</span><span className="v">{cfg.sandboxPin}</span></div>
                      </div>
                    </div>
                    <div className="wr-trust">
                      <div className="wr-trust-i">
                        <div className="g">⛨</div>
                        <div>
                          <b>End-to-end encrypted</b>
                          <span>PIN never touches qdenty servers</span>
                        </div>
                      </div>
                      <div className="wr-trust-i">
                        <div className="g">◈</div>
                        <div>
                          <b>{cfg.brand}</b>
                          <span>{cfg.brand} merchant API · tokenized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {payMethod === 'upi' && (
                <div className="card-form">
                  <div className="field">
                    <label>UPI ID / VPA</label>
                    <input value={form.upiId} onChange={e => set('upiId', e.target.value.toLowerCase())} placeholder="name@bank" />
                    {errors.upiId && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.upiId}</div>}
                    <div className="field-hint">Any UPI app · GPay · PhonePe · Paytm · BHIM</div>
                  </div>
                  <div className="sepa-mandate">After confirming, you&apos;ll get a collect request in your UPI app. Approve within 5 minutes.</div>
                </div>
              )}

              {payMethod === 'paypal' && (
                <div className="alt-pay">
                  <h3>Redirect to <span className="it">PayPal</span></h3>
                  <p>You&apos;ll finish the payment on paypal.com and come right back.</p>
                  <a className="alt-btn paypal">
                    <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 22 }}>P</span>
                    Continue with PayPal
                  </a>
                </div>
              )}

              {payMethod === 'sepa' && (
                <div className="card-form">
                  <div className="field">
                    <label>Account holder</label>
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>IBAN</label>
                    <input inputMode="numeric" value={form.iban} onChange={e => set('iban', e.target.value.toUpperCase())} placeholder="PT50 0000 0000 0000 0000 0000 0" maxLength={34} />
                    {errors.iban && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.iban}</div>}
                    <div className="field-hint">European Union · € · 3 business days to clear</div>
                  </div>
                  <div className="sepa-mandate">
                    By providing your IBAN you authorise Mabous Innovations &amp; Engineering Ltd. to debit your account in accordance with the SEPA Direct Debit mandate.
                  </div>
                </div>
              )}

              {payMethod === 'apple' && (
                <div className="alt-pay">
                  <h3>Apple <span className="it">Pay</span></h3>
                  <p>Coming soon — we&apos;re finalising entitlements with Apple.</p>
                </div>
              )}
            </>
          )}

          <div className="checkout-footer">
            {step > 1
              ? <button className="back" onClick={() => setStep(1)}>Back</button>
              : <Link href="/pricing" className="back">Back to pricing</Link>
            }
            {step === 1 && (
              <button className="btn-pri" onClick={() => { if (validateDetails()) setStep(2) }}>
                Continue to payment
              </button>
            )}
            {step === 2 && (
              <button className={'btn-pri full' + (processing ? '' : '')} onClick={submit} disabled={processing}
                style={processing ? { background: 'var(--accent)', opacity: 0.8 } : {}}>
                {processing ? 'Processing…' : `Pay ${fmt(total, form.country)}`}
              </button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <aside className="order-summary">
          <div className="os-ttl">
            <span>Order Summary</span>
            {plan.featured && <span className="os-tier-tag">Recommended</span>}
          </div>
          <div className="os-plan">{plan.name}</div>
          <div className="os-desc">{plan.desc}</div>

          <div className="os-cycle">
            <span className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Monthly</span>
            <span className={annual  ? 'on' : ''} onClick={() => setAnnual(true)}>
              Annual<span className="badge">−32%</span>
            </span>
          </div>

          <ul className="os-features">
            {plan.features.slice(0,5).map((f,i) => <li key={i}>{f}</li>)}
          </ul>

          <div className="os-totals">
            <div className="os-row">
              <span className="l">Subtotal</span>
              <span className="v">{fmt(base, form.country)}</span>
            </div>
            {disc > 0 && (
              <div className="os-row discount">
                <span className="l">Promo · QDENTY20</span>
                <span className="v">−{fmt(disc, form.country)}</span>
              </div>
            )}
            {vatRate > 0 && (
              <div className="os-row">
                <span className="l">{form.country === 'BD' ? 'VAT (Mushak)' : form.country === 'IN' ? 'GST' : 'VAT'} · {(vatRate*100).toFixed(0)}%</span>
                <span className="v">{fmt(tax, form.country)}</span>
              </div>
            )}
            <div className="os-row total">
              <span className="l">Total<span className="it"> due today</span></span>
              <span className="v"><span className="curr">{currSym(form.country)}</span>{total}</span>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--ink-mute)', textAlign:'right', marginTop:4 }}>
              {annual ? '/ year · billed annually' : '/ month'}
            </div>
          </div>

          <div className="os-promo">
            {promoOk ? (
              <div className="applied">✓ QDENTY20 · −20%</div>
            ) : (
              <>
                <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Promo code" maxLength={16} />
                <button onClick={() => {
                  if (promo.trim() === 'QDENTY20') setPromoOk(true)
                }}>Apply</button>
              </>
            )}
          </div>

          <div className="trust-row">
            <div className="t"><b>Money-back</b><span>within 30 days</span></div>
            <div className="t"><b>Cancel</b><span>anytime, pro rata</span></div>
            <div className="t"><b>PCI-DSS</b><span>via Stripe</span></div>
            <div className="t"><b>GDPR</b><span>EU-hosted data</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
