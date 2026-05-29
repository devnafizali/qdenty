'use client'
import { useState, useMemo } from 'react'
import Link       from 'next/link'
import Sparkline  from '@/components/sparkline'
import RowActions from './row-actions'
import type { CodeRow } from '@/lib/dashboard-data'

interface CodesTableProps { codes: CodeRow[] }

const STATUS_LABEL: Record<string, string> = { live: 'Live', draft: 'Draft', exp: 'Expired' }
const TYPE_COLORS:  Record<string, string> = {
  Identity: '#1e3a2b', CV: '#0f0e0c', Menu: '#8a6d2c',
  WiFi: '#1d4ed8', Loyalty: '#7c3aed', Event: '#be123c',
  Gallery: '#0e7490',
}

export default function CodesTable({ codes }: CodesTableProps) {
  const [search,  setSearch]  = useState('')
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(() =>
    search
      ? codes.filter(c =>
          (c.label + c.type + c.payload).toLowerCase().includes(search.toLowerCase())
        )
      : codes,
    [codes, search]
  )

  const visible = showAll ? filtered : filtered.slice(0, 7)

  return (
    <div className="dash-table-wrap">
      <div className="dash-table-head">
        <h3 className="dash-table-title">
          Your Codes
          {filtered.length > 7 && (
            <button
              className="all-toggle"
              onClick={() => setShowAll(s => !s)}
            >
              {showAll ? 'Show less ←' : `View all ${filtered.length} →`}
            </button>
          )}
        </h3>

        <div className="dh-search">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="4.8" cy="4.8" r="3.3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 7.5L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search codes, labels, URLs…"
            aria-label="Search codes"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>
      </div>

      <table className="dash-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Scans · 14d</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(c => (
            <tr
              key={c.id}
              style={c.status === 'exp' ? { opacity: 0.5 } : c.status === 'draft' ? { opacity: 0.65 } : {}}
            >
              <td>
                <div className="code-label-cell">
                  <div
                    className="qr-thumb"
                    style={{ background: TYPE_COLORS[c.type] || 'var(--ink)' }}
                    aria-hidden="true"
                  >
                    {c.type[0]}
                  </div>
                  <span>{c.label}</span>
                </div>
              </td>
              <td><span className="type-pill">{c.type}</span></td>
              <td>
                <div className="scans-cell">
                  <Sparkline pts={c.sparkline} dim={c.status !== 'live'} />
                  <b className="scans-num">
                    {c.scans > 0 ? c.scans.toLocaleString() : '—'}
                  </b>
                </div>
              </td>
              <td>
                <span className={`status ${c.status}`}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
              </td>
              <td>
                <span className="created-date">
                  {new Date(c.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </td>
              <td className="row-actions-cell">
                <RowActions code={c} />
              </td>
            </tr>
          ))}

          {visible.length === 0 && (
            <tr>
              <td colSpan={6} className="table-empty">
                {search ? `No codes match "${search}"` : 'No codes yet.'}
                {!search && (
                  <Link href="/builder" className="table-empty-cta">Create your first code →</Link>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
