import type { GeoEntry } from '@/lib/dashboard-data'

interface GeoListProps { countries: GeoEntry[] }

export default function GeoList({ countries }: GeoListProps) {
  if (countries.length === 0) {
    return (
      <div className="dash-side-section">
        <h3 className="dash-side-h">Top Geographies</h3>
        <p className="dash-side-empty">No scan data yet.</p>
      </div>
    )
  }

  return (
    <div className="dash-side-section">
      <h3 className="dash-side-h">Top Geographies</h3>
      <ul className="geo-list">
        {countries.map(c => (
          <li key={c.code}>
            <span className="geo-code">{c.code}</span>
            <span className="geo-name">{c.name}</span>
            <span className="geo-bar" style={{ '--w': `${c.barWidth}%` } as React.CSSProperties} />
            <span className="geo-pct">{c.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
