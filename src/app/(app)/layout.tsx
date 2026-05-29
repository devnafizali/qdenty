import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Nav           from '@/components/nav'
import PublicNav     from '@/components/public-nav'
import ToastProvider from '@/components/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''
  const session = await auth.api.getSession({ headers: h })

  // Builder is publicly accessible — guests get PublicNav, no redirect
  if (!session && pathname.startsWith('/builder')) {
    return (
      <>
        <PublicNav />
        <main>{children}</main>
        <ToastProvider />
      </>
    )
  }

  if (!session) redirect('/sign-in')

  return (
    <>
      <Nav user={{
        name:   session.user.name,
        email:  session.user.email,
        planId: (session.user as { planId?: string }).planId ?? 'free',
      }} />
      <main>{children}</main>
      <ToastProvider />
    </>
  )
}
