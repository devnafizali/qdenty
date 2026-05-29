import Sparkline from '@/components/sparkline'
import Link      from 'next/link'
import { planLabel } from '@/lib/utils'

interface MetricsBarProps {
  totalScans30d:  number
  scanSparkline:  number[]
  liveCodes:      number
  codeSparkline:  number[]
  topCountry:     string | null
  topCountryPct:  number
  planId:         string
}

export default function MetricsBar({
  totalScans30d, scanSparkline,
  liveCodes, codeSparkline,
  topCountry, topCountryPct,
  planId,
}: MetricsBarProps) {
  return (
    <div className="dash-metrics">
      <div className="m">
        <Sparkline pts={scanSparkline.length >= 2 ? scanSparkline : [0, 0]} />
        <div className="lbl">Total Scans · 30d</div>
        <div className="val">{totalScans30d.toLocaleString()}</div>
        <div className="delta">↗ Last 30 days</div>
      </div>

      <div className="m">
        <Sparkline pts={codeSparkline.length >= 2 ? codeSparkline : [0, 0]} />
        <div className="lbl">Active Codes</div>
        <div className="val">
          {liveCodes}
          <span className="val-sub">live</span>
        </div>
        <div className="delta">↗ Running now</div>
      </div>

      <div className="m dim">
        <div className="lbl">Top Country · 30d</div>
        <div className="val val-md">
          {topCountry ? topCountry : '—'}
        </div>
        <div className="delta">
          {topCountry ? `${topCountryPct}% of scans` : 'No scans yet'}
        </div>
      </div>

      <div className="m dim">
        <div className="lbl">Your Plan</div>
        <div className="val val-md">{planLabel(planId)}</div>
        {planId !== 'pro' && planId !== 'atelier' ? (
          <div className="delta dn">
            <Link href="/pricing">Upgrade unlocks more ↗</Link>
          </div>
        ) : (
          <div className="delta">↗ All features active</div>
        )}
      </div>
    </div>
  )
}
