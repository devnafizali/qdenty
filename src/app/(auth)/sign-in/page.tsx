'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignInPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    })

    if (error) {
      setError(error.message ?? 'Invalid credentials. Try again.')
      setLoading(false)
      return
    }

    if (data) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          qdenty<sup>™</sup>
        </Link>

        <h1 className="auth-h1">
          Sign <span className="it">in.</span>
        </h1>
        <p className="auth-sub">Access your codes &amp; dashboard.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="btn-pri auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          New to qdenty?{' '}
          <Link href="/sign-up">Create a free account</Link>
        </div>
      </div>
    </div>
  )
}
