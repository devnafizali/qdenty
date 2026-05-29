'use client'
import { useState } from 'react'

const DEMO = {
  name:     'Adelaide Marlow',
  pronouns: 'she / her',
  title:    'Editorial Designer · Type',
  location: 'Lisbon, Portugal',
  email:    'adelaide@studio.co',
  phone:    '+351 912 345 678',
  bio:      'Editorial designer and typographer with 8 years building visual identities and print systems for cultural, hospitality, and publishing clients.',
  links:    ['linkedin.com/in/adelaide', 'behance.net/adelaideM'],
  slug:     'adelaide',
}

const URL_SLUG = 'qdenty.io/u/adelaide'
const INITIALS = 'AM'

function PubIdContent() {
  return (
    <div className="pub-id">
      <div className="pub-id-cover">
        <div className="pub-id-cover-mark">
          <svg viewBox="0 0 200 80" preserveAspectRatio="none">
            <path d="M0 60 Q40 30 80 50 T 160 40 T 200 60 L 200 80 L 0 80 Z" fill="rgba(243,239,231,0.12)" />
            <path d="M0 50 Q40 20 80 40 T 160 30 T 200 50" fill="none" stroke="rgba(243,239,231,0.2)" strokeWidth="1" />
          </svg>
        </div>
        <div className="pub-id-verified">✓ qdenty verified</div>
      </div>

      <div className="pub-id-body">
        <div className="pub-id-avatar">{INITIALS}</div>
        <h1 className="pub-id-name">{DEMO.name}</h1>
        <div className="pub-id-pronouns">{DEMO.pronouns}</div>
        <div className="pub-id-title">{DEMO.title.split('·')[0].trim()}</div>
        <div className="pub-id-location">📍 {DEMO.location}</div>
        <p className="pub-id-bio">{DEMO.bio}</p>

        <button className="pub-id-cta">+ Save to Contacts</button>

        <div className="pub-id-quick">
          <div className="pub-id-quick-i"><div className="qi-glyph">✉</div><div className="qi-l">Email</div></div>
          <div className="pub-id-quick-i"><div className="qi-glyph">☏</div><div className="qi-l">Call</div></div>
          <div className="pub-id-quick-i"><div className="qi-glyph">⌥</div><div className="qi-l">Chat</div></div>
          <div className="pub-id-quick-i"><div className="qi-glyph">↗</div><div className="qi-l">Share</div></div>
        </div>

        <div className="pub-id-sec">
          <div className="pub-id-sec-h">Contact</div>
          <div className="pub-id-row"><span className="lk">Email</span><span>{DEMO.email}</span></div>
          <div className="pub-id-row"><span className="lk">Phone</span><span>{DEMO.phone}</span></div>
          <div className="pub-id-row"><span className="lk">Where</span><span>{DEMO.location}</span></div>
        </div>

        <div className="pub-id-sec">
          <div className="pub-id-sec-h">Linked profiles</div>
          <div className="pub-id-links">
            {DEMO.links.map((l, i) => (
              <div key={i} className="pub-id-link">
                <span className="pl-glyph">{l[0].toUpperCase()}</span>
                <span>{l}</span>
                <span className="pl-arrow">→</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pub-id-sec">
          <div className="pub-id-sec-h">Résumé</div>
          <div className="pub-id-resume">
            <div>
              <div className="pl-h">Open full CV</div>
              <div className="pl-p">Editorial · updated this week</div>
            </div>
            <span className="pl-arrow">→</span>
          </div>
        </div>

        <div className="pub-id-foot">
          <div className="foot-mark">qdenty</div>
          <div className="foot-sub">Your scan-friendly identity · qdenty.io</div>
        </div>
      </div>
    </div>
  )
}

export default function IdPreviewWidget() {
  const [device, setDevice] = useState<'phone' | 'web'>('phone')

  const copyUrl = () => { navigator.clipboard?.writeText('https://' + URL_SLUG) }

  return (
    <div>
      <div className="prv-toolbar">
        <div className="prv-tools-l">
          <span className="prv-url"><span className="prv-lock">●</span> {URL_SLUG}</span>
        </div>
        <div className="prv-tools-r">
          <div className="prv-device-switch">
            <span className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')}>Phone</span>
            <span className={device === 'web' ? 'on' : ''} onClick={() => setDevice('web')}>Web</span>
          </div>
          <button className="btn-mini-ghost" onClick={copyUrl}>Copy URL</button>
          <a href={'/u/' + DEMO.slug} className="btn-mini">Preview live →</a>
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
                <span className="ph-tab-url"><span className="ph-lock">●</span> {URL_SLUG}</span>
                <span className="ph-tab-r">⊕</span>
              </div>
              <div className="ph-content"><PubIdContent /></div>
              <div className="ph-home-indicator" />
            </div>
          </div>
        ) : (
          <div className="browser-bezel">
            <div className="brw-top">
              <div className="brw-dots"><span /><span /><span /></div>
              <div className="brw-url"><span className="brw-lock">●</span> {URL_SLUG}</div>
              <div className="brw-actions"><span>⤓</span><span>⋯</span></div>
            </div>
            <div className="brw-content" style={{ background: 'var(--paper)' }}>
              <div style={{ maxWidth: 480, margin: '0 auto', minHeight: 600 }}>
                <PubIdContent />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
