'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { CvData } from '@/db/schema'
import ScaledCvDoc from '@/components/cv-builder/scaled-cv-doc'
import { ExternalLink } from 'lucide-react'

const DEMO_CV: CvData = {
  name:     'Adelaide Marlow',
  title:    'Editorial Designer · Type',
  email:    'adelaide@studio.co',
  phone:    '+351 912 345 678',
  location: 'Lisbon, Portugal',
  summary:  'Editorial designer and typographer with 8 years building visual identities and print systems for cultural, hospitality, and publishing clients. Known for rigorous typographic thinking and work that reads as well at 6pt as it does at 96.',
  template: 'editorial',
  experience: [
    {
      role: 'Senior Editorial Designer',
      co: 'Independent Studio · Lisbon',
      years: '2023 — Now',
      bullets: [
        'Brand identities and type systems for cultural and hospitality clients.',
        'QR-linked print collateral for 3 restaurant groups.',
      ],
    },
    {
      role: 'Art Director',
      co: 'Monocle Magazine · London',
      years: '2019 — 2023',
      bullets: [
        "Led redesign of Monocle's travel supplements across 4 issues.",
        'Directed a team of 6 across print and digital formats.',
      ],
    },
  ],
  education: [
    { degree: 'BA Graphic Design', school: 'Escola Superior de Artes e Design · 2018' },
  ],
  skills: ['Figma', 'InDesign', 'Type Design', 'Brand Identity', 'Editorial Layout'],
  languages: [
    { name: 'English', level: 'Native · C2' },
    { name: 'Portuguese', level: 'Fluent · C1' },
  ],
  projects: [
    { name: 'Atelier Lisboa identity', desc: 'Full identity system for boutique hotel, including QR-linked menus.' },
    { name: 'Monocle Typeface', desc: 'Custom typeface commissioned for Monocle travel supplements.' },
  ],
}

const CV_FEATURES = [
  { ico: '✦', t: 'AI summary writer',       d: 'Distills your experience into 3–4 polished lines.',           tier: 'pro'  },
  { ico: '◈', t: 'ATS-friendly export',     d: 'PDF that parses cleanly in every applicant tracker.',          tier: 'free' },
  { ico: '↓', t: 'PDF · DOCX · Web',        d: 'Three formats, one source. Same QR points to all.',            tier: 'free' },
  { ico: '⌘', t: 'Multi-language',          d: 'Keep an EN and a PT version under one slug.',                  tier: 'free' },
  { ico: '⟳', t: 'Version history',         d: 'Roll back any edit. See what changed between drafts.',         tier: 'pro'  },
  { ico: '◉', t: 'Recruiter view tracking', d: 'Know who scanned, when, and what they opened.',                tier: 'pro'  },
]

type Template = 'editorial' | 'modern' | 'atelier'

export default function CvDemoSection() {
  const [template, setTemplate] = useState<Template>('editorial')

  const previewCv: CvData = { ...DEMO_CV, template }

  return (
    <div className="cv-frame">
      {/* ── Hero text (top on all screens) ── */}
      <div className="cv-hero">
        <h2>The <span className="it">résumé</span><br />that updates itself.</h2>
        <p>
          Build once. Edit anywhere. The QR on your printed CV always points to the latest version — no more &quot;this is an old draft, sorry.&quot;
        </p>
      </div>

      {/* ── Preview (second on mobile, right column on desktop) ── */}
      <div className="cv-preview-col">
        <ScaledCvDoc cv={previewCv} cvUrl="https://qdenty.io/cv/adelaide" />
      </div>

      {/* ── Controls: templates + CTAs ── */}
      <div className="cv-controls">
        <div className="cv-templates">
          <button
            className={`tmp${template === 'editorial' ? ' on' : ''}`}
            onClick={() => setTemplate('editorial')}
          >
            <div className="tmp-h">Adelaide <span className="it">Marlow</span></div>
            <div className="tmp-role">Editorial Designer</div>
            <div className="tmp-divider" />
            <div className="row2">
              <div className="blk" />
              <div className="col">
                <div className="ln full" /><div className="ln full" /><div className="ln s" />
              </div>
            </div>
            <div className="ln" style={{ width: '30%', background: 'var(--ink)', marginTop: 8 }} />
            <div className="ln full" /><div className="ln full" /><div className="ln s" />
            <div className="tmp-name"><b>Editorial</b> · default</div>
          </button>

          <button
            className={`tmp${template === 'modern' ? ' on' : ''}`}
            onClick={() => setTemplate('modern')}
          >
            <div className="tmp-h">Adelaide Marlow</div>
            <div className="tmp-role">— Editorial / Type</div>
            <div className="ln" style={{ background: 'var(--accent)', height: 4, width: '100%', marginTop: 4 }} />
            <div className="ln" style={{ width: '20%', background: 'var(--ink)', height: 6, marginTop: 8 }} />
            <div className="ln full" /><div className="ln full" /><div className="ln s" />
            <div className="ln" style={{ width: '25%', background: 'var(--ink)', height: 6, marginTop: 6 }} />
            <div className="ln full" /><div className="ln s" />
            <div className="tmp-name"><b>Modern</b> · free</div>
          </button>

          <button
            className={`tmp${template === 'atelier' ? ' on' : ''} locked`}
            onClick={() => setTemplate('atelier')}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>N°<span style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>01</span></div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>— Curriculum Vitæ</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>Adelaide <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic' }}>Marlow</span></div>
            <div className="ln full" /><div className="ln full" /><div className="ln s" />
            <div className="tmp-name"><b>Atelier</b> · premium folio</div>
          </button>
        </div>

        <div className="cv-ctas">
          <Link href="/cv-builder" className="btn-pri">Start CV Builder</Link>
          <Link href="/u/adelaide" className="btn-sec" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ExternalLink size={13} strokeWidth={2} /> Preview as visitor
          </Link>
          <span className="cv-ctas-note">3 templates · 2 free</span>
        </div>
      </div>

      {/* ── Features (always last on mobile) ── */}
      <div className="cv-included">
        <div className="cv-included-head">
          <div className="lbl">— What&apos;s included</div>
          <h5>Made for paper. <span className="it">Built</span> for phones.</h5>
          <p>Every CV you publish on qdenty is a hosted page <em>and</em> a printable document. Same QR, same URL, always current.</p>
        </div>
        <ul className="cv-included-list">
          {CV_FEATURES.map((f, i) => (
            <li key={i}>
              <span className="cvi-ico">{f.ico}</span>
              <div className="cvi-text">
                <span className="cvi-t">{f.t}</span>
                <span className="cvi-d">{f.d}</span>
              </div>
              <span className={`cvi-tier cvi-tier-${f.tier}`}>{f.tier === 'pro' ? 'Pro' : 'Free'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
