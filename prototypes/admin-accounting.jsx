/* ============ Accounting — P&L, tax, payouts ============ */

function Accounting() {
  return (
    <div className="adm-page">
      <PageHead
        tag="07 · Business"
        title={<>Books, <span className="it">taxes,</span> and payouts.</>}
        sub="Full accounting view — revenue recognition, VAT MOSS, gateway reconciliation, and where the money is sitting right now. Export to your bookkeeper."
        actions={
          <>
            <button className="adm-btn ghost">Connect Xero</button>
            <button className="adm-btn ghost">Sync QuickBooks</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('VAT MOSS report generated · Q2 2026')}>Generate VAT MOSS</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="Revenue · YTD" value="241,820" currency="€" delta="+38.2%" foot="vs. last year" />
        <KPI label="Gross Margin" value="84.2" unit="%" delta="+1.4pp" foot="after gateway fees" />
        <KPI label="VAT Collected · Q2" value="9,420" currency="€" foot="PT 23% · DE 19% · …" />
        <KPI label="In Transit · Payouts" value="12,480" currency="€" foot="lands tomorrow" />
      </div>

      {/* P&L snapshot */}
      <div className="adm-grid r-narrow">
        <div className="panel">
          <div className="pn-head">
            <div>
              <h3>P&L <span className="it">snapshot</span></h3>
              <div className="pn-tag" style={{ marginTop: 4 }}>Month-to-date · cash basis · €</div>
            </div>
            <div className="pn-tabs">
              <button>MTD</button>
              <button className="on">QTD</button>
              <button>YTD</button>
              <button>2025</button>
            </div>
          </div>
          <table className="adm-tbl">
            <tbody>
              {[
                { l: 'Subscription revenue', v: 142820, type: 'rev', bold: true },
                { l: '  — Starter plan', v: 28420, type: 'rev' },
                { l: '  — Professional plan', v: 84210, type: 'rev' },
                { l: '  — Atelier plan', v: 26890, type: 'rev' },
                { l: '  — Enterprise', v: 3300, type: 'rev' },
                { l: 'One-time fees · prepays', v: 18420, type: 'rev' },
                { l: 'Refunds issued', v: -3240, type: 'cost' },
                { l: 'Gross Revenue', v: 158000, type: 'sub', bold: true },
                { l: 'Payment processing fees', v: -4820, type: 'cost' },
                { l: 'Hosting & infra (AWS, Cloudflare)', v: -8420, type: 'cost' },
                { l: 'Net Revenue', v: 144760, type: 'sub', bold: true },
                { l: 'Salaries (engineering)', v: -42000, type: 'cost' },
                { l: 'Salaries (ops + support)', v: -18000, type: 'cost' },
                { l: 'Marketing & growth', v: -12420, type: 'cost' },
                { l: 'Tools & SaaS', v: -3840, type: 'cost' },
                { l: 'Operating Income', v: 68500, type: 'final', bold: true },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--serif)', fontWeight: r.bold ? 500 : 400, fontSize: r.bold ? 15 : 13, paddingLeft: r.l.startsWith('  —') ? 32 : 18, color: r.type === 'sub' || r.type === 'final' ? 'var(--ink)' : 'var(--ink-soft)', background: r.type === 'sub' ? 'var(--paper-2)' : r.type === 'final' ? 'var(--ink)' : 'transparent', borderTop: r.type === 'sub' || r.type === 'final' ? '1.5px solid var(--ink)' : '1px solid var(--rule-soft)', borderBottom: 'none' }}>
                    <span style={{ color: r.type === 'final' ? 'var(--paper)' : 'inherit' }}>{r.l.trim()}</span>
                  </td>
                  <td className="amount r" style={{ background: r.type === 'sub' ? 'var(--paper-2)' : r.type === 'final' ? 'var(--ink)' : 'transparent', borderTop: r.type === 'sub' || r.type === 'final' ? '1.5px solid var(--ink)' : '1px solid var(--rule-soft)', borderBottom: 'none', color: r.type === 'final' ? 'var(--paper)' : r.v < 0 ? 'var(--accent)' : 'var(--ink)' }}>
                    {r.v < 0 ? '–' : ''}<span className="curr">€</span>{Math.abs(r.v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel dark">
          <div className="pn-head">
            <h3>Cash <span className="it">position</span></h3>
            <span className="pn-tag" style={{ color: 'rgba(243,239,231,0.6)' }}>RIGHT NOW</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                ['Operating · Wise EUR', 184320, 'Primary'],
                ['Reserve · Revolut EUR', 84210, '6 mo runway'],
                ['Tax · ringfenced', 28420, 'For Q2 VAT'],
                ['Stripe pending', 12480, 'T+2'],
                ['PayPal pending', 1820, 'T+1'],
              ].map(([label, amt, sub], i, arr) => (
                <div key={i} style={{ paddingBottom: 14, borderBottom: i < arr.length - 1 ? '1px solid rgba(243,239,231,0.12)' : 'none' }}>
                  <div className="mono-tiny" style={{ color: 'rgba(243,239,231,0.6)' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 500, fontVariationSettings: '"SOFT" 100', marginTop: 4, color: 'var(--paper)' }}>
                    <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 16, color: 'rgba(243,239,231,0.6)' }}>€</span>
                    {fmt.int(amt)}
                  </div>
                  <div className="mono-tiny" style={{ color: 'rgba(243,239,231,0.5)', marginTop: 4 }}>{sub}</div>
                </div>
              ))}
              <div style={{ paddingTop: 4 }}>
                <div className="mono-tiny" style={{ color: 'var(--accent)' }}>TOTAL POSITION</div>
                <div className="lg-num" style={{ color: 'var(--paper)', marginTop: 6 }}>
                  <span className="curr">€</span>311,250
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VAT MOSS table */}
      <div className="panel" style={{ marginBottom: 24, marginTop: 24 }}>
        <div className="pn-head">
          <div>
            <h3>VAT MOSS · <span className="it">Q2 2026</span></h3>
            <div className="pn-tag" style={{ marginTop: 4 }}>EU one-stop-shop · auto-calculated from invoices</div>
          </div>
          <div className="row-flex">
            <span className="pill green no-dot">11 of 27 countries</span>
            <button className="adm-btn sm" onClick={() => showAdmToast('Filed to PT MOSS portal')}>File return</button>
          </div>
        </div>
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Country</th>
              <th>VAT Rate</th>
              <th>Net Sales</th>
              <th>VAT Due</th>
              <th>Tx Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Portugal', 'PT', 23, 18420, 12420, 482],
              ['Germany', 'DE', 19, 12840, 6240, 218],
              ['France', 'FR', 20, 11240, 5840, 184],
              ['Spain', 'ES', 21, 8920, 4920, 142],
              ['Italy', 'IT', 22, 5240, 3120, 84],
              ['Netherlands', 'NL', 21, 2120, 1280, 38],
              ['Belgium', 'BE', 21, 1840, 1120, 32],
              ['Austria', 'AT', 20, 1420, 880, 28],
              ['Ireland', 'IE', 23, 920, 642, 18],
              ['Sweden', 'SE', 25, 820, 524, 14],
              ['Finland', 'FI', 24, 480, 312, 8],
            ].map((r, i) => (
              <tr key={i}>
                <td><b style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{r[0]}</b> <span className="mono-tiny" style={{ marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>{r[1]}</span></td>
                <td className="num">{r[2]}%</td>
                <td className="amount"><span className="curr">€</span>{fmt.int(r[3])}</td>
                <td className="amount" style={{ color: 'var(--accent)' }}><span className="curr">€</span>{fmt.int(r[4])}</td>
                <td className="num">{r[5]}</td>
                <td><StatusPill status="pending" /></td>
              </tr>
            ))}
            <tr style={{ background: 'var(--paper-2)' }}>
              <td colSpan="3" style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500, padding: '14px 18px', borderTop: '1.5px solid var(--ink)' }}>Total VAT due · Q2 2026</td>
              <td className="amount" style={{ borderTop: '1.5px solid var(--ink)', fontSize: 18 }}><span className="curr">€</span>37,300</td>
              <td colSpan="2" style={{ borderTop: '1.5px solid var(--ink)' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Reconciliation */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Payout <span className="it">schedule</span></h3>
            <span className="pn-tag">Auto-disbursements</span>
          </div>
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['2026-05-24', 'Stripe → Wise EUR', 12480, 'pending'],
                ['2026-05-23', 'Stripe → Wise EUR', 14820, 'paid'],
                ['2026-05-22', 'PayPal → Wise EUR', 1840, 'paid'],
                ['2026-05-21', 'Stripe → Wise EUR', 16420, 'paid'],
                ['2026-05-20', 'Stripe → Wise EUR', 13280, 'paid'],
                ['2026-05-19', 'PayPal → Wise EUR', 2140, 'paid'],
              ].map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ color: i === 0 ? 'var(--ink)' : 'var(--ink-mute)' }}>{r[0]}</td>
                  <td style={{ fontFamily: 'var(--serif)', fontSize: 13 }}>{r[1]}</td>
                  <td className="amount"><span className="curr">€</span>{fmt.int(r[2])}</td>
                  <td><StatusPill status={r[3]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Reconciliation <span className="it">status</span></h3>
            <span className="pill green no-dot">All matched</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Stripe', 'May 22', '€14,820', '482 tx', true],
                ['Stripe SEPA', 'May 22', '€3,840', '142 tx', true],
                ['PayPal', 'May 22', '€1,840', '38 tx', true],
                ['Wise Inbound', 'May 22', '€20,500', '8 deposits', true],
                ['Bank statement', 'May 22', '€20,500', 'matched', true],
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 80px 110px 1fr auto', gap: 14, padding: '12px 0', borderBottom: i < 4 ? '1px solid var(--rule)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{r[0]}</span>
                  <span className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{r[1]}</span>
                  <span className="amount"><span className="curr">€</span>{r[2].replace('€', '')}</span>
                  <span className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{r[3]}</span>
                  <span style={{ color: 'var(--accent-2)', fontFamily: 'var(--mono)', fontSize: 14 }}>✓</span>
                </div>
              ))}
            </div>
            <div className="spacer-md" />
            <button className="adm-btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showAdmToast('Re-reconciling all sources…')}>
              Force re-reconcile all sources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Accounting = Accounting;
