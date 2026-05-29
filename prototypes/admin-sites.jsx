/* ============ Site Management — codes & content moderation ============ */

function SiteManagement() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const codes = adminState.codes;
  const filtered = codes.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (typeFilter !== 'all' && c.type.toLowerCase() !== typeFilter) return false;
    if (search && !(c.label + c.user + c.id + c.type).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalScans = codes.reduce((s, c) => s + c.scans, 0);

  return (
    <div className="adm-page">
      <PageHead
        tag="03 · Business"
        title={<>Every <span className="it">code</span> on the platform.</>}
        sub="Operational oversight for all 124K live codes — content moderation, abuse signals, hosted pages, and template registry. Surface anything risky."
        actions={
          <>
            <button className="adm-btn ghost">Manage Templates</button>
            <button className="adm-btn pri">+ Publish Template</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="Total Codes" value="124,891" delta="+3.2%" foot="all-time" />
        <KPI label="Active" value="98,420" delta="+2.1%" foot="78.8% of base" />
        <KPI label="Scans · 30d" value="1.28M" delta="+15.8%" foot="42% from PT" />
        <KPI label="Flagged for Review" value="14" deltaDir="dn" delta="3 new" foot="ops queue" />
      </div>

      <div className="adm-grid">
        <div className="panel">
          <div className="pn-head">
            <h3>Type <span className="it">distribution</span></h3>
            <span className="pn-tag">Across all accounts</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Identity', 32, 39820],
                ['Menu', 22, 28140],
                ['CV / Résumé', 14, 17280],
                ['Loyalty', 11, 13420],
                ['Gallery', 9, 11280],
                ['Event', 6, 7892],
                ['WiFi', 4, 4920],
                ['Other', 2, 2137],
              ].map(([n, pct, count]) => (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 90px', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{n}</span>
                  <div className="mini-bar accent" style={{ '--w': pct + '%' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, textAlign: 'right', color: 'var(--ink)' }}>
                    {fmt.int(count)} <span style={{ color: 'var(--ink-mute)' }}>· {pct}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Moderation <span className="it">queue</span></h3>
            <span className="pn-tag" style={{ color: 'var(--accent)' }}>3 NEED ACTION</span>
          </div>
          <div className="pn-body flush">
            <div className="feed">
              {[
                { ic: '!', col: 'red', who: 'c_4129', what: 'matches phishing pattern · auto-paused', when: 'just now' },
                { ic: '!', col: 'red', who: 'c_8810', what: 'reported by 3 users · trademark abuse', when: '14 min ago' },
                { ic: '◆', col: 'gold', who: 'c_2014', what: 'sudden 10× scan spike · possible bot', when: '1 hr ago' },
                { ic: '◆', col: 'gold', who: 'c_5582', what: 'destination URL returns 503', when: '2 hrs ago' },
                { ic: '✓', col: 'green', who: 'c_8410', what: 'cleared after manual review', when: 'yesterday' },
              ].map((a, i) => (
                <div key={i} className="feed-item">
                  <div className={'f-ico ' + a.col}>{a.ic}</div>
                  <div className="f-body">
                    <div className="f-msg"><b className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 400, background: 'var(--paper-2)', padding: '1px 6px', border: '1px solid var(--rule)' }}>{a.who}</b> {a.what}</div>
                  </div>
                  <div className="f-time">{a.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="pn-head">
          <h3>All <span className="it">codes</span></h3>
          <div className="row-flex">
            <span className="mono-tiny">{fmt.int(totalScans)} TOTAL SCANS</span>
            <button className="adm-btn sm ghost">Bulk export</button>
          </div>
        </div>

        <div className="tbl-filters">
          {[
            ['all', 'All'],
            ['live', 'Live'],
            ['flagged', 'Flagged'],
            ['expired', 'Expired'],
            ['draft', 'Draft'],
          ].map(([k, l]) => (
            <button key={k} className={'chip-sel ' + (filter === k ? 'on' : '')} onClick={() => setFilter(k)}>{l}</button>
          ))}
          <span style={{ width: 1, height: 18, background: 'var(--rule)' }} />
          <select className="chip-sel" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ minWidth: 130 }}>
            <option value="all">Any Type</option>
            <option value="identity">Identity</option>
            <option value="menu">Menu</option>
            <option value="cv">CV</option>
            <option value="loyalty">Loyalty</option>
            <option value="gallery">Gallery</option>
            <option value="event">Event</option>
            <option value="url">URL</option>
          </select>
          <div className="tf-spacer" />
          <input className="tf-search" placeholder="Search code, label, owner…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Scans</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className={c.status === 'expired' ? 'muted' : ''}>
                <td>
                  <div className="row-link">
                    <div style={{ width: 36, height: 36, background: c.status === 'flagged' ? 'rgba(185, 28, 28, 0.1)' : 'var(--ink)', display: 'grid', placeItems: 'center', flexShrink: 0, border: c.status === 'flagged' ? '1.5px solid #b91c1c' : 'none' }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: 'block' }}>
                        {/* mini QR placeholder */}
                        {Array.from({ length: 49 }).map((_, i) => {
                          const x = (i % 7) * 3 + 0.5;
                          const y = Math.floor(i / 7) * 3 + 0.5;
                          const hash = (i * 17 + c.id.charCodeAt(c.id.length - 1)) % 5;
                          return hash < 2 ? <rect key={i} x={x} y={y} width="2.5" height="2.5" fill={c.status === 'flagged' ? '#b91c1c' : 'var(--paper)'} /> : null;
                        })}
                      </svg>
                    </div>
                    <div className="stack">
                      <b>{c.label}</b>
                      <span className="sub">{c.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{c.user}</span>
                </td>
                <td><span className="pill gray no-dot">{c.type}</span></td>
                <td className="num">{fmt.int(c.scans)}</td>
                <td>
                  <span className={'pill no-dot ' + (c.risk === 'high' ? 'red' : 'gray')}>
                    {c.risk === 'high' ? 'High · ' + 'Auto' : 'Low'}
                  </span>
                </td>
                <td><StatusPill status={c.status} /></td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>{c.created}</td>
                <td className="r"><button className="row-menu">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="adm-page-bar">
          <span>{filtered.length} of 124,891 codes</span>
          <div className="pgs">
            <button disabled>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <button>…</button>
            <button>›</button>
          </div>
          <span>50 per page</span>
        </div>
      </div>
    </div>
  );
}

window.SiteManagement = SiteManagement;
