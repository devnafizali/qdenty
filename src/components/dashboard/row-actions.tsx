'use client'
import { useRef, useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCode, duplicateCode, setCodeStatus } from '@/app/actions/codes'
import { showToast } from '@/components/toast'

interface RowActionsProps {
  code: {
    id:      string
    label:   string
    type:    string
    payload: string
    status:  string
  }
}

export default function RowActions({ code }: RowActionsProps) {
  const [open, setOpen]       = useState(false)
  const [pending, startTrans] = useTransition()
  const ref                   = useRef<HTMLDivElement>(null)
  const router                = useRouter()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const close = () => setOpen(false)

  const handleDelete = () => {
    close()
    if (!confirm(`Delete "${code.label}" permanently? This cannot be undone.`)) return
    startTrans(async () => {
      await deleteCode(code.id)
      showToast(`"${code.label}" deleted`)
    })
  }

  const handleDuplicate = () => {
    close()
    startTrans(async () => {
      await duplicateCode(code.id)
      showToast('Code duplicated as draft')
    })
  }

  const handleCopyPayload = () => {
    close()
    navigator.clipboard?.writeText(code.payload)
    showToast('Payload copied to clipboard')
  }

  const handleSetLive = () => {
    close()
    const next = code.status === 'live' ? 'draft' : 'live'
    startTrans(async () => {
      await setCodeStatus(code.id, next)
      showToast(next === 'live' ? 'Code set to Live' : 'Code set to Draft')
    })
  }

  const handleOpenPublic = () => {
    close()
    if (code.payload.startsWith('http')) {
      window.open(code.payload, '_blank', 'noopener')
    } else {
      showToast('Non-URL payload — copy it to use')
    }
  }

  return (
    <div ref={ref} className={`row-actions${open ? ' open' : ''}`}>
      <button
        className="row-actions-btn"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        disabled={pending}
        title="Actions"
        aria-label="Code actions"
      >
        {pending ? '…' : '⋯'}
      </button>

      {open && (
        <div className="row-actions-menu" onClick={e => e.stopPropagation()}>
          <button onClick={() => { close(); router.push(`/builder?edit=${code.id}`) }}>
            <span className="ra-i">✎</span> Edit code
          </button>
          <button onClick={handleOpenPublic}>
            <span className="ra-i">↗</span> Open public page
          </button>
          <button onClick={() => { close(); router.push(`/analytics?code=${code.id}`) }}>
            <span className="ra-i">▤</span> View analytics
          </button>

          <div className="row-actions-sep" />

          <button onClick={handleDuplicate}>
            <span className="ra-i">⎘</span> Duplicate
          </button>
          <button onClick={handleCopyPayload}>
            <span className="ra-i">⌥</span> Copy payload
          </button>
          <button onClick={handleSetLive}>
            <span className="ra-i">{code.status === 'live' ? '◌' : '●'}</span>
            {code.status === 'live' ? 'Set to Draft' : 'Set to Live'}
          </button>

          <div className="row-actions-sep" />

          <button className="danger" onClick={handleDelete}>
            <span className="ra-i">✕</span> Delete
          </button>
        </div>
      )}
    </div>
  )
}
