import type { Metadata } from 'next'
import { headers }    from 'next/headers'
import { auth }       from '@/lib/auth'
import Nav            from '@/components/nav'
import PublicNav      from '@/components/public-nav'
import Footer         from '@/components/footer'
import ToastProvider  from '@/components/toast'
import '../(marketing)/marketing.css'

export const metadata: Metadata = {
  title: 'qdenty',
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const user = session?.user as { name?: string; email?: string; planId?: string } | undefined

  return (
    <>
      {user ? (
        <Nav user={{ name: user.name ?? '', email: user.email ?? '', planId: user.planId ?? 'free' }} />
      ) : (
        <PublicNav />
      )}
      <main>{children}</main>
      <Footer />
      <ToastProvider />
    </>
  )
}
