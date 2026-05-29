'use client'
import { useState, useEffect, useCallback } from 'react'

interface Toast { id: number; msg: string }

let _id = 0

// Call from any client-side code: showToast('Code deleted')
export function showToast(msg: string) {
  document.dispatchEvent(new CustomEvent('qd:toast', { detail: msg }))
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((msg: string) => {
    const id = ++_id
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => add((e as CustomEvent<string>).detail)
    document.addEventListener('qd:toast', handler)
    return () => document.removeEventListener('qd:toast', handler)
  }, [add])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  )
}
