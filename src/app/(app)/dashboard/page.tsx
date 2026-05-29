import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDashboardData } from '@/lib/dashboard-data'
import MetricsBar  from '@/components/dashboard/metrics-bar'
import CodesTable  from '@/components/dashboard/codes-table'
import ScanChart   from '@/components/dashboard/scan-chart'
import GeoList     from '@/components/dashboard/geo-list'
import Link        from 'next/link'
import type { Metadata } from 'next'
import './dashboard.css'

export const metadata: Metadata = { title: 'Dashboard — Qdenty' }

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const user   = session.user as { id: string; name: string; planId?: string }
  const planId = user.planId ?? 'free'
  const data   = await getDashboardData(user.id)

  const firstName = user.name.split(' ')[0]

  return (
    <div className="screen">
      <div className="dash-intro">
        <h2>
          Good&nbsp;to&nbsp;see&nbsp;you,{' '}
          <span className="it">{firstName}.</span>
        </h2>
      </div>

      <div className="dash-frame">
        {/* ── Top bar ──────────────────────────────────────── */}
        <div className="dash-top">
          <div className="dh-ttl">
            Your Codes{' '}
            <span className="it">/ {data.codes.length}</span>
          </div>

          <div className="dh-search" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="4.8" cy="4.8" r="3.3" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7.5 7.5L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ color: 'var(--ink-mute)', fontFamily: 'var(--mono)', fontSize: 11 }}>
              Search codes…
            </span>
          </div>

          <Link href="/builder" className="dh-new">
            <span aria-hidden="true">＋</span> New Code
          </Link>
        </div>

        {/* ── Metrics ──────────────────────────────────────── */}
        <MetricsBar
          totalScans30d={data.totalScans30d}
          scanSparkline={data.chartBars.slice(-14)}
          liveCodes={data.liveCodes}
          codeSparkline={data.chartBars.slice(-14)}
          topCountry={data.topCountry}
          topCountryPct={data.topCountryPct}
          planId={planId}
        />

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="dash-body">
          <CodesTable codes={data.codes} />

          <aside className="dash-side">
            <ScanChart
              bars={data.chartBars}
              startLabel={data.chartStartLabel}
              endLabel={data.chartEndLabel}
            />
            <GeoList countries={data.countries} />
          </aside>
        </div>
      </div>
    </div>
  )
}
