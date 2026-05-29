'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { userInitials, planLabel, planRank } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface Props {
  name:    string
  email:   string
  planId:  string
  onNav?:  () => void  // called when any sub-link is clicked (to close sidebar)
}

const ACCOUNT_LINKS = [
  { href: '/dashboard',        label: 'Dashboard'           },
  { href: '/account/profile',  label: 'Account & Settings'  },
  { href: '/account/billing',  label: 'Plan & Billing'      },
  { href: '/account/api',      label: 'API Keys'             },
]

export default function MobUserSection({ name, email, planId, onNav }: Props) {
  const [open, setOpen]   = useState(false)
  const router            = useRouter()
  const initials          = userInitials(name, email)
  const plan              = planLabel(planId)
  const isPaid            = planRank(planId) >= 1

  const close = () => { setOpen(false); onNav?.() }

  const handleSignOut = async () => {
    close()
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <div className="mob-acct">
      {/* Trigger row */}
      <button
        className={'mob-acct-trig' + (open ? ' open' : '')}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="mob-acct-avatar">{initials}</div>
        <div className="mob-acct-meta">
          <span className="mob-acct-name">{name.split(' ')[0]}</span>
          <span className="mob-acct-plan">{plan} plan</span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={'mob-acct-chev' + (open ? ' open' : '')}
        />
      </button>

      {/* Expandable sub-links */}
      {open && (
        <div className="mob-acct-drop">
          {ACCOUNT_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="mob-acct-link" onClick={close}>
              {l.label}
            </Link>
          ))}
          {!isPaid && (
            <Link href="/pricing" className="mob-acct-link upgrade" onClick={close}>
              ↑ Upgrade plan
            </Link>
          )}
          <button className="mob-acct-signout" onClick={handleSignOut}>
            Sign out →
          </button>
        </div>
      )}
    </div>
  )
}
