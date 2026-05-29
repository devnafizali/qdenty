'use client'
import { useState } from 'react'

interface ScanChartProps {
  bars:       number[]
  startLabel: string
  endLabel:   string
}

export default function ScanChart({ bars, startLabel, endLabel }: ScanChartProps) {
  const [tooltip, setTooltip] = useState<{ idx: number; count: number } | null>(null)
  const max = Math.max(...bars, 1)

  return (
    <div className="dash-side-section">
      <h3 className="dash-side-h">Scan Activity · 30d</h3>

      <div className="scan-chart" role="img" aria-label="30-day scan chart">
        {bars.map((count, i) => (
          <div
            key={i}
            className={`bar${i === bars.length - 1 ? ' peak' : ''}`}
            style={{ height: `${Math.max(2, (count / max) * 100)}%` }}
            onMouseEnter={() => setTooltip({ idx: i, count })}
            onMouseLeave={() => setTooltip(null)}
            title={`${count} scan${count !== 1 ? 's' : ''}`}
          />
        ))}
        {tooltip && (
          <div className="chart-tooltip">
            {tooltip.count} scan{tooltip.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="scan-chart-axis">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  )
}
