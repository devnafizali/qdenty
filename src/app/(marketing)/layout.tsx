import './marketing.css'
import { headers }  from 'next/headers'
import { auth }     from '@/lib/auth'
import PublicNav    from '@/components/public-nav'
import Nav          from '@/components/nav'
import Footer       from '@/components/footer'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const user = session?.user as { name: string; email: string; planId?: string } | undefined

  return (
    <>
      {user ? (
        <Nav user={{ name: user.name, email: user.email, planId: user.planId ?? 'free' }} />
      ) : (
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
        </>
      )}
      <main>{children}</main>
      <Footer />
    </>
  )
}
