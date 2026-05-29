import { redirect }  from 'next/navigation'
import { headers }   from 'next/headers'
import { auth }      from '@/lib/auth'
import PublicNav     from '@/components/public-nav'
import Footer        from '@/components/footer'
import '../(marketing)/marketing.css'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  )
}
