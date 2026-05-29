import { headers }   from 'next/headers'
import { redirect }  from 'next/navigation'
import { notFound }  from 'next/navigation'
import { auth }      from '@/lib/auth'
import { db }        from '@/db'
import { teamMember, user } from '@/db/schema'
import { eq }        from 'drizzle-orm'
import InviteClient  from './invite-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Team Invite — Qdenty' }

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const [invite] = await db
    .select({
      id:           teamMember.id,
      invitedEmail: teamMember.invitedEmail,
      role:         teamMember.role,
      acceptedAt:   teamMember.acceptedAt,
      expiresAt:    teamMember.inviteExpiresAt,
      ownerId:      teamMember.ownerId,
    })
    .from(teamMember)
    .where(eq(teamMember.inviteToken, token))
    .limit(1)

  if (!invite) notFound()

  const [owner] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, invite.ownerId))
    .limit(1)

  const expired = invite.expiresAt ? invite.expiresAt < new Date() : false
  const already = !!invite.acceptedAt

  const sess = await auth.api.getSession({ headers: await headers() })
  const currentUser = sess
    ? { email: (sess.user as { email: string }).email, name: (sess.user as { name: string }).name }
    : null

  const emailMatch = currentUser ? currentUser.email === invite.invitedEmail : null

  return (
    <InviteClient
      token={token}
      invite={{
        invitedEmail: invite.invitedEmail,
        role:         invite.role,
        ownerName:    owner?.name  ?? 'Someone',
        ownerEmail:   owner?.email ?? '',
        expired,
        already,
      }}
      currentUser={currentUser}
      emailMatch={emailMatch}
    />
  )
}
