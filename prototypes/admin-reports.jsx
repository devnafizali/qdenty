/* ============ Reports — analytics & insights ============ */

function Reports() {
  const [period, setPeriod] = useState('30d');

  return (
    <div className="adm-page">
      <PageHead
        tag="06 · Overview"
        title={<>Reports & <span className="it">analytics.</span></>}
        sub="Pre-built reports for revenue, growth, retention, and product usage. Pin any chart to the dashboard or schedule it as a recurring email."
        actions={
          <>
            <button className="adm-btn ghost">Schedule report</button>
            <button className="adm-btn ghost">Export PDF</button>
            <button className="adm-btn pri">Build custom</button>
          </>
        }
      />

      {/* Report library tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1.5px solid var(--line)', marginBottom: 24, background: 'var(--paper)' }}>
        {[
          { ic: '€', t: 'Revenue & MRR', d: 'Gross, net, expansion, contraction, churn — all in one waterfall.' },
          { ic: '↗', t: 'Growth funnel', d: 'Visitor → signup → trial → paid → expansion. Drop-offs at every step.' },
          { ic: '⟳', t: 'Retention cohorts', d: 'Weekly and monthly cohorts with revenue + active retention.' },
          { ic: '◈', t: 'Product usage', d: 'Codes created, scans, top templates, feature adoption.' },
        ].map((r, i) => (
          <div key={i} style={{ padding: '22px 24px', borderRight: i < 3 ? '1px solid var(--rule)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 32, height: 32, border: '1.5px solid var(--ink)', display: 'grid', placeItems: 'center', marginBottom: 14, fontFamily: 'var(--serif)', fontSize: 18 }}>{r.ic}</div>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{r.t}</h4>
            <p style={{ color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.4 }}>{r.d}</p>
            <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Open → 
            </div>
          </div>
        ))}
      </div>

      {/* Period selector */}
      <div className="row-flex" style={{ marginBottom: 20 }}>
        <div className="mono-tiny" style={{ flex: 1 }}>SHOWING · REVENUE WATERFALL</div>
        <div style={{ display: 'flex', border: '1.5px solid var(--ink)' }}>
          {['7d', '30d', '90d', 'YTD', '12mo'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '7px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', background: period === p ? 'var(--ink)' : 'var(--paper)', color: period === p ? 'var(--paper)' : 'var(--ink)', cursor: 'pointer', borderRight: '1px solid var(--rule)' }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Headline chart */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <div>
            <h3>Revenue <span className="it">waterfall</span></h3>
            <div className="pn-tag" style={{ marginTop: 4 }}>How €42.9K became €48.3K — composition of MRR change</div>
          </div>
        </div>
        <div className="pn-body">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, height: 220, paddingBottom: 30, borderBottom: '1.5px solid var(--ink)', position: 'relative' }}>
            {[
              { label: 'Start MRR', v: 42910, type: 'base' },
              { label: 'New', v: 6840, type: 'pos' },
              { label: 'Expansion', v: 2120, type: 'pos' },
              { label: 'Reactivation', v: 480, type: 'pos' },
              { label: 'Contraction', v: -1240, type: 'neg' },
              { label: 'Churn', v: -2830, type: 'neg' },
              { label: 'End MRR', v: 48280, type: 'base' },
            ].map((b, i, arr) => {
              const max = 50000;
              const isBase = b.type === 'base';
              const h = (Math.abs(b.v) / max) * 100;
              const color = b.type === 'pos' ? 'var(--accent-2)' : b.type === 'neg' ? 'var(--accent)' : 'var(--ink)';
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', position: 'relative', height: '100%' }}>
                  <div style={{ position: 'absolute', top: -22, fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500, fontVariationSettings: '"SOFT" 100' }}>
                    {b.type === 'pos' ? '+' : b.type === 'neg' ? '–' : ''}€{(Math.abs(b.v) / 1000).toFixed(1)}K
                  </div>
                  <div style={{ width: '70%', height: isBase ? h + '%' : (h * 0.6) + '%', background: color, position: 'relative' }}>
                    {!isBase && (
                      <div style={{ position: 'absolute', top: '50%', left: '100%', width: '60%', height: 1, background: 'var(--ink-mute)', borderTop: '1px dashed var(--ink-mute)' }} />
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: -24, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{b.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel & cohorts */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Acquisition <span className="it">funnel</span></h3>
            <span className="pn-tag">Last 30 days</span>
          </div>
          <div className="pn-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Visitors', v: 124820, pct: 100, conv: '—' },
              { label: 'Signed Up', v: 8420, pct: 6.7, conv: '6.7%' },
              { label: 'Created Code', v: 6940, pct: 5.6, conv: '82.4%' },
              { label: 'Started Trial', v: 2840, pct: 2.3, conv: '40.9%' },
              { label: 'Paid Subscriber', v: 1824, pct: 1.5, conv: '64.2%' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 70px 60px', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--rule-soft)' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                <div style={{ position: 'relative', height: 28, background: 'var(--paper-3)' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: s.pct + '%', background: i === 0 ? 'var(--ink)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: 'var(--paper)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em' }}>
                    {fmt.int(s.v)}
                  </div>
                </div>
                <span className="mono-tiny" style={{ textAlign: 'right', textTransform: 'none', letterSpacing: 0 }}>{s.pct}%</span>
                <span className="mono-tiny" style={{ textAlign: 'right', textTransform: 'none', letterSpacing: 0, color: 'var(--accent-2)' }}>{s.conv}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Monthly <span className="it">cohorts</span></h3>
            <span className="pn-tag">Active retention · last 6 mo</span>
          </div>
          <div className="pn-body">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 10 }}>
              <thead>
                <tr style={{ color: 'var(--ink-mute)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', borderBottom: '1.5px solid var(--ink)' }}>Cohort</th>
                  {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map(m => (
                    <th key={m} style={{ textAlign: 'center', padding: '8px 6px', borderBottom: '1.5px solid var(--ink)' }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: 'Dec', size: 1420, ret: [100, 84, 72, 68, 64, 62] },
                  { c: 'Jan', size: 1680, ret: [100, 86, 76, 70, 66, null] },
                  { c: 'Feb', size: 1840, ret: [100, 88, 78, 72, null, null] },
                  { c: 'Mar', size: 2120, ret: [100, 89, 80, null, null, null] },
                  { c: 'Apr', size: 2340, ret: [100, 90, null, null, null, null] },
                  { c: 'May', size: 2680, ret: [100, null, null, null, null, null] },
                ].map(r => (
                  <tr key={r.c}>
                    <td style={{ padding: '8px 6px', borderBottom: '1px solid var(--rule-soft)', fontFamily: 'var(--serif)', fontSize: 12 }}>
                      <b>{r.c} '26</b> <span style={{ color: 'var(--ink-mute)' }}>· {fmt.int(r.size)}</span>
                    </td>
                    {r.ret.map((v, i) => (
                      <td key={i} style={{ padding: 0, borderBottom: '1px solid var(--rule-soft)', textAlign: 'center' }}>
                        {v != null ? (
                          <div style={{
                            background: `rgba(194, 65, 12, ${v / 100 * 0.9 + 0.05})`,
                            color: v > 70 ? 'var(--paper)' : 'var(--ink)',
                            padding: '10px 0',
                            fontFamily: 'var(--mono)',
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                          }}>
                            {v}%
                          </div>
                        ) : (
                          <div style={{ padding: '10px 0', background: 'var(--paper-2)', color: 'var(--ink-mute)' }}>—</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top templates + Devices */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Top <span className="it">templates</span></h3>
            <span className="pn-tag">By active codes · 30d</span>
          </div>
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>Template</th>
                <th>Active Codes</th>
                <th>Scans</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Identity · Editorial', 12420, 482910, [20, 24, 30, 28, 34, 38, 44, 48, 52, 58, 64]],
                ['Menu · Bistro', 8420, 384210, [40, 38, 42, 44, 40, 48, 52, 50, 58, 62, 66]],
                ['CV · Compact', 5240, 184820, [10, 12, 14, 18, 22, 28, 32, 38, 44, 50, 58]],
                ['Loyalty · Punch', 3120, 124810, [22, 24, 22, 28, 30, 28, 34, 38, 42, 46, 52]],
                ['Gallery · Portfolio', 2840, 98420, [18, 22, 20, 24, 28, 26, 30, 34, 38, 42, 48]],
              ].map((r, i) => (
                <tr key={i}>
                  <td><b style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{r[0]}</b></td>
                  <td className="num">{fmt.int(r[1])}</td>
                  <td className="num">{fmt.int(r[2])}</td>
                  <td style={{ width: 140 }}><Sparkline pts={r[3]} accent /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Scanning <span className="it">devices</span></h3>
            <span className="pn-tag">Last 30 days</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24 }}>
              <Donut value={68} total={100} label="iOS" />
              <Donut value={28} total={100} label="Android" color="var(--ink)" />
              <Donut value={4} total={100} label="Other" color="var(--gold)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--rule)' }}>
              {[
                ['iPhone Safari', '54.2%'],
                ['iPhone Camera app', '13.8%'],
                ['Android Chrome', '22.1%'],
                ['Android Camera', '5.9%'],
                ['Other Mobile', '2.4%'],
                ['Desktop', '1.6%'],
              ].map(([n, p], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--rule-soft)' : 'none', fontFamily: 'var(--serif)', fontSize: 13 }}>
                  <span>{n}</span>
                  <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Reports = Reports;
