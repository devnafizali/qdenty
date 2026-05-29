'use client'
import { useState } from 'react'

const CV = {
  name:     'Adelaide Marlow',
  title:    'Editorial Designer · Type',
  email:    'adelaide@studio.co',
  phone:    '+351 912 345 678',
  location: 'Lisbon, Portugal',
  summary:  'Editorial designer and typographer with 8 years building visual identities and print systems for cultural, hospitality, and publishing clients. Known for rigorous typographic thinking and work that reads as well at 6pt as it does at 96.',
  experience: [
    {
      role: 'Senior Editorial Designer', co: 'Independent Studio · Lisbon', years: '2023 — Now',
      bullets: ['Brand identities and type systems for cultural and hospitality clients.', 'QR-linked print collateral for 3 restaurant groups.'],
    },
    {
      role: 'Art Director', co: 'Monocle Magazine · London', years: '2019 — 2023',
      bullets: ["Led redesign of Monocle's travel supplements across 4 issues.", 'Directed a team of 6 across print and digital formats.'],
    },
  ],
  education: [{ degree: 'BA Graphic Design', school: 'Escola Superior de Artes e Design · 2018' }],
  skills:    ['Figma', 'InDesign', 'Type Design', 'Brand Identity', 'Editorial Layout'],
  languages: [{ name: 'English', level: 'Native · C2' }, { name: 'Portuguese', level: 'Fluent · C1' }],
  projects:  [
    { name: 'Atelier Lisboa identity', desc: 'Full identity system for boutique hotel, including QR-linked menus.' },
    { name: 'Monocle Typeface', desc: 'Custom typeface commissioned for Monocle travel supplements.' },
  ],
}

const CV_URL = 'qdenty.io/cv/adelaide'
const INITIALS = 'AM'

