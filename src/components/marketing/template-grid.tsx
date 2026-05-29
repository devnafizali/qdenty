'use client'

import { useState } from 'react'
import Link from 'next/link'

const ALL_TEMPLATES = [
  { n: '01', name: 'Personal Identity Cards',  it: 'Identity',  desc: 'Build a living digital ID page. Avatar, bio, socials, contact, downloadable vCard. Update once — the code stays the same.', tier: 'free',  cat: 'people',   feature: true, icon: 'identity' },
  { n: '02', name: 'Business Card',            it: 'Card',      desc: 'Replace paper. Logo, role, team, calendar link.',                          tier: 'free',  cat: 'people',   icon: 'card'     },
  { n: '03', name: 'Résumé / CV',              it: 'CV',        desc: 'Link to a hosted CV page, or PDF download.',                               tier: 'free',  cat: 'people',   icon: 'cv'       },
  { n: '04', name: 'Restaurant Menu',          it: 'Menu',      desc: 'Digital menu with allergens, photos & multi-language.',                    tier: 'pro',   cat: 'business', icon: 'menu'     },
  { n: '05', name: 'WiFi Access',              it: 'Access',    desc: 'Auto-connect for guests. SSID + password embedded.',                       tier: 'free',  cat: 'utility',  icon: 'wifi'     },
  { n: '06', name: 'Link Hub',                 it: 'Hub',       desc: 'One scan → all your socials, portfolio, music, shop.',                     tier: 'free',  cat: 'people',   icon: 'hub'      },
  { n: '07', name: 'Payment Code',             it: 'Code',      desc: 'UPI · PayPal · bank · crypto · regional wallets.',                         tier: 'pro',   cat: 'business', icon: 'pay'      },
  { n: '08', name: 'Pet ID Tag',               it: 'ID Tag',    desc: "Found pet? Scanner sees owner, meds, vet contact.",                        tier: 'free',  cat: 'objects',  icon: 'pet'      },
  { n: '09', name: 'Medical Alert',            it: 'Alert',     desc: 'Blood type, allergies, emergency contacts.',                               tier: 'pro',   cat: 'utility',  icon: 'med'      },
  { n: '10', name: 'Event Ticket',             it: 'Ticket',    desc: 'Validated entry pass with seat, time, calendar add.',                      tier: 'pro',   cat: 'business', icon: 'ticket'   },
  { n: '11', name: 'Property Listing',         it: 'Listing',   desc: 'House for sale. Floor plan, gallery, agent contact.',                      tier: 'pro',   cat: 'business', icon: 'home'     },
  { n: '12', name: 'Loyalty Punch',            it: 'Card',      desc: 'Earn stamps in the browser. No app to install.',                           tier: 'pro',   cat: 'business', icon: 'star'     },
  { n: '13', name: 'Calendar Invite',          it: 'Invite',    desc: '.ics download. Add to any calendar with one tap.',                         tier: 'free',  cat: 'utility',  icon: 'cal'      },
  { n: '14', name: 'App Download',             it: 'Link',      desc: 'Smart-detect iOS / Android. Send to right store.',                         tier: 'free',  cat: 'utility',  icon: 'app'      },
  { n: '15', name: 'Product Page',             it: 'Page',      desc: 'Packaging insert. Reviews, manual, warranty link.',                        tier: 'pro',   cat: 'objects',  icon: 'pkg'      },
  { n: '16', name: 'Gallery / Portfolio',      it: 'Portfolio', desc: 'Lightbox gallery for designers, photographers.',                           tier: 'pro',   cat: 'people',   icon: 'gallery'  },
  { n: '17', name: 'Audio Note',               it: 'Note',      desc: 'Voice message behind a card. Useful for gifts.',                           tier: 'pro',   cat: 'people',   icon: 'audio'    },
  { n: '18', name: 'Video Embed',              it: 'Embed',     desc: 'YouTube · Vimeo · self-hosted. Tutorial behind a sticker.',                tier: 'pro',   cat: 'utility',  icon: 'video'    },
  { n: '19', name: 'Donation',                 it: 'Code',      desc: 'One-tap donation page for non-profits & creators.',                        tier: 'free',  cat: 'business', icon: 'heart'    },
  { n: '20', name: 'Bulk / Batch Codes',       it: 'Batch',     desc: 'Generate 100s at once — invoices, parcels, seats.',                        tier: 'elite', cat: 'utility',  icon: 'bulk'     },
  { n: '21', name: 'Custom Action',            it: 'Action',    desc: 'API endpoint, app deep-link, IoT trigger. Build it.',                      tier: 'elite', cat: 'utility',  icon: 'custom'   },
  { n: '22', name: 'Multi-link / Geo',         it: 'Geo',       desc: 'Same code, different destinations by location.',                           tier: 'elite', cat: 'utility',  icon: 'geo'      },
]

