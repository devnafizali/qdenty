'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MarketingQr from '@/components/marketing/marketing-qr'

const AESTHETIC_QRS = [
  { cat: 'Poetry',      title: 'A Rumi couplet',         line: '"The wound is the place where the Light enters."',   tone: '#c2410c', emblem: 'P' },
  { cat: 'Cinema',      title: 'In the Mood for Love',    line: 'Wong Kar-wai · 2000 · a slow drift in red',          tone: '#8a2d2d', emblem: '8' },
  { cat: 'Music',       title: 'Bossa for a rainy hour',  line: 'A 47-min mixtape · Stan Getz, Jobim, Astrud',        tone: '#1e3a2b', emblem: '♪' },
  { cat: 'Astronomy',   title: "Tonight's sky",           line: 'NASA APOD · the Carina nebula, in dust & ink',       tone: '#0f0e0c', emblem: '✦' },
  { cat: 'Tea',         title: 'Bengali ginger blend',    line: 'Steep 4 minutes, no milk, two crushed cardamom',     tone: '#a3812d', emblem: 'অ' },
  { cat: 'Letters',     title: 'Borges, to a friend',     line: '"Time is the substance I am made of."',              tone: '#5b3e2b', emblem: 'B' },
  { cat: 'Paintings',   title: 'Hammershøi · Interior',   line: 'Vilhelm Hammershøi · 1908 · grey & quiet',           tone: '#475569', emblem: 'H' },
  { cat: 'Walks',       title: 'A loop in old Lisbon',    line: 'Alfama at golden hour · 38 minutes, mostly down',    tone: '#c2410c', emblem: '↻' },
  { cat: 'Notebook',    title: 'Tanizaki on shadow',      line: '"We delight in the mere sight of shadow…"',          tone: '#0f0e0c', emblem: '陰' },
  { cat: 'Architecture', title: 'Carlo Scarpa · Brion',   line: 'A tomb of light, water & concrete',                  tone: '#1e3a2b', emblem: 'C' },
  { cat: 'Recipes',     title: 'Tarte aux pommes',        line: 'Cold butter, salted crust, almost-burnt sugar',      tone: '#8a6d2c', emblem: '✿' },
  { cat: 'Postcards',   title: 'From Kyoto, in spring',   line: 'Cherry blossom @ Maruyama · stamped 04/03',          tone: '#d97a8b', emblem: '櫻' },
]

export default function HeroCard() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % AESTHETIC_QRS.length)
        setVisible(true)
      }, 380)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  const q = AESTHETIC_QRS[idx]

  return (
    <Link href="/templates" className="hero-card aesthetic">
      <div className="deco">scan me.</div>
      <div className="card-head">
        <div className="ttl">
          <span className="cat-tag" style={{ background: q.tone }}>{q.cat}</span>
          <span className="rot">No. {String(idx + 1).padStart(2, '0')} / {AESTHETIC_QRS.length}</span>
        </div>
        <div className="live-badge">
          <span className="dot" />{' '}Live · rotating
        </div>
      </div>

      <div className={`qr-frame qr-fade ${visible ? 'in' : 'out'}`}>
        <MarketingQr
          value={`https://qdenty.io/templates/${q.cat.toLowerCase()}`}
          size={0}
          color={q.tone}
          bg="#f3efe7"
          style={{ width: '100%', height: '100%', opacity: 0.92 }}
        />
      </div>

      <div className={`qr-caption qr-fade ${visible ? 'in' : 'out'}`}>
        <div className="cap-h">{q.title}</div>
        <div className="cap-l">{q.line}</div>
      </div>

      <div className="meta">
        <div><b>CATEGORY</b>{q.cat} · curated</div>
        <div><b>STATUS</b>Live · rotating</div>
      </div>

      <div className="hero-dots" aria-hidden>
        {AESTHETIC_QRS.map((_, i) => (
          <span key={i} className={i === idx ? 'on' : ''} />
        ))}
      </div>
    </Link>
  )
}