function PubCvContent() {
  return (
    <div className="pub-cv">
      <div className="pub-cv-cover">
        <div className="pub-cv-cover-tag">
          <span className="dot" />Updated · this week
        </div>
      </div>
      <div className="pub-cv-body">
        <div className="pub-cv-head">
          <div className="pub-cv-avatar">{INITIALS}</div>
          <div className="pub-cv-headh">
            <h1>{CV.name}</h1>
            <div className="pub-cv-title">{CV.title}</div>
            <div className="pub-cv-loc">{CV.location}</div>
          </div>
        </div>

        <div className="pub-cv-actions">
          <button className="pub-cv-pri"><span>↓</span> Download PDF</button>
          <button className="pub-cv-sec"><span>↗</span> Share</button>
        </div>

        <div className="pub-cv-sec">
          <div className="pub-cv-sec-h">About</div>
          <p className="pub-cv-p">{CV.summary}</p>
        </div>

        <div className="pub-cv-sec">
          <div className="pub-cv-sec-h">Experience</div>
          {CV.experience.map((j, i) => (
            <div key={i} className="pub-cv-exp">
              <div className="pcx-yr">{j.years}</div>
              <div>
                <div className="pcx-role">{j.role}</div>
                <div className="pcx-co">{j.co}</div>
                <ul className="pcx-bullets">
                  {j.bullets.map((b, k) => <li key={k}>{b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="pub-cv-sec">
          <div className="pub-cv-sec-h">Education</div>
          {CV.education.map((e, i) => (
            <div key={i} className="pub-cv-edu">
              <div className="pce-deg">{e.degree}</div>
              <div className="pce-sch">{e.school}</div>
            </div>
          ))}
        </div>

        <div className="pub-cv-sec">
          <div className="pub-cv-sec-h">Skills</div>
          <div className="pub-cv-skills">
            {CV.skills.map((s, i) => (
              <span key={i} className={'pcv-tag' + (i === 0 ? ' pri' : '')}>{s}</span>
            ))}
          </div>
        </div>

        <div className="pub-cv-contact">
          <div className="pub-cv-sec-h">Get in touch</div>
          <div className="pub-cv-c"><span>✉</span><span>{CV.email}</span></div>
          <div className="pub-cv-c"><span>☏</span><span>{CV.phone}</span></div>
        </div>

        <div className="pub-cv-foot">
          <div className="foot-mark">qdenty<span className="it">.</span></div>
          <div className="foot-sub">CV · always up to date · scan to revisit</div>
        </div>
      </div>
    </div>
  )
}

function EditorialCvDoc() {
  const parts     = CV.name.trim().split(/\s+/)
  const lastName  = parts.slice(-1)[0] ?? ''
  const firstNames = parts.slice(0, -1).join(' ')

  return (
    <div className="cv-doc cv-doc-editorial">
      <div className="cv-head">
        <div>
          <h3>{firstNames} <span className="it">{lastName}</span></h3>
          <div className="role">{CV.title}</div>
        </div>
        <div className="qr-mini-doc">
          <svg viewBox="0 0 52 52" width="52" height="52" style={{ display: 'block' }}>
            <rect width="52" height="52" fill="var(--paper-2)"/>
            <rect x="6" y="6" width="16" height="16" rx="2" fill="var(--ink)" opacity="0.25"/>
            <rect x="30" y="6" width="16" height="16" rx="2" fill="var(--ink)" opacity="0.25"/>
            <rect x="6" y="30" width="16" height="16" rx="2" fill="var(--ink)" opacity="0.25"/>
            <rect x="9" y="9" width="10" height="10" rx="1" fill="var(--ink)" opacity="0.5"/>
            <rect x="33" y="9" width="10" height="10" rx="1" fill="var(--ink)" opacity="0.5"/>
            <rect x="9" y="33" width="10" height="10" rx="1" fill="var(--ink)" opacity="0.5"/>
            <rect x="30" y="30" width="4" height="4" fill="var(--ink)" opacity="0.3"/>
            <rect x="36" y="30" width="4" height="4" fill="var(--ink)" opacity="0.3"/>
            <rect x="30" y="36" width="4" height="4" fill="var(--ink)" opacity="0.3"/>
            <rect x="36" y="36" width="10" height="4" fill="var(--ink)" opacity="0.3"/>
            <rect x="44" y="30" width="4" height="10" fill="var(--ink)" opacity="0.3"/>
          </svg>
        </div>
      </div>

      <div className="cv-body">
        <div>
          <div className="cv-sec">
            <h4>Contact</h4>
            <p className="cv-paragraph">{CV.email}</p>
            <p className="cv-paragraph">{CV.phone}</p>
            <p className="cv-paragraph">{CV.location}</p>
          </div>
          <div className="cv-sec">
            <h4>Skills</h4>
            <div>
              {CV.skills.map((s, i) => (
                <span key={i} className={'cv-tag' + (i === 0 ? ' pri' : '')}>{s}</span>
              ))}
            </div>
          </div>
          <div className="cv-sec">
            <h4>Education</h4>
            {CV.education.map((e, i) => (
              <div key={i} style={{ marginBottom: i < CV.education.length - 1 ? 8 : 0 }}>
                <p className="cv-paragraph" style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{e.degree}</p>
                <p className="cv-paragraph" style={{ fontStyle: 'italic' }}>{e.school}</p>
              </div>
            ))}
          </div>
          <div className="cv-sec">
            <h4>Languages</h4>
            {CV.languages.map((l, i) => (
              <div key={i} className="cv-lang">
                <span>{l.name}</span><span>{l.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {CV.summary && (
            <div className="cv-sec">
              <h4>Summary</h4>
              <p className="cv-paragraph">{CV.summary}</p>
            </div>
          )}
          <div className="cv-sec">
            <h4>Experience</h4>
            {CV.experience.map((j, i) => (
              <div className="cv-job" key={i}>
                <div className="j-h"><span>{j.role}</span><span className="yr">{j.years}</span></div>
                <div className="j-c">{j.co}</div>
                {j.bullets.filter(Boolean).map((b, k) => (
                  <div key={k} className="cv-bullet">{b}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="cv-sec" style={{ marginBottom: 0 }}>
            <h4>Selected Projects</h4>
            {CV.projects.map((p, i) => (
              <div key={i} className="cv-bullet">
                <b style={{ color: 'var(--ink)' }}>{p.name}</b> — {p.desc}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="cv-watermark">scan to view live · {CV_URL}</div>
    </div>
  )
}

export default function CvPreviewWidget() {
  const [device, setDevice] = useState<'phone' | 'web'>('web')

  const copyUrl = () => { navigator.clipboard?.writeText('https://' + CV_URL) }

  return (
    <div>
      <div className="prv-toolbar">
        <div className="prv-tools-l">
          <span className="prv-url"><span className="prv-lock">●</span> {CV_URL}</span>
        </div>
        <div className="prv-tools-r">
          <div className="prv-device-switch">
            <span className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')}>Phone</span>
            <span className={device === 'web' ? 'on' : ''} onClick={() => setDevice('web')}>Web</span>
          </div>
          <button className="btn-mini-ghost" onClick={copyUrl}>Copy URL</button>
          <a href="/cv-builder" className="btn-mini">Build yours →</a>
        </div>
      </div>

      <div className={`prv-stage ${device}`}>
        {device === 'phone' ? (
          <div className="phone-bezel">
            <div className="ph-side-btn ph-mute" />
            <div className="ph-side-btn ph-vol-up" />
            <div className="ph-side-btn ph-vol-dn" />
            <div className="ph-side-btn ph-power" />
            <div className="ph-screen">
              <div className="ph-statusbar">
                <span>09:41</span>
                <div className="ph-notch" />
                <div className="ph-status-r">
                  <span className="ph-bar" />
                  <span className="ph-batt"><span /></span>
                  <span>100%</span>
                </div>
              </div>
              <div className="ph-tabbar">
                <span className="ph-tab-l">←</span>
                <span className="ph-tab-url"><span className="ph-lock">●</span> {CV_URL}</span>
                <span className="ph-tab-r">⊕</span>
              </div>
              <div className="ph-content"><PubCvContent /></div>
              <div className="ph-home-indicator" />
            </div>
          </div>
        ) : (
          <div className="browser-bezel" style={{ maxWidth: 720 }}>
            <div className="brw-top">
              <div className="brw-dots"><span /><span /><span /></div>
              <div className="brw-url"><span className="brw-lock">●</span> {CV_URL}</div>
              <div className="brw-actions"><span>⤓</span><span>⋯</span></div>
            </div>
            <div className="brw-content" style={{ background: 'var(--paper)' }}>
              <EditorialCvDoc />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
