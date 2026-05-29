/* ============ Billing — subscriptions & invoices ============ */

function Billing() {
  const [tab, setTab] = useState('subs');

  return (
    <div className="adm-page">
      <PageHead
        tag="04 · Business"
        title={<>Subscriptions & <span className="it">billing.</span></>}
        sub="Plans, invoices, dunning, proration, and the rules that move money. Every active subscription rolls up to the MRR and ARR numbers above."
        actions={
          <>
            <button className="adm-btn ghost">Tax settings</button>
            <button className="adm-btn ghost">Invoice templates</button>
            <button className="adm-btn pri">+ Create Plan</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="MRR" value={fmt.int(48280)} currency="€" delta="+12.5%" foot="ARR €579.4K" />
        <KPI label="Active Subscriptions" value="12,790" delta="+218" foot="this month" />
        <KPI label="Trial → Paid" value="64.2" unit="%" delta="+3.1pp" foot="14-day conversion" />
        <KPI label="Failed · Recoverable" value="48" deltaDir="dn" delta="–12 vs week" foot="in dunning" />
      </div>

      {/* Plans table */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <h3>Pricing <span className="it">plans</span></h3>
          <div className="pn-tabs">
            <button className="on">All</button>
            <button>Public</button>
            <button>Custom</button>
            <button>Archived</button>
          </div>
        </div>
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price · Month</th>
              <th>Price · Year</th>
              <th>Active Subs</th>
              <th>MRR Contribution</th>
              <th>Churn</th>
              <th>Visibility</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adminState.plans.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="row-link">
                    <div style={{ width: 34, height: 34, border: '1.5px solid var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 14, background: p.id === 'pro' ? 'var(--ink)' : 'var(--paper)', color: p.id === 'pro' ? 'var(--paper)' : 'var(--ink)' }}>
                      {p.name[0]}
                    </div>
                    <div className="stack">
                      <b>{p.name}</b>
                      <span className="sub">{p.id === 'starter' ? 'Hobby & casual' : p.id === 'pro' ? 'Most popular' : p.id === 'atelier' ? 'Power users · agencies' : 'Custom contracts'}</span>
                    </div>
                  </div>
                </td>
                <td className="amount">
                  {typeof p.price === 'number' ? <><span className="curr">€</span>{p.price}</> : <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', color: 'var(--ink-mute)' }}>{p.price}</span>}
                </td>
                <td className="amount" style={{ color: 'var(--ink-mute)' }}>
                  {typeof p.price === 'number' ? <><span className="curr">€</span>{(p.price * 10).toFixed(0)}</> : '—'}
                </td>
                <td className="num">{fmt.int(p.users)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="amount" style={{ minWidth: 80 }}><span className="curr">€</span>{fmt.int(p.mrr)}</span>
                    <div className="mini-bar accent" style={{ '--w': ((p.mrr / 48280) * 100) + '%', minWidth: 60 }} />
                  </div>
                </td>
                <td className="num">{p.churn.toFixed(1)}%</td>
                <td>
                  <span className={'pill no-dot ' + (p.id === 'enterprise' ? 'gray' : 'green')}>
                    {p.id === 'enterprise' ? 'Hidden · Sales' : 'Public'}
                  </span>
                </td>
                <td className="r"><button className="row-menu">⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoices */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <div>
            <h3>Recent <span className="it">invoices</span></h3>
            <div className="pn-tag" style={{ marginTop: 4 }}>Generated automatically · sent via email + portal</div>
          </div>
          <div className="pn-tabs">
            <button className={tab === 'subs' ? 'on' : ''} onClick={() => setTab('subs')}>All</button>
            <button className={tab === 'paid' ? 'on' : ''} onClick={() => setTab('paid')}>Paid</button>
            <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Open</button>
            <button className={tab === 'overdue' ? 'on' : ''} onClick={() => setTab('overdue')}>Overdue</button>
            <button className={tab === 'draft' ? 'on' : ''} onClick={() => setTab('draft')}>Draft</button>
          </div>
        </div>
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>VAT</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adminState.invoices.filter(i => tab === 'subs' || i.status === tab).map(i => (
              <tr key={i.id}>
                <td className="mono"><b style={{ color: 'var(--ink)' }}>{i.id}</b></td>
                <td>{i.user}</td>
                <td className="amount"><span className="curr">€</span>{i.amount.toFixed(2)}</td>
                <td className="num" style={{ color: 'var(--ink-mute)' }}>€{(i.amount * 0.23).toFixed(2)} <span style={{ fontSize: 9 }}>PT 23%</span></td>
                <td><StatusPill status={i.status} /></td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>{i.date}</td>
                <td className="mono" style={{ color: i.status === 'overdue' ? '#b91c1c' : 'var(--ink-mute)' }}>{i.due}</td>
                <td className="r">
                  <button className="adm-btn sm ghost" onClick={() => showAdmToast('Invoice ' + i.id + ' downloaded')}>PDF ↓</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dunning & coupons */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Dunning <span className="it">policy</span></h3>
            <span className="pn-tag">Recovery automation</span>
          </div>
          <div className="pn-body">
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>
              Failed payments retry on these days with email reminders. After day 14 the subscription pauses; after day 30 it cancels and the account drops to free tier.
            </p>
            <div className="flow">
              <div className="node trigger">
                <div className="nlbl">Trigger</div>
                <div className="ntitle">Payment fails</div>
              </div>
              <div className="arrow">→</div>
              <div className="node">
                <div className="nlbl">Retry · Day 1</div>
                <div className="ntitle">Auto re-charge</div>
              </div>
              <div className="arrow">→</div>
              <div className="node">
                <div className="nlbl">Day 3 · 7</div>
                <div className="ntitle">Email + retry</div>
              </div>
              <div className="arrow">→</div>
              <div className="node action">
                <div className="nlbl">Day 14</div>
                <div className="ntitle">Pause · downgrade</div>
              </div>
            </div>
            <div className="spacer-md" />
            <button className="adm-btn ghost" onClick={() => adminGo('automation')}>Edit recovery automation →</button>
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Coupons & <span className="it">offers</span></h3>
            <button className="adm-btn sm">+ New coupon</button>
          </div>
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Redeemed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['SPRING26', '20% · 3 mo', '142 / 500', 'live'],
                ['LAUNCH', '€5 off · once', '482 / ∞', 'live'],
                ['ANNUAL2026', '2 mo free · annual', '38 / 200', 'live'],
                ['STUDENT', '40% · 12 mo', '218 / ∞', 'live'],
                ['BFCM25', '30% · 12 mo', '1,420 / 1,420', 'expired'],
              ].map(([code, disc, used, status], i) => (
                <tr key={i}>
                  <td className="mono"><b>{code}</b></td>
                  <td style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{disc}</td>
                  <td className="num">{used}</td>
                  <td><StatusPill status={status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.Billing = Billing;
