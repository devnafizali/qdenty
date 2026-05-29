'use client'
import { createAuthClient } from 'better-auth/react'

// Use the page's actual origin so the client works from any host
// (localhost in dev, the laptop IP on mobile, the production domain in prod).
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
