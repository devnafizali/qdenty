'use client'
import { useState } from 'react'
import Sparkline from '@/components/sparkline'
import type { CodeStat } from '@/lib/analytics-data'

interface Props {
  codes: CodeStat[]
  range: string
}

const TYPE_GLYPHS: Record<string, string> = {
  Identity: '◈', CV: '▤', URL: '→', WiFi: '◎', Menu: '≡',
  Loyalty: '★', Event: '◆', Gallery: '▣', Contact: '●',
  Location: '◉', Text: 'T', Email: '✉', Phone: '☏',
}

export default function AnlCodeTable({ codes, range }: Props) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? codes : codes.slice(0, 8)

  if (codes.length === 0) {
    return (
      <div className="anl-codes-empty">
        No scan data for this period.
      </div>
    )
  }

  return (
    <div className="anl-codes-wrap">
      <div className="anl-codes-head">
        <span className="anl-sec-h">By code <span className="anl-sec-dim">· {range}</span></span>
        {codes.length > 8 && (
          <button className="all-toggle" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show less' : `Show all ${codes.length}`}
          </button>
        )}
      </div>

      <table className="anl-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th className="num">Scans</th>
            <th className="num">Share</th>
            <th className="spark-col">Trend</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(c => (
            <tr key={c.id}>
              <td className="anl-code-label" data-label="Code">{c.label}</td>
              <td className="anl-code-type" data-label="Type">
                <span className="type-glyph">{TYPE_GLYPHS[c.type] ?? '◦'}</span>
                {c.type}
              </td>
              <td className="num anl-scans" data-label="Scans">{c.scans.toLocaleString()}</td>
              <td className="num anl-pct" data-label="Share">{c.pct}%</td>
              <td className="spark-col" data-label="Trend">
                <Sparkline pts={c.sparkline} width={64} height={24} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
