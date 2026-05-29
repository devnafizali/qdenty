/* ============ Transactions — ledger ============ */

function Transactions() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [gwFilter, setGwFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const tx = adminState.transactions;
  const filtered = tx.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (gwFilter !== 'all' && !t.gw.toLowerCase().includes(gwFilter)) return false;
    if (search && !(t.id + t.user + t.email + t.desc).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const gross = tx.filter(t => t.status === 'settled').reduce((s, t) => s + t.amount, 0);
  const fees = tx.filter(t => t.status === 'settled').reduce((s, t) => s + t.fee, 0);
  const net = gross - fees;
  const refunded = Math.abs(tx.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0));

  return (
    <div className="adm-page">
      <PageHead
        tag="05 · Business"
        title={<>The <span className="it">ledger.</span></>}
        sub="Every payment, refund, dispute, and trial event that's touched the platform. Reconciliable against gateway statements, exportable to your accountant."
        actions={
          <>
            <button className="adm-btn ghost">Export CSV</button>
            <button className="adm-btn ghost">Export QuickBooks</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('Manual entry started')}>+ Manual Entry</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="Gross Volume · 30d" value={fmt.int(gross.toFixed(0))} currency="€" delta="+18.2%" foot={tx.length + ' transactions'} />
        <KPI label="Net (after fees)" value={fmt.int(net.toFixed(0))} currency="€" foot={'€' + fees.toFixed(2) + ' in fees'} />
        <KPI label="Refunded" value={refunded.toFixed(2)} currency="€" deltaDir="dn" delta="0.4%" foot="of gross" />
        <KPI label="Failed · Awaiting Retry" value="12" deltaDir="dn" delta="3 in dunning" foot="€348 at risk" />
      </div>

      <div className="panel">
        <div className="pn-head">
          <h3>All <span className="it">transactions</span></h3>
          <div className="row-flex">
            <span className="mono-tiny">RECONCILED THROUGH 2026-05-22</span>
          </div>
        </div>

        <div className="tbl-filters">
          {[
            ['all', 'All'],
            ['settled', 'Settled'],
            ['failed', 'Failed'],
            ['refunded', 'Refunded'],
            ['trial', 'Trial'],
          ].map(([k, l]) => (
            <button key={k} className={'chip-sel ' + (filter === k ? 'on' : '')} onClick={() => setFilter(k)}>{l}</button>
          ))}
          <span style={{ width: 1, height: 18, background: 'var(--rule)' }} />
          {[
            ['all', 'Any Gateway'],
            ['stripe', 'Stripe'],
            ['paypal', 'PayPal'],
            ['sepa', 'SEPA'],
          ].map(([k, l]) => (
            <button key={'g' + k} className={'chip-sel ' + (gwFilter === k ? 'on' : '')} onClick={() => setGwFilter(k)}>{l}</button>
          ))}
          <div className="tf-spacer" />
          <input className="tf-search" placeholder="Search ID, user, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Customer</th>
              <th>Method · Gateway</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Net</th>
              <th>Status</th>
              <th>When</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} onClick={() => setSelected(t)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="row-link">
                    <div className="stack">
                      <b className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500 }}>{t.id}</b>
                      <span className="sub">{t.desc}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <b style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{t.user}</b>
                    <span className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{t.email}</span>
                  </div>
                </td>
                <td>
                  <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="mono" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.method}</span>
                    <span className="mono-tiny">via {t.gw}</span>
                  </div>
                </td>
                <td className="amount" style={t.amount < 0 ? { color: 'var(--accent)' } : {}}>
                  {t.amount < 0 ? '–' : ''}<span className="curr">€</span>{Math.abs(t.amount).toFixed(2)}
                </td>
                <td className="num" style={{ color: 'var(--ink-mute)' }}>{t.fee === 0 ? '—' : '€' + Math.abs(t.fee).toFixed(2)}</td>
                <td className="amount" style={{ color: 'var(--ink-soft)' }}>
                  {t.net < 0 ? '–' : ''}<span className="curr">€</span>{Math.abs(t.net).toFixed(2)}
                </td>
                <td><StatusPill status={t.status} /></td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>{t.date}</td>
                <td className="r" onClick={e => e.stopPropagation()}><button className="row-menu">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="adm-page-bar">
          <span>{filtered.length} transactions · €{filtered.filter(t => t.status === 'settled').reduce((s, t) => s + t.amount, 0).toFixed(2)} gross</span>
          <div className="pgs">
            <button disabled>‹</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <button>›</button>
          </div>
          <span>Page 1 of 1,284</span>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="adm-drawer-bd" onClick={() => setSelected(null)} />
          <aside className="adm-drawer">
            <div className="d-head">
              <div>
                <h3>Transaction <span className="it">detail</span></h3>
                <div className="ds">{selected.id}</div>
              </div>
              <button className="adm-btn ghost sm" onClick={() => setSelected(null)}>Close ✕</button>
            </div>
            <div className="d-body">
              <div style={{ padding: '10px 0 22px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span className="lg-num"><span className="curr">€</span>{Math.abs(selected.amount).toFixed(2)}</span>
                <StatusPill status={selected.status} />
              </div>

              <div className="dl" style={{ marginTop: 22 }}>
                <div className="row">Description</div>
                <div className="row v">{selected.desc}</div>
                <div className="row">Customer</div>
                <div className="row v">{selected.user}</div>
                <div className="row">Email</div>
                <div className="row v mono">{selected.email}</div>
                <div className="row">Method</div>
                <div className="row v mono">{selected.method}</div>
                <div className="row">Gateway</div>
                <div className="row v">{selected.gw}</div>
                <div className="row">Gross</div>
                <div className="row v">€{Math.abs(selected.amount).toFixed(2)}</div>
                <div className="row">Fee</div>
                <div className="row v">€{Math.abs(selected.fee).toFixed(2)}</div>
                <div className="row">Net</div>
                <div className="row v">€{Math.abs(selected.net).toFixed(2)}</div>
                <div className="row">Date</div>
                <div className="row v mono">{selected.date}</div>
              </div>

              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginTop: 28, marginBottom: 12 }}>
                Gateway response
              </h4>
              <div className="code-block">
                <button className="copy" onClick={() => showAdmToast('Copied')}>Copy</button>
{`{
  `}<span className="k">"id"</span>{`: `}<span className="s">"{selected.id}"</span>{`,
  `}<span className="k">"object"</span>{`: `}<span className="s">"charge"</span>{`,
  `}<span className="k">"status"</span>{`: `}<span className="s">"{selected.status}"</span>{`,
  `}<span className="k">"amount"</span>{`: ${Math.round(Math.abs(selected.amount) * 100)},
  `}<span className="k">"currency"</span>{`: `}<span className="s">"eur"</span>{`,
  `}<span className="k">"paid"</span>{`: ${selected.status === 'settled' || selected.status === 'refunded'},
  `}<span className="c">// gateway: {selected.gw}</span>{`
}`}
              </div>
            </div>
            <div className="d-foot">
              {selected.status === 'settled' && <button className="adm-btn ghost danger" onClick={() => showAdmToast('Refund issued')}>Refund</button>}
              {selected.status === 'failed' && <button className="adm-btn ghost" onClick={() => showAdmToast('Retry queued')}>Retry charge</button>}
              <button className="adm-btn ghost">Download receipt</button>
              <button className="adm-btn pri">View customer</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

window.Transactions = Transactions;
