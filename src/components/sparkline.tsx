interface SparklineProps {
  pts: number[]
  dim?: boolean
  width?: number
  height?: number
}

export default function Sparkline({ pts, dim = false, width = 64, height = 26 }: SparklineProps) {
  if (!pts || pts.length < 2) return null

  const max  = Math.max(...pts)
  const min  = Math.min(...pts)
  const pad  = 1.5
  const w    = width
  const h    = height
  const step = (w - pad * 2) / (pts.length - 1)
  const norm = (v: number) =>
    h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2)

  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step} ${norm(v)}`).join(' ')
  const area = line + ` L ${pad + (pts.length - 1) * step} ${h} L ${pad} ${h} Z`
  const last = pts[pts.length - 1]
  const cx   = pad + (pts.length - 1) * step
  const cy   = norm(last)

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: w, height: h, overflow: 'visible' }}
      aria-hidden="true"
    >
      <path className="area" d={area} />
      <path d={line} />
      <circle
        cx={cx} cy={cy} r="1.8"
        fill={dim ? 'var(--ink-mute)' : 'var(--accent)'}
        stroke="var(--paper-2)"
        strokeWidth="0.8"
      />
    </svg>
  )
}
