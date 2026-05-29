'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { userInitials, planLabel, planRank } from '@/lib/utils'

interface Props {
  name:   string
  email:  string
  planId: string
}

export default function UserMenuClient({ name, email, planId }: Props) {
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)
  const router            = useRouter()
  const pathname          = usePathname()

  const initials  = userInitials(name, email)
  const firstName = name.split(' ')[0] || 'You'
  const plan      = planLabel(planId)
  const isPaid    = planRank(planId) >= 1
  const isActive  = pathname.startsWith('/account') || pathname.startsWith('/dashboard')

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div ref={ref} className="user-menu">
      <button
        className={'user-menu-trig' + (isActive || open ? ' on' : '')}
        onClick={() => setOpen(o => !o)}
      >
        <span className="avatar-pip">{initials}</span>
        <span className="u-meta">
          <span className="u-name">{firstName}</span>
          <span className="u-plan">{plan}</span>
        </span>
        <span className="chev">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="user-menu-pop">
          <div className="ump-head">
            <div className="avatar-pip lg">{initials}</div>
            <div>
              <div className="ump-name">{name}</div>
              <div className="ump-email">{email}</div>
              <div className="ump-plan-tag">{plan} plan</div>
            </div>
          </div>

          <div className="ump-list">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <span className="ump-i">▤</span> Dashboard
            </Link>
            <Link href="/account" onClick={() => setOpen(false)}>
              <span className="ump-i">●</span> Account &amp; Settings
            </Link>
            <Link href="/account/billing" onClick={() => setOpen(false)}>
              <span className="ump-i">$</span> Billing &amp; Invoices
            </Link>
            <Link href="/account/api-keys" onClick={() => setOpen(false)}>
              <span className="ump-i">&lt;/&gt;</span> API Keys
            </Link>
            {!isPaid && (
              <Link href="/pricing" onClick={() => setOpen(false)}>
                <span className="ump-i">⬆</span> Upgrade Plan
              </Link>
            )}
          </div>

          <div className="ump-sep" />
          <button className="ump-signout" onClick={handleSignOut}>
            → Sign out
          </button>
        </div>
      )}
    </div>
  )
}
