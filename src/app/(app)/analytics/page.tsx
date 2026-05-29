import { redirect }         from 'next/navigation'
import { headers }          from 'next/headers'
import { auth }             from '@/lib/auth'
import { getAnalyticsData } from '@/lib/analytics-data'
import type { Range }       from '@/lib/analytics-data'
import AnlChart             from '@/components/analytics/anl-chart'
import AnlCodeTable         from '@/components/analytics/anl-code-table'
import Link                 from 'next/link'
import type { Metadata }    from 'next'
import './analytics.css'

export const metadata: Metadata = { title: 'Analytics — Qdenty' }

const VALID_RANGES: Range[] = ['7d', '30d', '90d']

interface Props { searchParams: Promise<{ range?: string }> }

function delta(curr: number, prev: number): { sign: string; val: string; up: boolean } {
  if (prev === 0) return { sign: '+', val: '—', up: true }
  const pct = Math.round(((curr - prev) / prev) * 100)
  return { sign: pct >= 0 ? '+' : '', val: `${pct}%`, up: pct >= 0 }
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const { range: rawRange } = await searchParams
  const range = VALID_RANGES.includes(rawRange as Range) ? (rawRange as Range) : '30d'

  const user = session.user as { id: string; planId?: string }
  const data = await getAnalyticsData(user.id, range)

  const d = delta(data.totalScans, data.prevScans)

  return (
    <div className="screen">
      <div className="screen-tag"><b>§ 07</b> Analytics</div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="anl-head">
        <div>
          <h2>
            Scan <span className="it">Analytics</span>
          </h2>
          <p className="anl-sub">
            Every scan, code, and source — in one place.
          </p>
        </div>

        <div className="anl-range">
          {VALID_RANGES.map(r => (
            <Link
              key={r}
              href={`/analytics?range=${r}`}
              className={'anl-range-btn' + (range === r ? ' on' : '')}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Metrics ────────────────────────────────────────── */}
      <div className="anl-metrics">
        <div className="anl-m">
          <span className="lbl">Total Scans</span>
          <div className="val">
            {data.totalScans.toLocaleString()}
            <span className="val-sub">{range}</span>
          </div>
          <div className={'delta' + (d.up ? '' : ' dn')}>
            {d.sign}{d.val} vs prior period
          </div>
        </div>

        <div className="anl-m">
          <span className="lbl">Active Codes</span>
          <div className="val">{data.activeCodes}</div>
          <div className="delta">
            {data.codes.filter(c => c.scans > 0).length} received scans
          </div>
        </div>

        <div className="anl-m">
          <span className="lbl">Top Geography</span>
          <div className="val val-md">
            {data.topCountry
              ? <>{data.topCountry}<span className="val-sub">{data.topCountryPct}%</span></>
              : <span className="val-sub">—</span>
            }
          </div>
          <div className="delta">
            {data.geo.length > 1 ? `${data.geo.length} countries` : 'No geo data'}
          </div>
        </div>

        <div className="anl-m">
          <span className="lbl">Mobile Share</span>
          <div className="val">
            {data.mobilePct}<span className="val-sub">%</span>
          </div>
          <div className="delta">
            {data.device.find(d => d.name === 'Desktop')?.pct ?? 0}% desktop
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="anl-body">

        {/* Main column */}
        <div className="anl-main">
          <AnlChart bars={data.chartBars} labels={data.chartLabels} range={range} />
          <AnlCodeTable codes={data.codes} range={range} />
        </div>

        {/* Side column */}
        <aside className="anl-side">

          {/* Geo */}
          <div className="anl-breakdown">
            <div className="anl-sec-h">Geography</div>
            {data.geo.length === 0
              ? <p className="anl-empty">No data</p>
              : data.geo.map((g, i) => (
                <div key={i} className="bk-row">
                  <div className="bk-label">{g.name}</div>
                  <div className="bk-bar-wrap">
                    <div className="bk-bar" style={{ width: `${g.barWidth}%` }} />
                  </div>
                  <div className="bk-pct">{g.pct}%</div>
                </div>
              ))
            }
          </div>

          {/* Device */}
          <div className="anl-breakdown">
            <div className="anl-sec-h">Device</div>
            {data.device.length === 0
              ? <p className="anl-empty">No data</p>
              : data.device.map((d, i) => (
                <div key={i} className="bk-row">
                  <div className="bk-label">{d.name}</div>
                  <div className="bk-bar-wrap">
                    <div className="bk-bar" style={{ width: `${d.barWidth}%` }} />
                  </div>
                  <div className="bk-pct">{d.pct}%</div>
                </div>
              ))
            }
          </div>

          {/* Browser */}
          <div className="anl-breakdown">
            <div className="anl-sec-h">Browser</div>
            {data.browser.length === 0
              ? <p className="anl-empty">No data</p>
              : data.browser.map((b, i) => (
                <div key={i} className="bk-row">
                  <div className="bk-label">{b.name}</div>
                  <div className="bk-bar-wrap">
                    <div className="bk-bar" style={{ width: `${b.barWidth}%` }} />
                  </div>
                  <div className="bk-pct">{b.pct}%</div>
                </div>
              ))
            }
          </div>

        </aside>
      </div>
    </div>
  )
}
