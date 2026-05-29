import { db } from '@/db'
import { qrCode, scanEvent } from '@/db/schema'
import { eq, and, gte, inArray } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
  PT: 'Portugal', ES: 'Spain', IT: 'Italy', NL: 'Netherlands',
  JP: 'Japan', CN: 'China', IN: 'India', BR: 'Brazil',
  CA: 'Canada', AU: 'Australia', KR: 'South Korea', MX: 'Mexico',
  BD: 'Bangladesh', PK: 'Pakistan', SG: 'Singapore', AE: 'UAE',
  PL: 'Poland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  CH: 'Switzerland', AT: 'Austria', BE: 'Belgium', ZA: 'South Africa',
}

export interface CodeRow {
  id: string
  userId: string
  label: string
  type: string
  payload: string
  color: string
  status: string
  scans: number
  createdAt: Date
  updatedAt: Date
  sparkline: number[]  // last 14 days
}

export interface GeoEntry {
  code: string
  name: string
  count: number
  pct: number
  barWidth: number  // 0–100 relative to top country
}

export interface DashboardData {
  codes:           CodeRow[]
  chartBars:       number[]   // 30-day scan counts per day
  totalScans30d:   number
  liveCodes:       number
  topCountry:      string | null
  topCountryPct:   number
  countries:       GeoEntry[]
  chartStartLabel: string
  chartEndLabel:   string
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now    = Date.now()
  const ms30d  = 30 * 86400_000
  const ms14d  = 14 * 86400_000
  const ago30d = new Date(now - ms30d)

  // ── Codes ────────────────────────────────────────────────────
  const rawCodes = await db.select().from(qrCode)
    .where(eq(qrCode.userId, userId))
    .orderBy(desc(qrCode.createdAt))

  const liveCodes = rawCodes.filter(c => c.status === 'live').length

  if (rawCodes.length === 0) {
    return {
      codes: [], chartBars: new Array(30).fill(0),
      totalScans30d: 0, liveCodes: 0,
      topCountry: null, topCountryPct: 0, countries: [],
      chartStartLabel: fmtAxisDate(ago30d),
      chartEndLabel:   fmtAxisDate(new Date(now)),
    }
  }

  const codeIds = rawCodes.map(c => c.id)

  // ── Scan events (30d) ────────────────────────────────────────
  const scans = await db.select({
    codeId:    scanEvent.codeId,
    scannedAt: scanEvent.scannedAt,
    country:   scanEvent.country,
  }).from(scanEvent)
    .where(and(inArray(scanEvent.codeId, codeIds), gte(scanEvent.scannedAt, ago30d)))

  // ── Build day buckets ────────────────────────────────────────
  // 30-day chart
  const dayKeys30: string[] = []
  for (let i = 29; i >= 0; i--) {
    dayKeys30.push(isoDay(now - i * 86400_000))
  }
  const chart30: Record<string, number> = Object.fromEntries(dayKeys30.map(k => [k, 0]))

  // 14-day per-code sparkline buckets
  const dayKeys14: string[] = []
  for (let i = 13; i >= 0; i--) {
    dayKeys14.push(isoDay(now - i * 86400_000))
  }
  const sparkBuckets: Record<string, Record<string, number>> = {}
  for (const c of rawCodes) {
    sparkBuckets[c.id] = Object.fromEntries(dayKeys14.map(k => [k, 0]))
  }

  // Country totals
  const countryCounts: Record<string, number> = {}
  let totalCountryScans = 0

  // Single pass over all scans
  for (const s of scans) {
    const day = isoDay(+new Date(s.scannedAt))
    if (day in chart30) chart30[day]++
    if (s.codeId in sparkBuckets && day in sparkBuckets[s.codeId]) {
      sparkBuckets[s.codeId][day]++
    }
    if (s.country) {
      countryCounts[s.country] = (countryCounts[s.country] || 0) + 1
      totalCountryScans++
    }
  }

  const chartBars   = dayKeys30.map(k => chart30[k])
  const total30d    = chartBars.reduce((a, b) => a + b, 0)

  // ── Geo ──────────────────────────────────────────────────────
  const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])
  const topCount = sortedCountries[0]?.[1] || 1
  const countries: GeoEntry[] = sortedCountries.slice(0, 5).map(([code, count]) => ({
    code,
    name:     COUNTRY_NAMES[code] || code,
    count,
    pct:      Math.round((count / Math.max(1, totalCountryScans)) * 100),
    barWidth: Math.round((count / topCount) * 100),
  }))

  const topCountry    = sortedCountries[0]?.[0] ?? null
  const topCountryPct = topCountry
    ? Math.round((countryCounts[topCountry] / Math.max(1, totalCountryScans)) * 100)
    : 0

  // ── Assemble codes with sparklines ───────────────────────────
  const codes: CodeRow[] = rawCodes.map(c => ({
    ...c,
    sparkline: dayKeys14.map(k => sparkBuckets[c.id]?.[k] ?? 0),
  }))

  return {
    codes, chartBars, totalScans30d: total30d,
    liveCodes, topCountry, topCountryPct, countries,
    chartStartLabel: fmtAxisDate(ago30d),
    chartEndLabel:   fmtAxisDate(new Date(now)),
  }
}

function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function fmtAxisDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
}
