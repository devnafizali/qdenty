'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Wraps the identity card + info grid. On mobile the card is `position: sticky`;
 * once it pins below the nav this flips `.stuck` on the frame so CSS can
 * collapse the card into a slim header — the same shrink-on-scroll feel the
 * QR builder preview uses.
 */
export default function IdentityFrame({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: '-66px 0px 0px 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="identity-sentinel" aria-hidden />
      <div className={'identity-frame' + (stuck ? ' stuck' : '')}>
        {children}
      </div>
    </>
  )
}
