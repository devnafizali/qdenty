'use client'
import { useState, useTransition } from 'react'
import { useRouter }  from 'next/navigation'
import Link           from 'next/link'
import { acceptInvite } from '@/app/actions/account'

interface InviteData {
  invitedEmail: string
  role:         string
  ownerName:    string
  ownerEmail:   string
  expired:      boolean
  already:      boolean
}

interface Props {
  token:       string
  invite:      InviteData
  currentUser: { email: string; name: string } | null
  emailMatch:  boolean | null
}

const ROLE_LABELS: Record<string, string> = {
  owner:  'Owner',
  admin:  'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

export default function InviteClient({ token, invite, currentUser, emailMatch }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [done, setDone]  = useState(false)
  const [err,  setErr]   = useState<string | null>(null)

  const handleAccept = () => {
    start(async () => {
      const res = await acceptInvite(token)
      if (res.error) { setErr(res.error); return }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1800)
    })
  }

  return (
    <div className="invite-wrap">
      <div className="invite-card">
        <div className="invite-logo">
          <Link href="/">qdenty<sup>™</sup></Link>
        </div>

        {invite.expired ? (
          <>
            <div className="invite-state expired">Invite expired</div>
            <p className="invite-body">This invite link is no longer valid. Ask <b>{invite.ownerName}</b> to send a new one.</p>
            <Link href="/" className="invite-btn">Back to home</Link>
          </>
        ) : invite.already ? (
          <>
            <div className="invite-state accepted">Already accepted</div>
            <p className="invite-body">This invite has already been used.</p>
            <Link href="/dashboard" className="invite-btn">Go to dashboard</Link>
          </>
        ) : done ? (
          <>
            <div className="invite-state accepted">Welcome aboard!</div>
            <p className="invite-body">You've joined <b>{invite.ownerName}</b>'s workspace. Redirecting…</p>
          </>
        ) : (
          <>
            <div className="invite-heading">You've been invited</div>
            <p className="invite-body">
              <b>{invite.ownerName}</b> ({invite.ownerEmail}) has invited <b>{invite.invitedEmail}</b> to join their qdenty workspace as{' '}
              <span className="invite-role">{ROLE_LABELS[invite.role] ?? invite.role}</span>.
            </p>

            {!currentUser ? (
              <div className="invite-gate">
                <p className="invite-gate-p">Sign in or create an account with <b>{invite.invitedEmail}</b> to accept.</p>
                <div className="invite-gate-row">
                  <Link href={`/sign-in?next=/invite/${token}`} className="invite-btn">Sign in</Link>
                  <Link href={`/sign-up?email=${encodeURIComponent(invite.invitedEmail)}&next=/invite/${token}`} className="invite-btn-ghost">Create account</Link>
                </div>
              </div>
            ) : emailMatch === false ? (
              <div className="invite-gate">
                <p className="invite-gate-p">
                  You're signed in as <b>{currentUser.email}</b>, but this invite is for <b>{invite.invitedEmail}</b>.
                  Sign in with the correct account to accept.
                </p>
                <Link href={`/sign-in?next=/invite/${token}`} className="invite-btn">Switch account</Link>
              </div>
            ) : (
              <>
                {err && <p className="invite-err">{err}</p>}
                <button className="invite-btn" onClick={handleAccept} disabled={pending}>
                  {pending ? 'Accepting…' : 'Accept invite →'}
                </button>
                <p className="invite-decline">
                  Not interested? <Link href="/">Ignore this invite</Link>
                </p>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .invite-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          padding: 24px;
        }
        .invite-card {
          background: var(--surface);
          border: 1px solid var(--rule);
          max-width: 440px;
          width: 100%;
          padding: 40px 36px 36px;
        }
        .invite-logo {
          font-family: var(--serif);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 32px;
        }
        .invite-logo a { color: var(--ink); text-decoration: none; }
        .invite-logo sup { font-size: 9px; }
        .invite-heading {
          font-family: var(--serif);
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .invite-body {
          font-size: 14px;
          color: var(--ink-mute);
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .invite-role {
          display: inline-block;
          background: color-mix(in oklab, var(--accent) 10%, var(--paper));
          color: var(--accent);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 7px;
        }
        .invite-state {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          display: inline-block;
          margin-bottom: 20px;
        }
        .invite-state.expired  { background: #fef2f2; color: #dc2626; }
        .invite-state.accepted { background: color-mix(in oklab, var(--accent-2) 12%, var(--paper)); color: var(--accent-2); }
        .invite-btn {
          display: inline-block;
          background: var(--ink);
          color: var(--paper);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 12px 22px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .invite-btn:hover { opacity: 0.82; }
        .invite-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .invite-btn-ghost {
          display: inline-block;
          background: transparent;
          color: var(--ink);
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 11px 22px;
          border: 1px solid var(--rule);
          text-decoration: none;
          transition: border-color 0.15s;
        }
        .invite-btn-ghost:hover { border-color: var(--ink); }
        .invite-gate { margin-top: 4px; }
        .invite-gate-p {
          font-size: 13px;
          color: var(--ink-mute);
          margin-bottom: 18px;
          line-height: 1.55;
        }
        .invite-gate-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .invite-err {
          font-size: 13px;
          color: #dc2626;
          margin-bottom: 14px;
        }
        .invite-decline {
          margin-top: 16px;
          font-size: 12px;
          color: var(--ink-mute);
        }
        .invite-decline a { color: var(--ink-mute); }
        .invite-decline a:hover { color: var(--ink); }
      `}</style>
    </div>
  )
}
