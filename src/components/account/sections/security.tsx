'use client'
import { useState, useTransition } from 'react'
import { changePassword, revokeSession } from '@/app/actions/account'
import { showToast } from '@/components/toast'
import type { SessionRow } from '../account-layout'

function parseUA(ua: string | null): string {
  if (!ua) return 'Unknown device'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iPhone / iPad'
  if (ua.includes('Android'))   return 'Android'
  if (ua.includes('Mac'))       return 'Mac'
  if (ua.includes('Windows'))   return 'Windows PC'
  if (ua.includes('Linux'))     return 'Linux'
  return ua.slice(0, 40)
}

export default function SecuritySection({ sessions }: { sessions: SessionRow[] }) {
  const [oldPw,  setOldPw]  = useState('')
  const [newPw,  setNewPw]  = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [err,    setErr]    = useState('')
  const [ok,     setOk]     = useState(false)
  const [pending, start]    = useTransition()

  const handlePw = (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setOk(false)
    if (!oldPw) { setErr('Enter your current password.'); return }
    if (newPw.length < 8) { setErr('New password must be at least 8 characters.'); return }
    if (newPw !== newPw2) { setErr('Passwords do not match.'); return }
    start(async () => {
      const res = await changePassword(oldPw, newPw)
      if (res.error) { setErr(res.error); return }
      setOldPw(''); setNewPw(''); setNewPw2('')
      setOk(true)
      showToast('Password updated')
    })
  }

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">Keep things <span className="it">tight.</span></h2>
        <p className="acct-sub-p">Password and active sessions.</p>
      </div>

      <h3 className="acct-h3">Change password</h3>
      <form onSubmit={handlePw} className="form-stack">
        <div className="field">
          <label>Current password</label>
          <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="••••••••"/>
        </div>
        <div className="field-row">
          <div className="field">
            <label>New password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 8 characters"/>
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)}/>
          </div>
        </div>
        {err && <p className="acct-error">{err}</p>}
        {ok  && <p className="acct-success">Password updated successfully.</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-pri" type="submit" disabled={pending} style={{ padding: '12px 22px' }}>
            {pending ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>

      <h3 className="acct-h3" style={{ marginTop: 40 }}>Active sessions</h3>
      <table className="acct-table">
        <thead>
          <tr><th>Device</th><th>IP Address</th><th>Started</th><th></th></tr>
        </thead>
        <tbody>
          {sessions.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-mute)', fontStyle: 'italic' }}>
              No sessions found.
            </td></tr>
          )}
          {sessions.map((s, i) => (
            <tr key={s.id}>
              <td>
                <b>{parseUA(s.userAgent)}</b>
                {i === 0 && <><br/><span className="acct-table-mono">This session</span></>}
              </td>
              <td><span className="acct-table-mono">{s.ipAddress ?? '—'}</span></td>
              <td><span className="acct-table-mono">{new Date(s.createdAt).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })}</span></td>
              <td>
                {i === 0
                  ? <span className="acct-pill on">current</span>
                  : <button className="acct-link" onClick={() => start(async () => {
                      await revokeSession(s.id)
                      showToast('Session revoked')
                    })}>Sign out</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
