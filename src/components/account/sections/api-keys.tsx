'use client'
import { useState, useTransition } from 'react'
import { createApiKey, revokeApiKey, createWebhook, deleteWebhook, toggleWebhook } from '@/app/actions/account'
import { showToast }  from '@/components/toast'
import { hasTier }    from '@/lib/utils'
import Link           from 'next/link'
import type { UserData, ApiKeyRow, WebhookRow } from '../account-layout'

export default function ApiKeysSection({
  user, apiKeys: initial, apiUsage, webhooks: initialWebhooks,
}: { user: UserData; apiKeys: ApiKeyRow[]; apiUsage: { used: number; limit: number }; webhooks: WebhookRow[] }) {
  const [keys,     setKeys]     = useState(initial)
  const [hooks,    setHooks]    = useState(initialWebhooks)
  const [hookUrl,  setHookUrl]  = useState('')
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [pending, start]    = useTransition()
  const canApi = hasTier(user.planId, 'elite')
  const pct    = Math.min(100, Math.round((apiUsage.used / Math.max(1, apiUsage.limit)) * 100))

  const handleCreate = () => {
    if (!canApi) { showToast('API access requires Professional plan'); return }
    const label = window.prompt('Label for new key (e.g. "Staging")')
    if (!label?.trim()) return
    start(async () => {
      const { rawToken } = await createApiKey(label.trim())
      setNewToken(rawToken)
      setKeys(prev => [{
        id: 'new', label: label.trim(),
        keyPrefix: rawToken.slice(0, 12),
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      }, ...prev])
      showToast('Key created — copy it now, it won\'t show again')
    })
  }

  const handleRevoke = (keyId: string, label: string) => {
    if (!confirm(`Revoke "${label}"? Apps using it will stop working immediately.`)) return
    start(async () => {
      await revokeApiKey(keyId)
      setKeys(prev => prev.filter(k => k.id !== keyId))
      showToast('Key revoked')
    })
  }

  const resetDate = new Date(Date.now() + 8 * 86400e3)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })

  const handleAddWebhook = () => {
    if (!canApi) { showToast('Webhooks require Professional plan'); return }
    if (!hookUrl.trim() || !hookUrl.startsWith('http')) { showToast('Enter a valid HTTPS URL'); return }
    start(async () => {
      const { rawSecret } = await createWebhook(hookUrl.trim())
      setHooks(prev => [...prev, {
        id: Date.now().toString(), url: hookUrl.trim(),
        active: true, createdAt: new Date().toISOString(),
      }])
      setNewSecret(rawSecret)
      setHookUrl('')
      showToast('Webhook added — save the secret now')
    })
  }

  const handleDeleteWebhook = (id: string, url: string) => {
    if (!confirm(`Remove webhook ${url}?`)) return
    start(async () => {
      await deleteWebhook(id)
      setHooks(prev => prev.filter(h => h.id !== id))
      showToast('Webhook removed')
    })
  }

  const handleToggleWebhook = (id: string, active: boolean) => {
    start(async () => {
      await toggleWebhook(id, active)
      setHooks(prev => prev.map(h => h.id === id ? { ...h, active } : h))
    })
  }

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">API <span className="it">keys.</span></h2>
        <p className="acct-sub-p">Programmatically generate, edit, and read scans.</p>
      </div>

      {!canApi && (
        <div className="acct-lock-card">
          <div>
            <div className="acct-lock-h">API access requires Professional</div>
            <p className="acct-lock-p">REST + Webhook endpoints, 5,000 calls/month on Pro · unlimited on Atelier.</p>
          </div>
          <Link href="/pricing" className="btn-pri">Upgrade to Pro</Link>
        </div>
      )}

      <div className="acct-card api-usage">
        <div className="api-usage-h">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>Monthly API usage</div>
            <div className="api-usage-v">
              <b>{apiUsage.used.toLocaleString()}</b> / {canApi ? apiUsage.limit.toLocaleString() : '0'} calls
            </div>
          </div>
          <div className="api-usage-pct">{pct}%</div>
        </div>
        <div className="api-bar">
          <div className="api-bar-fill" style={{ width: `${pct}%` }}/>
        </div>
        <div className="api-usage-foot">Resets {resetDate}</div>
      </div>

      {newToken && (
        <div className="acct-card" style={{ background: 'color-mix(in oklab, var(--accent-2) 8%, var(--paper))', borderColor: 'var(--accent-2)', marginBottom: 22 }}>
          <div className="acct-card-h">Copy your new key — shown only once</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 13, flex: 1, wordBreak: 'break-all' }}>{newToken}</code>
            <button className="btn-mini" onClick={() => { navigator.clipboard?.writeText(newToken); showToast('Copied') }}>Copy</button>
            <button className="btn-mini-ghost" onClick={() => setNewToken(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 className="acct-h3" style={{ margin: 0 }}>Your keys</h3>
        <button className="btn-mini" onClick={handleCreate} disabled={pending}>+ Create key</button>
      </div>

      <table className="acct-table">
        <thead><tr><th>Label</th><th>Token</th><th>Created</th><th>Last used</th><th></th></tr></thead>
        <tbody>
          {keys.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 28, color: 'var(--ink-mute)', fontStyle: 'italic' }}>No keys yet.</td></tr>
          )}
          {keys.map(k => (
            <tr key={k.id}>
              <td><b>{k.label}</b></td>
              <td><span className="acct-table-mono">{k.keyPrefix}••••</span></td>
              <td><span className="acct-table-mono">{new Date(k.createdAt).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric' })}</span></td>
              <td><span className="acct-table-mono">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('en-GB') : 'never'}</span></td>
              <td>
                <button className="acct-link" onClick={() => { navigator.clipboard?.writeText(k.keyPrefix + '••••'); showToast('Prefix copied (full token not stored)') }}>Copy</button>
                <span style={{ margin: '0 8px', color: 'var(--rule)' }}>·</span>
                <button className="acct-link danger" onClick={() => handleRevoke(k.id, k.label)} disabled={pending}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Webhooks ─────────────────────────────────────────── */}
      <h3 className="acct-h3" style={{ marginTop: 36 }}>Webhook endpoints</h3>
      <p className="acct-sub-p" style={{ marginBottom: 16 }}>
        Receive a signed POST every time one of your codes is scanned.
      </p>

      {newSecret && (
        <div className="acct-card" style={{ background: 'color-mix(in oklab, var(--accent-2) 8%, var(--paper))', borderColor: 'var(--accent-2)', marginBottom: 18 }}>
          <div className="acct-card-h">Signing secret — shown only once</div>
          <p className="acct-card-p" style={{ marginBottom: 10 }}>
            Verify the <code>X-Qdenty-Signature</code> header with this secret using HMAC-SHA256.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 12, flex: 1, wordBreak: 'break-all' }}>{newSecret}</code>
            <button className="btn-mini" onClick={() => { navigator.clipboard?.writeText(newSecret!); showToast('Copied') }}>Copy</button>
            <button className="btn-mini-ghost" onClick={() => setNewSecret(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="acct-card" style={{ marginBottom: 18 }}>
        <div className="acct-card-h">Add endpoint</div>
        <p className="acct-card-p">POST payload: <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{`{ event, codeId, scannedAt, country, deviceType }`}</code></p>
        <div className="slug-row" style={{ marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>POST</span>
          <input
            className="acct-input"
            placeholder="https://your-app.com/qdenty-webhook"
            value={hookUrl}
            onChange={e => setHookUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddWebhook()}
            disabled={pending || !canApi}
          />
          <button className="btn-mini-ghost" onClick={handleAddWebhook} disabled={pending || !canApi}>
            Add endpoint
          </button>
        </div>
      </div>

      {hooks.length > 0 && (
        <table className="acct-table">
          <thead><tr><th>URL</th><th>Status</th><th>Added</th><th></th></tr></thead>
          <tbody>
            {hooks.map(h => (
              <tr key={h.id}>
                <td><span className="acct-table-mono" style={{ fontSize: 11 }}>{h.url}</span></td>
                <td>
                  <span className={`acct-pill ${h.active ? 'on' : ''}`}>{h.active ? 'Active' : 'Paused'}</span>
                </td>
                <td><span className="acct-table-mono">{new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                <td>
                  <button className="acct-link" onClick={() => handleToggleWebhook(h.id, !h.active)} disabled={pending}>
                    {h.active ? 'Pause' : 'Resume'}
                  </button>
                  <span style={{ margin: '0 8px', color: 'var(--rule)' }}>·</span>
                  <button className="acct-link danger" onClick={() => handleDeleteWebhook(h.id, h.url)} disabled={pending}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
