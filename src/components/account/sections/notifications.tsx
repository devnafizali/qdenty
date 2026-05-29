'use client'
import { useState, useTransition } from 'react'
import { updateNotifications } from '@/app/actions/account'
import { showToast }           from '@/components/toast'
import type { NotifData }      from '../account-layout'

const ITEMS = [
  { id: 'scanAlerts'    as const, label: 'Scan alerts',     desc: 'Realtime ping when one of your codes is scanned.' },
  { id: 'weeklyDigest'  as const, label: 'Weekly digest',   desc: 'Monday summary of scans, geographies, and top performers.' },
  { id: 'productNews'   as const, label: 'Product news',    desc: 'New templates, features, and the occasional studio interview.' },
  { id: 'securityAlerts' as const, label: 'Security alerts', desc: 'New sign-ins, password changes. Cannot disable.' },
]

function Toggle({ on, disabled, onToggle }: { on: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      className={'toggle' + (on ? ' on' : '') + (disabled ? ' disabled' : '')}
      onClick={() => !disabled && onToggle()}
      aria-pressed={on}
      type="button"
    >
      <span className="toggle-knob"/>
    </button>
  )
}

export default function NotificationsSection({ prefs }: { prefs: NotifData }) {
  const [state,  setState]  = useState(prefs)
  const [pending, start]    = useTransition()

  const toggle = (key: keyof NotifData) => {
    if (key === 'securityAlerts') return
    const next = { ...state, [key]: !state[key] }
    setState(next)
    start(async () => {
      await updateNotifications({ scanAlerts: next.scanAlerts, weeklyDigest: next.weeklyDigest, productNews: next.productNews })
      showToast('Preferences saved')
    })
  }

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">What we <span className="it">email</span> you.</h2>
        <p className="acct-sub-p">Granular controls. We only email when it matters.</p>
      </div>

      <div className="notif-list">
        {ITEMS.map(it => (
          <div key={it.id} className="notif-row">
            <div>
              <div className="notif-h">{it.label}</div>
              <p className="notif-p">{it.desc}</p>
            </div>
            <Toggle
              on={state[it.id]}
              disabled={it.id === 'securityAlerts' || pending}
              onToggle={() => toggle(it.id)}
            />
          </div>
        ))}
      </div>
    </>
  )
}
