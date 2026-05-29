import { headers } from 'next/headers'
import { auth }    from '@/lib/auth'
import Nav          from '@/components/nav'
import PublicNav    from '@/components/public-nav'
import Footer       from '@/components/footer'
import ToastProvider from '@/components/toast'
import '../../(marketing)/marketing.css'

export default async function IdentityLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    const user = session.user as { name: string; email: string; planId?: string }
    return (
      <>
        <Nav user={{
          name:   user.name,
          email:  user.email,
          planId: user.planId ?? 'free',
        }} />
        <main>{children}</main>
        <ToastProvider />
      </>
    )
  }

  return (
    <>
      <div className="util-bar">
        <span>EST. 2026</span>
        <div className="marquee">
          <div className="marquee-inner">
            {['Generate Without Login', 'Dynamic Identity Codes', 'Privacy-First Architecture', 'Currently in Beta', 'New · CV Studio v2', 'API Now Public',
              'Generate Without Login', 'Dynamic Identity Codes', 'Privacy-First Architecture', 'Currently in Beta', 'New · CV Studio v2', 'API Now Public']
              .map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </div>
        <span>EN · USD</span>
      </div>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
