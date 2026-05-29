'use client'
import { useState, useTransition } from 'react'
import { updateProfile }  from '@/app/actions/account'
import { showToast }      from '@/components/toast'
import { userInitials }   from '@/lib/utils'
import type { UserData, ProfileData } from '../account-layout'

export default function ProfileSection({ user, profile }: { user: UserData; profile: ProfileData }) {
  const [pending, start] = useTransition()
  const [name,     setName]     = useState(user.name)
  const [slug,     setSlug]     = useState(user.slug ?? '')
  const [pronouns, setPronouns] = useState(profile.pronouns)
  const [phone,    setPhone]    = useState(profile.phone)
  const [title,    setTitle]    = useState(profile.title)
  const [bio,      setBio]      = useState(profile.bio)
  const [location, setLocation] = useState(profile.location)

  const initials = userInitials(user.name, user.email)

  const save = () => start(async () => {
    await updateProfile({ name, slug, pronouns, phone, title, bio, location })
    showToast('Profile saved')
  })

  return (
    <>
      <div className="acct-section-head">
        <h2 className="acct-h2">Your <span className="it">profile.</span></h2>
        <p className="acct-sub-p">What appears on your hosted identity page and CV.</p>
      </div>

      <div className="acct-card acct-card-row" style={{ marginBottom: 28 }}>
        <div className="acct-avatar">{initials}</div>
        <div>
          <div className="field-hint" style={{ marginBottom: 4 }}>Profile photo</div>
          <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginBottom: 12 }}>
            We use the first two letters of your name when no photo is set.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-mini" onClick={() => showToast('Photo upload coming in Segment 9')}>Upload photo</button>
            <button className="btn-mini-ghost">Remove</button>
          </div>
        </div>
      </div>

      <div className="form-stack">
        <div className="field-row">
          <div className="field">
            <label>Display name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Adelaide Marlow"/>
          </div>
          <div className="field">
            <label>Pronouns</label>
            <input value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="she / her"/>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input value={user.email} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }}/>
            <div className="field-hint">Contact support to change email.</div>
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 0184"/>
          </div>
        </div>
        <div className="field">
          <label>Job title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Editorial Designer · Type"/>
        </div>
        <div className="field">
          <label>Bio · 240 chars</label>
          <textarea rows={3} maxLength={240} value={bio} onChange={e => setBio(e.target.value)} placeholder="The story behind the scan."/>
          <div className="field-hint">{bio.length} / 240</div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lisbon, Portugal"/>
        </div>
        <div className="field">
          <label>Public URL slug</label>
          <div className="slug-row">
            <span>qdenty.io/u/</span>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32))}
              placeholder="your-name"
            />
          </div>
          <div className="field-hint">Lowercase, numbers, hyphens. This is where your Identity QR points.</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button className="btn-pri" onClick={save} disabled={pending} style={{ padding: '12px 24px' }}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}
