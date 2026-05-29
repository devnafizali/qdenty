'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignUpPage() {
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: '/dashboard',
    })

    if (error) {
      setError(error.message ?? 'Something went wrong. Try again.')
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
          Create an <span className="it">account.</span>
        </h1>
        <p className="auth-sub">Free. No card required.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adelaide Marlow"
              required
              autoFocus
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            <div className="field-hint">Min 8 characters</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="btn-pri auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