const TIER_LABELS: Record<string, string> = { free: 'Free', pro: 'Starter+', elite: 'Atelier' }

const CATS  = [{ id: 'all', label: 'All categories' }, { id: 'people', label: 'People' }, { id: 'business', label: 'Business' }, { id: 'objects', label: 'Objects' }, { id: 'utility', label: 'Utility' }]
const TIERS = [{ id: 'all', label: 'All tiers' }, { id: 'free', label: 'Free' }, { id: 'pro', label: 'Starter+' }, { id: 'elite', label: 'Atelier' }]

function IcoIdentity() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="8.5" r="3.5" className="ico-fill"/><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 19.5c1.2-3.4 4.3-5 7.5-5s6.3 1.6 7.5 5"/><circle cx="16.5" cy="6" r="1.4" className="ico-accent"/></svg>
}
function IcoCard() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="6" width="18" height="13" rx="1.5" className="ico-fill"/><rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 10.5h18M7 14.5h5M14 14.5h3"/></svg>
}
function IcoCv() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M5 3h10l4 4v14H5z" className="ico-fill"/><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M8 12h8M8 15.5h8M8 19h5"/></svg>
}
function IcoMenu() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M5 7h14v12H5z" className="ico-fill"/><path d="M5 7h14v12H5z"/><circle cx="12" cy="13" r="3"/><path d="M3 9V7a2 2 0 0 1 2-2h2"/></svg>
}
function IcoWifi() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M2.5 9.5a15 15 0 0 1 19 0"/><path d="M5.5 13a10.5 10.5 0 0 1 13 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}
function IcoHub() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="4" y="4" width="16" height="16" rx="1" className="ico-fill"/><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9.5 4v16M14.5 4v16M4 9.5h16M4 14.5h16"/><rect x="9.5" y="9.5" width="5" height="5" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}
function IcoPay() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="2.5" y="5.5" width="19" height="13" rx="1" className="ico-fill"/><rect x="2.5" y="5.5" width="19" height="13" rx="1"/><path d="M2.5 9.5h19"/><rect x="5.5" y="13" width="5" height="2.5" className="ico-accent" fill="currentColor" stroke="none" rx="0.3"/></svg>
}
function IcoPet() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><ellipse cx="12" cy="13" rx="5" ry="4.5" className="ico-fill"/><ellipse cx="12" cy="13" rx="5" ry="4.5"/><ellipse cx="6.5" cy="8.5" rx="1.7" ry="2.3"/><ellipse cx="17.5" cy="8.5" rx="1.7" ry="2.3"/><circle cx="9.5" cy="6" r="1.5"/><circle cx="14.5" cy="6" r="1.5"/></svg>
}
function IcoMed() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="9" className="ico-fill"/><circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9" className="ico-accent-stroke"/></svg>
}
function IcoTicket() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M3 7v3a2 2 0 0 1 0 4v3h18v-3a2 2 0 0 1 0-4V7z" className="ico-fill"/><path d="M3 7v3a2 2 0 0 1 0 4v3h18v-3a2 2 0 0 1 0-4V7z"/><path d="M9 7v10" strokeDasharray="1.5 1.5"/></svg>
}
function IcoHome() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M4 11 12 4l8 7v9H4z" className="ico-fill"/><path d="M4 11 12 4l8 7v9H4z"/><path d="M2.5 12 12 3l9.5 9"/><rect x="10" y="14" width="4" height="6" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}
function IcoStar() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="m12 3 2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.7l-5.9 3.5L7.7 14.5 2.5 9.9l6.8-.6z" className="ico-fill"/><path d="m12 3 2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.7l-5.9 3.5L7.7 14.5 2.5 9.9l6.8-.6z"/></svg>
}
function IcoCal() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="5" width="18" height="16" rx="1.5" className="ico-fill"/><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 9.5h18M8 3v4M16 3v4"/><rect x="13" y="12.5" width="4" height="4" className="ico-accent" fill="currentColor" stroke="none" rx="0.4"/></svg>
}
function IcoApp() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="6" y="3" width="12" height="18" rx="2.5" className="ico-fill"/><rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M10 18.5h4"/><rect x="9" y="6.5" width="6" height="8" className="ico-accent" fill="currentColor" stroke="none" rx="0.4"/></svg>
}
function IcoPkg() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="m12 3 9 5v8l-9 5-9-5V8z" className="ico-fill"/><path d="m12 3 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v10"/></svg>
}
function IcoGallery() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="5" width="18" height="14" rx="1" className="ico-fill"/><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 17 5-5 4 4 3-3 6 6"/><circle cx="8" cy="9.5" r="1.6" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}
function IcoAudio() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M4 9h3l5-4v14l-5-4H4z" className="ico-fill"/><path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6" className="ico-accent-stroke"/></svg>
}
function IcoVideo() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="2.5" y="6" width="14" height="12" rx="1" className="ico-fill"/><rect x="2.5" y="6" width="14" height="12" rx="1"/><path d="m17 10.5 4-2.5v8L17 13.5z"/></svg>
}
function IcoHeart() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><path d="M12 20s-7.5-4.5-7.5-10.5A4 4 0 0 1 12 7.5 4 4 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20z" className="ico-fill"/><path d="M12 20s-7.5-4.5-7.5-10.5A4 4 0 0 1 12 7.5 4 4 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20z"/></svg>
}
function IcoBulk() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><rect x="4" y="4" width="7" height="7" className="ico-fill"/><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}
function IcoCustom() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="3.5" className="ico-fill"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8"/></svg>
}
function IcoGeo() {
  return <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="9" className="ico-fill"/><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/><circle cx="16" cy="9" r="1.3" className="ico-accent" fill="currentColor" stroke="none"/></svg>
}

