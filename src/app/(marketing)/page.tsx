import { redirect } from 'next/navigation'
import { headers }  from 'next/headers'
import { auth }     from '@/lib/auth'
import HeroCard from '@/components/marketing/hero-card'
import Link from 'next/link'

export const metadata = { title: 'qdenty — One code, infinite identities.' }

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')
  return (
    <>
      {/* Hero */}
      <section className="screen" id="hero" style={{ paddingTop: 0 }}>
        <div className="hero">
          <div className="hero-left">
            <div className="eyebrow">A platform for everything scannable</div>
            <h1>
              One code,<br />
              <span className="it">infinite</span> identities.
              <span className="small">— for people, businesses &amp; objects</span>
            </h1>
            <p className="lede">
              qdenty turns any moment into a scannable artefact. Your résumé, your business card, your menu, your Wi‑Fi, your pet's collar — generate purposeful QR codes for the things that matter, and update them whenever life moves.
            </p>
            <div className="cta-row">
              <Link href="/builder" className="btn-pri">Generate For Free</Link>
              <Link href="/pricing" className="btn-sec">View Tiers</Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="num">22+</div>
                <div className="label">Code Templates</div>
              </div>
              <div className="stat">
                <div className="num">∞</div>
                <div className="label">Static Codes · Free Tier</div>
              </div>
              <div className="stat">
                <div className="num">42</div>
                <div className="label">Languages Supported</div>
              </div>
            </div>
          </div>
          <HeroCard />
        </div>
      </section>

      {/* Manifesto */}
      <section className="manifesto">
        <div className="manifesto-inner">
          <div>
            <div className="manifesto-label">— Why we built this</div>
          </div>
          <div>
            <blockquote>
              "Every business card we've ever printed is already out of date. Every résumé we've ever emailed is already a draft. qdenty is a small protest against printed information that can't be changed."
            </blockquote>
            <cite>— Founders' note · Lisbon, 2026</cite>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="how-inner">
          <h2>
            From idea to scan in <span className="it">under a minute.</span>
          </h2>
          <div className="how-steps">
            {[
              { n: '01', t: 'Pick a template', d: 'Choose from 22 use-cases — from vCards and menus to pet tags and IoT triggers. Each template knows what data to ask for.' },
              { n: '02', t: 'Fill the details', d: 'A three-pane builder updates the code as you type. Change colours, add a logo, set validity windows.' },
              { n: '03', t: 'Download or host', d: 'Static codes for free, no account needed. Sign in for dynamic codes you can edit without reprinting.' },
            ].map(s => (
              <div key={s.n} className="how-step">
                <div className="n">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="trust-strip">
        <div className="trust-inner">
          {[
            { v: '128-bit', l: 'AES at rest' },
            { v: 'GDPR',    l: 'Compliant by default' },
            { v: 'Zero',    l: 'Scan trackers without consent' },
            { v: 'EU',      l: 'Hosted · Lisbon DC' },
          ].map(s => (
            <div key={s.v} className="trust-stat">
              <div className="val">{s.v}</div>
              <div className="lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
