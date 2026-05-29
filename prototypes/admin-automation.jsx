/* ============ Automation — workflow rules ============ */

function Automation() {
  const [drawer, setDrawer] = useState(null);

  return (
    <div className="adm-page">
      <PageHead
        tag="09 · Configuration"
        title={<>Run the business on <span className="it">autopilot.</span></>}
        sub="Trigger-condition-action workflows that handle billing recovery, dunning, fraud detection, lifecycle emails, tax reports, and revenue ops. Edit the system that runs the business while you sleep."
        actions={
          <>
            <button className="adm-btn ghost">Run history</button>
            <button className="adm-btn ghost">Templates</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('New automation draft')}>+ New automation</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="Active Automations" value="7" foot="2 paused · 0 errored" />
        <KPI label="Runs · 24h" value="1,420" delta="+8.2%" foot="98.4% success" />
        <KPI label="Revenue Recovered" value="4,820" currency="€" foot="last 30 days · dunning" />
        <KPI label="Hours Saved · est." value="218" unit="hrs/mo" foot="vs. manual ops" />
      </div>

      {/* Sample flow visualisation */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <div>
            <h3>Failed payment <span className="it">recovery</span></h3>
            <div className="pn-tag" style={{ marginTop: 4 }}>Currently active · ran 482 times · recovered €4,820 in 30 days</div>
          </div>
          <div className="row-flex">
            <span className="pill green no-dot">Active</span>
            <button className="adm-btn sm ghost">Edit visually</button>
          </div>
        </div>
        <div className="pn-body" style={{ background: 'var(--paper-2)' }}>
          <div className="flow" style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div className="node trigger">
              <div className="nlbl">When · trigger</div>
              <div className="ntitle">invoice.payment_failed</div>
            </div>
            <div className="arrow">→</div>
            <div className="node condition">
              <div className="nlbl">If · condition</div>
              <div className="ntitle">attempt &lt; 3</div>
            </div>
            <div className="arrow">→</div>
            <div className="node">
              <div className="nlbl">Then · action</div>
              <div className="ntitle">Wait 24h · retry</div>
            </div>
            <div className="arrow">→</div>
            <div className="node">
              <div className="nlbl">Then · action</div>
              <div className="ntitle">Email customer</div>
            </div>
            <div className="arrow">→</div>
            <div className="node condition">
              <div className="nlbl">Else · branch</div>
              <div className="ntitle">attempt &gt;= 3</div>
            </div>
            <div className="arrow">→</div>
            <div className="node action">
              <div className="nlbl">Final · action</div>
              <div className="ntitle">Pause subscription</div>
            </div>
          </div>
        </div>
      </div>

      {/* All automations table */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <h3>All <span className="it">automations</span></h3>
          <div className="pn-tabs">
            <button className="on">All</button>
            <button>Billing</button>
            <button>Lifecycle</button>
            <button>Security</button>
            <button>Reporting</button>
            <button>Tax</button>
            <button>Revenue</button>
          </div>
        </div>
        <table className="adm-tbl">
          <thead>
            <tr>
              <th>Automation</th>
              <th>Category</th>
              <th>Runs · 30d</th>
              <th>Success</th>
              <th>Last Run</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adminState.automations.map(a => (
              <tr key={a.id} onClick={() => setDrawer(a)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="row-link">
                    <div style={{ width: 36, height: 36, border: '1.5px solid var(--ink)', display: 'grid', placeItems: 'center', flexShrink: 0, background: a.status === 'active' ? 'var(--paper-2)' : 'transparent' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: a.status === 'active' ? 'var(--accent)' : 'var(--ink-mute)' }}>
                        {a.kind === 'billing' ? '€' :
                         a.kind === 'lifecycle' ? '○' :
                         a.kind === 'security' ? '⌬' :
                         a.kind === 'reporting' ? '▦' :
                         a.kind === 'revenue' ? '↗' :
                         a.kind === 'tax' ? '%' : '◇'}
                      </span>
                    </div>
                    <div className="stack">
                      <b>{a.name}</b>
                      <span className="sub" style={{ whiteSpace: 'normal', maxWidth: 480 }}>{a.desc}</span>
                    </div>
                  </div>
                </td>
                <td><span className="pill gray no-dot" style={{ textTransform: 'capitalize' }}>{a.kind}</span></td>
                <td className="num">{fmt.int(a.runs)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="amount" style={{ minWidth: 50 }}>{((a.success / a.runs) * 100).toFixed(0)}%</span>
                    <div className="mini-bar accent" style={{ '--w': ((a.success / a.runs) * 100) + '%', minWidth: 60 }} />
                  </div>
                </td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>2 min ago</td>
                <td><StatusPill status={a.status === 'active' ? 'active' : 'paused'} /></td>
                <td className="r" onClick={e => e.stopPropagation()}>
                  <label className="tog" style={{ gap: 0 }}>
                    <input type="checkbox" defaultChecked={a.status === 'active'} onChange={e => showAdmToast(a.name + (e.target.checked ? ' resumed' : ' paused'))} />
                    <span className="tog-track" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trigger catalogue */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Available <span className="it">triggers</span></h3>
            <span className="pn-tag">EVENTS YOU CAN BUILD ON</span>
          </div>
          <div className="pn-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['user.signup', 'New account created'],
              ['user.upgrade', 'Plan upgraded'],
              ['user.downgrade', 'Plan downgraded'],
              ['user.cancel', 'Subscription cancelled'],
              ['invoice.paid', 'Invoice marked paid'],
              ['invoice.payment_failed', 'Payment attempt failed'],
              ['code.created', 'New code published'],
              ['code.scan_spike', 'Anomalous scan spike'],
              ['code.flagged', 'Code flagged for review'],
              ['trial.ending', '3 days before trial ends'],
            ].map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < 8 ? '1px solid var(--rule-soft)' : 'none', paddingRight: i % 2 === 0 ? 16 : 0, paddingLeft: i % 2 === 1 ? 16 : 0, borderRight: i % 2 === 0 ? '1px solid var(--rule-soft)' : 'none' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--accent)' }}>{r[0]}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{r[1]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Available <span className="it">actions</span></h3>
            <span className="pn-tag">WHAT AUTOMATIONS CAN DO</span>
          </div>
          <div className="pn-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['email.send', 'Send templated email'],
              ['user.suspend', 'Pause user account'],
              ['user.upgrade', 'Apply plan change'],
              ['invoice.retry', 'Re-attempt payment'],
              ['invoice.refund', 'Issue full / partial refund'],
              ['code.pause', 'Disable a published code'],
              ['slack.post', 'Post to ops channel'],
              ['webhook.fire', 'Call an external URL'],
              ['data.export', 'Generate CSV / PDF'],
              ['wait', 'Delay by hours / days'],
            ].map((r, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < 8 ? '1px solid var(--rule-soft)' : 'none', paddingRight: i % 2 === 0 ? 16 : 0, paddingLeft: i % 2 === 1 ? 16 : 0, borderRight: i % 2 === 0 ? '1px solid var(--rule-soft)' : 'none' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--accent-2)' }}>{r[0]}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>{r[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automation drawer */}
      {drawer && (
        <>
          <div className="adm-drawer-bd" onClick={() => setDrawer(null)} />
          <aside className="adm-drawer" style={{ width: 680 }}>
            <div className="d-head">
              <div>
                <h3>{drawer.name}</h3>
                <div className="ds">{drawer.id} · {drawer.kind} · runs every event</div>
              </div>
              <button className="adm-btn ghost sm" onClick={() => setDrawer(null)}>Close ✕</button>
            </div>
            <div className="d-body">
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>{drawer.desc}</p>

              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Flow</h4>
              <div className="code-block" style={{ marginBottom: 22, lineHeight: 1.8 }}>
                <button className="copy">YAML</button>
                <span className="c">{`# ${drawer.name}`}</span>{'\n'}
                <span className="k">trigger</span>{':\n  event: '}<span className="s">{drawer.kind === 'billing' ? '"invoice.payment_failed"' : drawer.kind === 'lifecycle' ? '"user.signup"' : drawer.kind === 'security' ? '"code.created"' : '"schedule.daily"'}</span>{'\n\n'}
                <span className="k">conditions</span>{':\n  - '}{drawer.kind === 'billing' ? 'invoice.attempt < 4' : drawer.kind === 'security' ? 'pattern.matches("phishing")' : 'true'}{'\n\n'}
                <span className="k">actions</span>{':\n  - '}<span className="s">"wait"</span>{':\n      duration: 24h\n  - '}<span className="s">"email.send"</span>{':\n      template: '}<span className="s">{`"${drawer.kind}-reminder"`}</span>{'\n  - '}<span className="s">"invoice.retry"</span>{`\n`}
              </div>

              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Recent runs</h4>
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Target</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['2 min ago', 'tx_4yJ0n', 'settled'],
                    ['14 min ago', 'tx_8nB2p', 'settled'],
                    ['1h ago', 'tx_9kT4r', 'failed'],
                    ['4h ago', 'tx_2cF7m', 'settled'],
                    ['Yesterday', 'tx_5dG3n', 'settled'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ color: 'var(--ink-mute)' }}>{r[0]}</td>
                      <td className="mono">{r[1]}</td>
                      <td><StatusPill status={r[2]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-foot">
              <button className="adm-btn ghost">View logs</button>
              <button className="adm-btn ghost">Duplicate</button>
              <button className="adm-btn pri">Edit automation</button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

window.Automation = Automation;