const ICO: Record<string, React.ReactNode> = {
  identity: <IcoIdentity />, card: <IcoCard />, cv: <IcoCv />, menu: <IcoMenu />,
  wifi: <IcoWifi />, hub: <IcoHub />, pay: <IcoPay />, pet: <IcoPet />,
  med: <IcoMed />, ticket: <IcoTicket />, home: <IcoHome />, star: <IcoStar />,
  cal: <IcoCal />, app: <IcoApp />, pkg: <IcoPkg />, gallery: <IcoGallery />,
  audio: <IcoAudio />, video: <IcoVideo />, heart: <IcoHeart />, bulk: <IcoBulk />,
  custom: <IcoCustom />, geo: <IcoGeo />,
}

export default function TemplateGrid() {
  const [cat, setCat]   = useState('all')
  const [tier, setTier] = useState('all')

  const visible = ALL_TEMPLATES.filter(t =>
    (cat  === 'all' || t.cat  === cat) &&
    (tier === 'all' || t.tier === tier)
  )

  return (
    <>
      <div className="tpl-filter">
        {CATS.map(c => (
          <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>
        ))}
        <span className="sep" />
        {TIERS.map(c => (
          <button key={c.id} className={tier === c.id ? 'on' : ''} onClick={() => setTier(c.id)}>{c.label}</button>
        ))}
      </div>

      <div className="uc-grid">
        {visible.map(t => (
          <Link
            key={t.n}
            href={`/builder?type=${t.it}`}
            className={'uc-tile' + (t.feature ? ' feature' : '')}
          >
            <div>
              <div className="num">{t.n}{t.feature ? ' · Flagship' : ''}</div>
              <div className="ico">{ICO[t.icon]}</div>
              <h3>
                {t.name.split(' ').slice(0, -1).join(' ') || t.name}{' '}
                <span className="it">{t.name.split(' ').slice(-1)[0]}</span>
              </h3>
              <p>{t.desc}</p>
              {t.feature && <span className="go" style={{ color: 'var(--accent)' }}>Build one</span>}
            </div>
            <div className={'tier ' + t.tier}>{TIER_LABELS[t.tier]}</div>
          </Link>
        ))}
      </div>

      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 24, textAlign: 'right' }}>
        {visible.length} of {ALL_TEMPLATES.length} templates shown
      </p>
    </>
  )
}
