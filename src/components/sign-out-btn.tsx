'use client'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignOutBtn() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <button className="nav-signout" onClick={handleSignOut}>
      Sign out
    </button>
  )
}
