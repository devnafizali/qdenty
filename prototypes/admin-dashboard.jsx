/* ============ Dashboard — overview ============ */

function AdminDashboard() {
  const m = adminState.metrics;
  const series = adminState.revenueSeries;

  return (
    <div className="adm-page">
      <PageHead
        tag="01 · Overview"
        title={<>Hello, <span className="it">Adelaide</span>. The business is healthy.</>}
        sub="Realtime snapshot of qdenty operations — revenue, accounts, codes, and anything ops needs to look at today."
        actions={
          <>
            <button className="adm-btn ghost"><span>Last 30 days</span><span style={{ opacity: 0.5 }}>▾</span></button>
            <button className="adm-btn">Export</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('Daily report queued for delivery')}>Generate Report</button>
          </>
        }
      />

      {/* Alerts strip */}
      <div className="alerts-row">
        <div className="alert urgent">
          <div className="a-ico">!</div>
          <div className="a-body">
            <h4>12 failed transactions need review</h4>
            <p>Auto-retry scheduled. 4 cards permanently declined and entered dunning — manual reach-out recommended.</p>
            <a className="a-cta" onClick={() => adminGo('transactions')}>Review queue</a>
          </div>
        </div>
        <div className="alert gold">
          <div className="a-ico">◆</div>
          <div className="a-body">
            <h4>VAT MOSS quarter ends in 8 days</h4>
            <p>Q2 2026 export is paused. Resume the automation or generate manually from Accounting.</p>
            <a className="a-cta" onClick={() => adminGo('accounting')}>Open accounting</a>
          </div>
        </div>
        <div className="alert green">
          <div className="a-ico">✓</div>
          <div className="a-body">
            <h4>MRR crossed €48K — a record</h4>
            <p>+12.5% versus last month. 38 of 142 trial-to-annual offers accepted this cycle.</p>
            <a className="a-cta" onClick={() => adminGo('reports')}>See report</a>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI
          label="Monthly Recurring Revenue"
          value={fmt.int(m.mrr)}
          currency="€"
          delta={fmt.pct(m.mrr, m.mrrPrev)}
          deltaDir="up"
          foot="vs. last month"
          icon={<svg viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.6"><path d="M3 11 L7 7 L9 9 L13 4" /><path d="M9 4 L13 4 L13 8" /></svg>}
        />
        <KPI
          label="Active Users"
          value={fmt.int(m.activeUsers)}
          delta={fmt.pct(m.users, m.usersPrev)}
          deltaDir="up"
          foot={fmt.int(m.users) + ' total'}
          icon={<svg viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.6"><circle cx="6" cy="5" r="2.4" /><path d="M2 14 Q6 9 10 14" /></svg>}
        />
        <KPI
          label="Codes Created"
          value={fmt.int(m.codes)}
          delta={fmt.pct(m.codes, m.codesPrev)}
          deltaDir="up"
          foot="124.8K total"
          icon={<svg viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.6"><rect x="1.5" y="1.5" width="5" height="5" /><rect x="9.5" y="1.5" width="5" height="5" /><rect x="1.5" y="9.5" width="5" height="5" /><rect x="9.5" y="9.5" width="5" height="5" /></svg>}
        />
        <KPI
          label="Scans · 30d"
          value={(m.scans30d / 1000).toFixed(1) + 'K'}
          delta={fmt.pct(m.scans30d, m.scans30dPrev)}
          deltaDir="up"
          foot="42% from Portugal"
          icon={<svg viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.6"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="3" /><circle cx="8" cy="8" r="0.5" fill="currentColor" /></svg>}
        />
      </div>

      {/* Revenue chart + Plan mix */}
      <div className="adm-grid">
        <div className="panel">
          <div className="pn-head">
            <div>
              <h3>Revenue <span className="it">trend</span></h3>
              <div className="pn-tag" style={{ marginTop: 4 }}>Gross vs net · last 30 days</div>
            </div>
            <div className="pn-tabs">
              <button>7d</button>
              <button className="on">30d</button>
              <button>90d</button>
              <button>YTD</button>
            </div>
          </div>
          <div className="chart-frame">
            <div className="chart-legend">
              <div className="lg-item"><span className="sw"></span><span>Gross revenue</span></div>
              <div className="lg-item"><span className="sw outline"></span><span>Net (after fees)</span></div>
            </div>
            <LineChart
              data={series}
              keys={['v', 'n']}
              colors={['var(--ink)', 'var(--accent)']}
              dashed={[false, true]}
            />
            <div className="chart-axis-x">
              {series.filter((_, i) => i % 2 === 0).map(d => <span key={d.d}>{d.d.toUpperCase()}</span>)}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Plan <span className="it">mix</span></h3>
            <span className="pn-tag">By MRR</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <Donut value={24840} total={48280} label="Pro share" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {adminState.plans.map(p => {
                const pct = (p.mrr / 48280) * 100;
                const colors = { starter: 'var(--ink-mute)', pro: 'var(--accent)', atelier: 'var(--gold)', enterprise: 'var(--accent-2)' };
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 70px', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    <div className="mini-bar" style={{ '--w': pct + '%', background: 'var(--paper-3)' }}>
                      <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: colors[p.id], width: pct + '%' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, textAlign: 'right', color: 'var(--ink)' }}>
                      €{(p.mrr / 1000).toFixed(1)}K
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Geography + Activity feed */}
      <div className="adm-grid r-narrow">
        <div className="panel">
          <div className="pn-head">
            <div>
              <h3>Where <span className="it">scans</span> happen</h3>
              <div className="pn-tag" style={{ marginTop: 4 }}>Top 10 countries · last 30 days</div>
            </div>
            <a className="all" onClick={() => adminGo('reports')}>View full atlas</a>
          </div>
          <div className="pn-body">
            <div className="world-map">
              <div className="grid-dots" />
              {adminState.countries.slice(0, 7).map((c, i) => (
                <div
                  key={c.code}
                  className={'marker ' + (i < 2 ? 'lg' : i > 4 ? 'sm' : '')}
                  style={{ left: c.x + '%', top: c.y + '%' }}
                >
                  {i < 3 && <span className="lbl">{c.code} · {fmt.int(c.users)} users</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderTop: '1px solid var(--rule)' }}>
              {adminState.countries.slice(0, 5).map(c => (
                <div key={c.code} style={{ padding: '14px 16px', borderRight: '1px solid var(--rule-soft)' }}>
                  <div className="mono-tiny">{c.c}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, lineHeight: 1, marginTop: 6 }}>{fmt.int(c.users)}</div>
                  <div className="mono-tiny" style={{ marginTop: 4, color: 'var(--accent-2)' }}>{fmt.money(c.mrr)} MRR</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Live <span className="it">activity</span></h3>
            <span className="pn-tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-soft 1.6s infinite' }} />
              LIVE
            </span>
          </div>
          <div className="pn-body flush">
            <div className="feed">
              {adminState.activity.map((a, i) => (
                <div key={i} className="feed-item">
                  <div className={'f-ico ' + a.color}>{
                    a.kind === 'signup' ? '+' :
                    a.kind === 'payment' ? '€' :
                    a.kind === 'refund' ? '↩' :
                    a.kind === 'churn' ? '↓' :
                    a.kind === 'flagged' ? '!' :
                    a.kind === 'webhook' ? '◇' :
                    a.kind === 'upgrade' ? '↑' :
                    a.kind === 'gw' ? '◈' : '·'
                  }</div>
                  <div className="f-body">
                    <div className="f-msg"><b>{a.who}</b> {a.what}</div>
                    <div className="f-sub">{a.tag}</div>
                  </div>
                  <div className="f-time">{a.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <h3>Recent <span className="it">transactions</span></h3>
          <a className="all" onClick={() => adminGo('transactions')}>Open ledger</a>
        </div>
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>User</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Net</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {adminState.transactions.slice(0, 6).map(t => (
              <tr key={t.id}>
                <td className="mono">{t.id}</td>
                <td>
                  <div className="row-link">
                    <div className="stack">
                      <b>{t.user}</b>
                      <span className="sub">{t.desc}</span>
                    </div>
                  </div>
                </td>
                <td className="mono">{t.method}</td>
                <td className="amount" style={t.amount < 0 ? { color: 'var(--accent)' } : {}}>
                  <span className="curr">€</span>{Math.abs(t.amount).toFixed(2)}
                </td>
                <td className="amount" style={{ color: 'var(--ink-soft)' }}>
                  <span className="curr">€</span>{Math.abs(t.net).toFixed(2)}
                </td>
                <td><StatusPill status={t.status} /></td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer KPI strip */}
      <div className="kpi-grid">
        <KPI
          label="Churn (MRR-weighted)"
          value={m.churn.toFixed(1)}
          unit="%"
          delta={(m.churn - m.churnPrev).toFixed(1) + 'pp'}
          deltaDir="up"
          foot={'vs. ' + m.churnPrev + '% last month'}
        />
        <KPI
          label="Avg revenue / user"
          value={'26.10'}
          currency="€"
          delta="+€1.20"
          deltaDir="up"
          foot="ARPU · 30d"
        />
        <KPI
          label="Pending payouts"
          value={fmt.int(m.pendingPayouts)}
          currency="€"
          foot="Next: tomorrow 09:00 UTC"
        />
        <KPI
          label="Refunds · 30d"
          value={fmt.int(m.refunds30d)}
          currency="€"
          delta="2.1%"
          deltaDir="up"
          foot="of gross revenue"
        />
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
