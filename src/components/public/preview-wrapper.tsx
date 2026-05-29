'use client'
import { useState } from 'react'

interface Props {
  kind:     string
  url:      string
  editPath: string
  children: React.ReactNode
}

export default function PreviewWrapper({ kind, url, editPath, children }: Props) {
  const [device, setDevice] = useState<'phone' | 'web'>('phone')
  const displayUrl = url.replace('https://', '')

  const copyUrl = () => {
    navigator.clipboard?.writeText(url)
  }

  return (
    <>
      {/* Toolbar */}
      <div className="prv-toolbar">
        <div className="prv-tools-l">
          <span className="prv-url"><span className="prv-lock">●</span> {displayUrl}</span>
        </div>
        <div className="prv-tools-r">
          <div className="prv-device-switch">
            <span className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')}>Phone</span>
            <span className={device === 'web' ? 'on' : ''} onClick={() => setDevice('web')}>Web</span>
          </div>
          <button className="btn-mini-ghost" onClick={copyUrl}>Copy URL</button>
          <a href={editPath} className="btn-mini">Edit {kind} →</a>
        </div>
      </div>

      {/* Stage */}
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
                <span className="ph-tab-url"><span className="ph-lock">●</span> {displayUrl}</span>
                <span className="ph-tab-r">⊕</span>
              </div>
              <div className="ph-content">{children}</div>
              <div className="ph-home-indicator" />
            </div>
          </div>
        ) : (
          <div className="browser-bezel">
            <div className="brw-top">
              <div className="brw-dots"><span /><span /><span /></div>
              <div className="brw-url"><span className="brw-lock">●</span> {displayUrl}</div>
              <div className="brw-actions"><span>⤓</span><span>⋯</span></div>
            </div>
            <div className="brw-content" style={{ background: 'var(--paper)' }}>
              <div style={{ maxWidth: 480, margin: '0 auto', minHeight: 600 }}>
                {children}
              </div>
            </div>
          </div>
        )}
      </div>

</>
  )
}
