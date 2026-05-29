import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { userInitials } from '@/lib/utils'
import MobileNavMenu from './mobile-nav-menu'

const NAV_ITEMS = [
  { href: '/',          label: 'Index'      },
  { href: '/templates', label: 'Templates'  },
  { href: '/builder',   label: 'Generator'  },
  { href: '/identity',  label: 'Identity'   },
  { href: '/cv',        label: 'CV Studio'  },
  { href: '/pricing',   label: 'Tiers'      },
]

export default async function PublicNav({ active }: { active?: string }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const user = session?.user as { name?: string; email?: string } | undefined

  return (
    <nav className="primary pub-nav">
      <Link href="/" className="logo">
        qdenty<sup>™</sup>
      </Link>

      <ul>
        {NAV_ITEMS.map(it => (
          <li key={it.href}>
            <Link
              href={it.href}
              className={active === it.href ? 'active' : ''}
            >{it.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        {user ? (
          <>
            <Link href="/dashboard" className="nav-avatar" title={user.email ?? ''}>
              {userInitials(user.name ?? '', user.email ?? '')}
            </Link>
            <Link href="/builder" className="cta">New Code</Link>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="sign-in">Sign In</Link>
            <Link href="/sign-up" className="cta">Start Free</Link>
          </>
        )}
      </div>

      <MobileNavMenu links={NAV_ITEMS}>
        {user ? (
          <div className="mob-sb-user">
            <div className="mob-sb-avatar">{userInitials(user.name ?? '', user.email ?? '')}</div>
            <div className="mob-sb-uinfo">
              <div className="mob-sb-uname">{user.name}</div>
              <div className="mob-sb-uemail">{user.email}</div>
            </div>
          </div>
        ) : (
          <div className="mob-sb-auth">
            <Link href="/sign-in" className="mob-sb-signin">Sign In</Link>
            <Link href="/sign-up" className="mob-sb-signup">Start Free →</Link>
          </div>
        )}
      </MobileNavMenu>
    </nav>
  )
}
