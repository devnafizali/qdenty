'use client'
import { useRef, useState } from 'react'

interface Props {
  bars:   number[]
  labels: string[]
  range:  string
}

export default function AnlChart({ bars, labels, range }: Props) {
  const [tooltip, setTooltip] = useState<{ idx: number; count: number; label: string } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const max = Math.max(...bars, 1)

  // Show a tick label every N bars depending on range length
  const tickEvery = bars.length <= 7 ? 1 : bars.length <= 30 ? 5 : 10

  // Pointer scrubbing — works for both mouse hover and touch drag, so the
  // chart stays usable when bars are too thin to tap individually on mobile.
  const scrub = (clientX: number) => {
    const el = chartRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    const idx = Math.max(0, Math.min(bars.length - 1, Math.floor(ratio * bars.length)))
    setTooltip({ idx, count: bars[idx], label: labels[idx] })
  }

  return (
    <div className="anl-chart-wrap">
      <div className="anl-chart-head">
        <span className="anl-sec-h">Scan volume <span className="anl-sec-dim">· {range}</span></span>
        <span className={'anl-chart-tip' + (tooltip ? ' on' : '')}>
          {tooltip
            ? <>{tooltip.label} — <b>{tooltip.count}</b> scan{tooltip.count !== 1 ? 's' : ''}</>
            : <span className="anl-chart-tip-hint">Tap or drag the chart</span>}
        </span>
      </div>

      <div
        ref={chartRef}
        className="anl-chart"
        role="img"
        aria-label={`${range} scan volume chart`}
        onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); scrub(e.clientX) }}
        onPointerMove={e => scrub(e.clientX)}
        onPointerUp={() => setTooltip(null)}
        onPointerCancel={() => setTooltip(null)}
        onPointerLeave={() => setTooltip(null)}
      >
        {bars.map((count, i) => (
          <div
            key={i}
            className={'anl-bar' + (tooltip?.idx === i ? ' on' : '')}
            style={{ height: `${Math.max(2, (count / max) * 100)}%` }}
          />
        ))}
      </div>

      <div className="anl-chart-axis">
        {bars.map((_, i) => (
          <span key={i} className="anl-axis-tick">
            {i % tickEvery === 0 ? labels[i] : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
