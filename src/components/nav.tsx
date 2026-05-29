import Link from 'next/link'
import UserMenuClient from './user-menu-client'
import MobileNavMenu from './mobile-nav-menu'
import MobUserSection from './mob-user-section'

interface NavProps {
  user: {
    name:   string
    email:  string
    planId: string
  }
}

const APP_LINKS = [
  { href: '/dashboard',  label: 'Dashboard'  },
  { href: '/builder',    label: 'Generator'  },
  { href: '/identity',   label: 'Identity'   },
  { href: '/cv-builder', label: 'CV Studio'  },
  { href: '/analytics',  label: 'Analytics'  },
]

export default function Nav({ user }: NavProps) {
  return (
    <nav className="primary">
      <Link href="/dashboard" className="logo">
        qdenty<sup>™</sup>
      </Link>

      <ul>
        {APP_LINKS.map(l => (
          <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
        ))}
      </ul>

      <div className="nav-right">
        <UserMenuClient name={user.name} email={user.email} planId={user.planId} />
        <Link href="/builder" className="cta">New Code</Link>
      </div>

      <MobileNavMenu
        links={APP_LINKS}
        topSlot={
          <MobUserSection name={user.name} email={user.email} planId={user.planId} />
        }
      >
        <Link href="/builder" className="cta mob-cta">New Code →</Link>
      </MobileNavMenu>
    </nav>
  )
}
