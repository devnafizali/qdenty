import { db } from '@/db'
import { qrCode, scanEvent } from '@/db/schema'
import { eq, and, gte, inArray } from 'drizzle-orm'

export type Range = '7d' | '30d' | '90d'

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
  PT: 'Portugal', ES: 'Spain', IT: 'Italy', NL: 'Netherlands',
  JP: 'Japan', CN: 'China', IN: 'India', BR: 'Brazil',
  CA: 'Canada', AU: 'Australia', KR: 'South Korea', MX: 'Mexico',
  BD: 'Bangladesh', PK: 'Pakistan', SG: 'Singapore', AE: 'UAE',
  PL: 'Poland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  CH: 'Switzerland', AT: 'Austria', BE: 'Belgium', ZA: 'South Africa',
}

export interface BreakdownEntry {
  name:     string
  count:    number
  pct:      number
  barWidth: number
}

export interface CodeStat {
  id:        string
  label:     string
  type:      string
  scans:     number
  pct:       number
  sparkline: number[]   // daily counts for the range
}

export interface AnalyticsData {
  range:          Range
  days:           number
  chartBars:      number[]
  chartLabels:    string[]
  totalScans:     number
  prevScans:      number
  activeCodes:    number
  topCountry:     string | null
  topCountryPct:  number
  mobilePct:      number
  codes:          CodeStat[]
  geo:            BreakdownEntry[]
  device:         BreakdownEntry[]
  browser:        BreakdownEntry[]
}

export async function getAnalyticsData(userId: string, range: Range = '30d'): Promise<AnalyticsData> {
  const days     = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const now      = Date.now()
  const msDay    = 86400_000
  const ago      = new Date(now - days * msDay)
  const agoPrev  = new Date(now - days * 2 * msDay)

  const rawCodes = await db.select({
    id: qrCode.id, label: qrCode.label, type: qrCode.type, status: qrCode.status,
  }).from(qrCode).where(eq(qrCode.userId, userId))

  const activeCodes = rawCodes.filter(c => c.status === 'live').length

  if (rawCodes.length === 0) {
    const emptyBars = new Array(days).fill(0)
    return {
      range, days,
      chartBars: emptyBars, chartLabels: buildLabels(now, days),
      totalScans: 0, prevScans: 0, activeCodes: 0,
      topCountry: null, topCountryPct: 0, mobilePct: 0,
      codes: [], geo: [], device: [], browser: [],
    }
  }

  const codeIds = rawCodes.map(c => c.id)

  // Fetch current period + previous period in one query
  const allScans = await db.select({
    codeId:     scanEvent.codeId,
    scannedAt:  scanEvent.scannedAt,
    country:    scanEvent.country,
    deviceType: scanEvent.deviceType,
    browser:    scanEvent.browser,
  }).from(scanEvent).where(
    and(inArray(scanEvent.codeId, codeIds), gte(scanEvent.scannedAt, agoPrev))
  )

  // Day keys for chart
  const dayKeys: string[] = []
  for (let i = days - 1; i >= 0; i--) dayKeys.push(isoDay(now - i * msDay))

  const chart: Record<string, number> = Object.fromEntries(dayKeys.map(k => [k, 0]))
  const codeScans: Record<string, number> = Object.fromEntries(codeIds.map(id => [id, 0]))
  const codeSpark: Record<string, Record<string, number>> = {}
  for (const c of rawCodes) codeSpark[c.id] = Object.fromEntries(dayKeys.map(k => [k, 0]))

  const geo:     Record<string, number> = {}
  const device:  Record<string, number> = {}
  const browser: Record<string, number> = {}

  let totalScans = 0
  let prevScans  = 0
  const agoTs    = +ago

  for (const s of allScans) {
    const ts  = +new Date(s.scannedAt)
    const day = isoDay(ts)

    if (ts >= agoTs) {
      // current period
      totalScans++
      if (day in chart)  chart[day]++
      if (s.codeId in codeScans) codeScans[s.codeId]++
      if (s.codeId in codeSpark && day in codeSpark[s.codeId]) codeSpark[s.codeId][day]++
      if (s.country)    geo[s.country]    = (geo[s.country]    || 0) + 1
      if (s.deviceType) device[s.deviceType] = (device[s.deviceType] || 0) + 1
      if (s.browser)    browser[s.browser]   = (browser[s.browser]   || 0) + 1
    } else {
      prevScans++
    }
  }

  // Mobile %
  const mobileCount  = (device['mobile'] || 0)
  const mobilePct    = totalScans > 0 ? Math.round((mobileCount / totalScans) * 100) : 0

  // Per-code stats
  const codes: CodeStat[] = rawCodes
    .map(c => ({
      id:        c.id,
      label:     c.label,
      type:      c.type,
      scans:     codeScans[c.id] || 0,
      pct:       totalScans > 0 ? Math.round(((codeScans[c.id] || 0) / totalScans) * 100) : 0,
      sparkline: dayKeys.map(k => codeSpark[c.id]?.[k] ?? 0),
    }))
    .sort((a, b) => b.scans - a.scans)

  return {
    range,
    days,
    chartBars:   dayKeys.map(k => chart[k]),
    chartLabels: buildLabels(now, days),
    totalScans,
    prevScans,
    activeCodes,
    topCountry:    Object.entries(geo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    topCountryPct: topPct(geo),
    mobilePct,
    codes,
    geo:     toBreakdown(geo, COUNTRY_NAMES),
    device:  toBreakdown(device),
    browser: toBreakdown(browser),
  }
}

function toBreakdown(counts: Record<string, number>, names?: Record<string, string>): BreakdownEntry[] {
  const total  = Object.values(counts).reduce((a, b) => a + b, 0)
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const top    = sorted[0]?.[1] || 1
  return sorted.map(([key, count]) => ({
    name:     names ? (names[key] || key) : capitalise(key),
    count,
    pct:      total > 0 ? Math.round((count / total) * 100) : 0,
    barWidth: Math.round((count / top) * 100),
  }))
}

function topPct(counts: Record<string, number>): number {
  const vals  = Object.values(counts)
  const total = vals.reduce((a, b) => a + b, 0)
  const top   = Math.max(...vals, 0)
  return total > 0 ? Math.round((top / total) * 100) : 0
}

function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function buildLabels(now: number, days: number): string[] {
  const labels: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400_000)
    labels.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase())
  }
  return labels
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
