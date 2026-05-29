'use client'
import { useState, useTransition } from 'react'
import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '@/app/actions/account'
import { showToast } from '@/components/toast'
import { hasTier, userInitials } from '@/lib/utils'
import Link from 'next/link'
import type { UserData, TeamMemberRow } from '../account-layout'

const ROLES = ['Admin', 'Editor', 'Viewer'] as const

export default function TeamSection({
  user, teamMembers: initial,
}: { user: UserData; teamMembers: TeamMemberRow[] }) {
  const [members, setMembers] = useState(initial)
  const [pending, start] = useTransition()
  const canTeam = hasTier(user.planId, 'elite')

  const handleInvite = () => {
    if (!canTeam) { showToast('Teams require Professional plan'); return }
    const email = window.prompt('Email address to invite')
    if (!email?.includes('@')) { showToast('Enter a valid email'); return }
    const role  = window.prompt('Role: Admin, Editor, or Viewer', 'Editor') ?? 'Editor'
    start(async () => {
      await inviteTeamMember(email, role.toLowerCase())
      setMembers(prev => [...prev, {
        id: Date.now().toString(), invitedEmail: email,
        role: role.toLowerCase(), acceptedAt: null,
        createdAt: new Date().toISOString(),
      }])
      showToast(`Invite sent to ${email}`)
    })
  }

  const handleRemove = (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from your team?`)) return
    start(async () => {
      await removeTeamMember(memberId)
      setMembers(prev => prev.filter(m => m.id !== memberId))
      showToast('Member removed')
    })
  }

  const handleRole = (memberId: string, role: string) => {
    start(async () => {
      await updateTeamMemberRole(memberId, role)
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
    })
  }

  const initials = userInitials(user.name, user.email)

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">Your <span className="it">team.</span></h2>
        <p className="acct-sub-p">Invite collaborators. Roles control who can edit codes.</p>
      </div>

      {!canTeam && (
        <div className="acct-lock-card">
          <div>
            <div className="acct-lock-h">Team seats require Professional</div>
            <p className="acct-lock-p">Up to 5 seats on Pro · unlimited on Atelier · SSO + role-based permissions.</p>
          </div>
          <Link href="/pricing" className="btn-pri">Upgrade to Pro</Link>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 className="acct-h3" style={{ margin: 0 }}>
          Members · {members.length + 1} of {user.planId === 'atelier' ? '∞' : '5'}
        </h3>
        <button className="btn-mini" onClick={handleInvite} disabled={pending}>+ Invite member</button>
      </div>

      <div className="team-list">
        {/* Owner row (always you) */}
        <div className="team-row">
          <div className="team-avatar">{initials}</div>
          <div className="team-info">
            <div className="team-name">{user.name}</div>
            <div className="team-email">{user.email}</div>
          </div>
          <div className="team-role">
            <select disabled value="Owner"><option>Owner</option></select>
          </div>
          <div/>
        </div>

        {members.map(m => (
          <div key={m.id} className="team-row">
            <div className="team-avatar" style={{ background: 'var(--paper-3)', color: 'var(--ink-mute)', fontSize: 12 }}>
              {m.invitedEmail.slice(0, 2).toUpperCase()}
            </div>
            <div className="team-info">
              <div className="team-name" style={{ fontSize: 14 }}>{m.invitedEmail}</div>
              <div className="team-email">{m.acceptedAt ? 'Active' : 'Invite pending'}</div>
            </div>
            <div className="team-role">
              <select
                value={m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                disabled={!canTeam || pending}
                onChange={e => handleRole(m.id, e.target.value.toLowerCase())}
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <button className="acct-link danger" onClick={() => handleRemove(m.id, m.invitedEmail)} disabled={pending}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
