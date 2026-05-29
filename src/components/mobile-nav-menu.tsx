'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface MobileNavLink {
  href:   string
  label:  string
}

interface Props {
  links:     MobileNavLink[]
  topSlot?:  React.ReactNode  // rendered between header and nav links (account section)
  children?: React.ReactNode  // rendered in the footer (CTA etc)
}

export default function MobileNavMenu({ links, topSlot, children }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <span /><span /><span />
      </button>

      {open && (
        <>
          <div className="mob-overlay" onClick={() => setOpen(false)} />
          <aside className="mob-sidebar">
            <div className="mob-sb-head">
              <span className="mob-sb-logo">qdenty<sup>™</sup></span>
              <button className="mob-sb-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
            </div>

            {/* Account / user section — top of sidebar */}
            {topSlot && (
              <div className="mob-sb-top">
                {topSlot}
              </div>
            )}

            <nav className="mob-sb-nav">
              {links.map(l => (
                <Link key={l.href} href={l.href} className="mob-sb-link" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {children && (
              <div className="mob-sb-foot">
                {children}
              </div>
            )}
          </aside>
        </>
      )}
    </>
  )
}
