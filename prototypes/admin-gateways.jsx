/* ============ Payment Gateways — official-recommendation configuration ============ */

function Gateways() {
  const [configuring, setConfiguring] = useState(null);

  return (
    <div className="adm-page">
      <PageHead
        tag="08 · Configuration"
        title={<>Payment <span className="it">gateways.</span></>}
        sub="Connect and route money through any combination of processors. Following each provider's official integration guidelines — PCI scope kept minimal via tokenisation, 3DS2 enforced on EU cards."
        actions={
          <>
            <button className="adm-btn ghost">View routing rules</button>
            <button className="adm-btn pri">+ Add gateway</button>
          </>
        }
      />

      <div className="kpi-grid">
        <KPI label="Gateway Volume · 30d" value="69,330" currency="€" delta="+18.2%" foot="across 4 active" />
        <KPI label="Avg. Effective Fee" value="2.18" unit="%" deltaDir="dn" delta="–0.12pp" foot="optimised routing" />
        <KPI label="Decline Rate" value="3.4" unit="%" deltaDir="dn" delta="–0.6pp" foot="industry: 5.2%" />
        <KPI label="3DS Challenge Rate" value="14.2" unit="%" foot="EU SCA compliant" />
      </div>

      {/* Gateway cards */}
      <div className="intg-grid" style={{ marginBottom: 24 }}>
        {adminState.gateways.map(g => (
          <div key={g.id} className="intg">
            <div className="intg-logo" style={
              g.id === 'stripe' || g.id === 'stripe-sepa' ? { background: '#635bff', color: 'white', borderColor: '#635bff' } :
              g.id === 'paypal' ? { background: '#003087', color: '#ffc439', borderColor: '#003087' } :
              g.id === 'mollie' ? { background: '#000000', color: '#ffffff', borderColor: '#000' } :
              g.id === 'wise' ? { background: '#9fe870', color: '#163300', borderColor: '#9fe870' } :
              g.id === 'adyen' ? { background: '#0abf53', color: '#0a1f1c', borderColor: '#0abf53' } :
              {}
            }>{g.logo}</div>
            <div className="intg-body">
              <div className="intg-top">
                <div>
                  <h4>{g.name} {g.primary && <span className="pill solid no-dot" style={{ marginLeft: 8, fontSize: 8 }}>PRIMARY</span>}</h4>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 4 }}>{g.tagline}</div>
                </div>
                <StatusPill status={g.status} />
              </div>
              <div className="intg-d">
                {g.id === 'stripe' && 'Tokenised cards + Apple/Google Pay via Stripe Elements. Webhooks signed with whsec_… Recommended for global card volume.'}
                {g.id === 'stripe-sepa' && 'Direct debit for EU customers — pre-debit notification + mandate stored per Stripe SEPA spec. Lowest cost on monthly recurring.'}
                {g.id === 'paypal' && 'PayPal subscriptions via REST API v2. Customer keeps the funding source; failed payments retried up to 5 times per PayPal recommended cadence.'}
                {g.id === 'mollie' && 'European-favored methods — iDEAL (NL), Bancontact (BE), giropay (DE). Configured but not yet routed. Ready as a failover for EU traffic.'}
                {g.id === 'wise' && 'Multi-currency payouts and FX. Pulls from Stripe + PayPal balances, settles to operating account in EUR/USD/GBP.'}
                {g.id === 'adyen' && 'Enterprise gateway — currently disabled. Configure if you need single-tenant fraud rules or higher-volume cost negotiation.'}
              </div>
              <div className="intg-meta">
                <span>VOL · <b>€{(g.vol30d / 1000).toFixed(1)}K</b></span>
                <span>TX · <b>{g.tx30d}</b></span>
                <span>FEES · <b>{g.fees}</b></span>
                <span>REGION · <b>{g.regions}</b></span>
              </div>
              <div className="row-flex" style={{ marginTop: 14 }}>
                <button className="adm-btn sm" onClick={() => setConfiguring(g)}>Configure</button>
                {g.status === 'live' && <button className="adm-btn sm ghost">View logs</button>}
                {g.status === 'standby' && <button className="adm-btn sm ghost" onClick={() => showAdmToast(g.name + ' activated as failover')}>Activate</button>}
                {g.status === 'disabled' && <button className="adm-btn sm ghost">Enable</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Routing rules */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="pn-head">
          <div>
            <h3>Smart <span className="it">routing</span></h3>
            <div className="pn-tag" style={{ marginTop: 4 }}>Rules evaluate top-to-bottom · first match wins · auto-failover on gateway downtime</div>
          </div>
          <button className="adm-btn sm">+ New rule</button>
        </div>
        <div className="pn-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { when: 'IF country = EU AND amount > €10', then: 'Stripe SEPA · fallback Stripe cards', tag: 'cost-optimised' },
              { when: 'IF method = PayPal', then: 'PayPal REST', tag: 'method-routed' },
              { when: 'IF amount > €500 AND currency = EUR', then: 'Stripe SEPA → Wise payout', tag: 'enterprise' },
              { when: 'ELSE', then: 'Stripe cards (default)', tag: 'default' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto 1fr auto', alignItems: 'center', gap: 14, padding: 14, border: '1px solid var(--rule)', background: i === 0 ? 'var(--paper-2)' : 'var(--paper)' }}>
                <span className="mono-tiny" style={{ fontWeight: 600, color: 'var(--ink)' }}>{(i + 1).toString().padStart(2, '0')}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>{r.when}</span>
                <span className="mono-tiny" style={{ color: 'var(--accent)' }}>→</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{r.then}</span>
                <span className="pill gray no-dot">{r.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="adm-grid two-eq">
        <div className="panel">
          <div className="pn-head">
            <h3>Webhook <span className="it">endpoints</span></h3>
            <span className="pn-tag">SIGNED · HMAC-SHA256</span>
          </div>
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Events</th>
                <th>Last 24h</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['stripe → /webhooks/stripe', '24 events', '482 ✓ · 0 ✕', 'live'],
                ['paypal → /webhooks/paypal', '12 events', '38 ✓ · 0 ✕', 'live'],
                ['mollie → /webhooks/mollie', '8 events', '— · standby', 'standby'],
                ['adyen → /webhooks/adyen', '—', '—', 'disabled'],
              ].map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontSize: 11 }}>{r[0]}</td>
                  <td className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{r[1]}</td>
                  <td className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0, color: r[2].includes('✕') && !r[2].startsWith('0') ? 'var(--accent)' : 'var(--ink-soft)' }}>{r[2]}</td>
                  <td><StatusPill status={r[3]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="pn-head">
            <h3>Compliance <span className="it">posture</span></h3>
            <span className="pill green no-dot">All passing</span>
          </div>
          <div className="pn-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['PCI-DSS SAQ-A', 'Cards never touch our servers · tokenised at element', true],
                ['Strong Customer Authentication', '3DS2 enforced on all EU cards · exemptions logged', true],
                ['EU SCA Compliance', 'PSD2 — required on payments > €30 EU', true],
                ['GDPR DPA in place', 'Stripe · PayPal · Mollie · Wise — all signed', true],
                ['Webhook signature verification', 'All endpoints verify HMAC before processing', true],
                ['Idempotency keys', 'All API calls retry-safe via idempotency-key header', true],
                ['Rate limiting', 'Per-customer + per-IP — 100 req/min cap', true],
              ].map(([n, d, ok], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, padding: '12px 0', borderBottom: i < 6 ? '1px solid var(--rule-soft)' : 'none' }}>
                  <span style={{ width: 22, height: 22, border: '1.5px solid var(--accent-2)', display: 'grid', placeItems: 'center', color: 'var(--accent-2)', fontFamily: 'var(--serif)' }}>✓</span>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500 }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gateway config modal */}
      {configuring && <GatewayConfigModal gw={configuring} onClose={() => setConfiguring(null)} />}
    </div>
  );
}

function GatewayConfigModal({ gw, onClose }) {
  const isStripe = gw.id === 'stripe' || gw.id === 'stripe-sepa';
  return (
    <div className="adm-modal-bd" onClick={onClose}>
      <div className="adm-modal wide" onClick={e => e.stopPropagation()}>
        <div className="m-head">
          <div>
            <h3>Configure <span className="it">{gw.name}</span></h3>
            <div className="ds mono-tiny" style={{ marginTop: 4 }}>FOLLOWING OFFICIAL INTEGRATION GUIDELINES · v2026.05</div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="m-body">
          <div className="adm-form">
            <div className="ff-row">
              <div className="ff-l">
                <div className="ff-tag">API KEYS</div>
                <h5>Publishable & secret keys</h5>
                <div className="ff-d">
                  {isStripe && 'Find these in your Stripe Dashboard → Developers → API Keys. Use a restricted key in production with charges:write, refunds:write, customers:write only.'}
                  {gw.id === 'paypal' && 'From the PayPal Developer Dashboard → Apps & Credentials. Use a live REST app — sandbox keys are auto-rotated weekly.'}
                  {gw.id === 'mollie' && 'Mollie dashboard → Developers → API keys. Live test_… keys never charge real cards.'}
                  {gw.id === 'wise' && 'Wise Business → Settings → API tokens. Read-only for reconciliation; full-scope for outbound payouts.'}
                  {gw.id === 'adyen' && 'Adyen Customer Area → Developers → API credentials. Webhook HMAC key generated separately.'}
                </div>
              </div>
              <div className="ff-r">
                <label className="inp-l">
                  <span>{isStripe ? 'Publishable Key' : 'Client ID'}</span>
                  <input className="inp mono" defaultValue={isStripe ? 'pk_live_51OqA8xK2vJ4mN8…' : gw.id === 'paypal' ? 'AYZP-cFmJ8XnY4kQ_Live_2026…' : 'live_8f3a4b2c1d…'} />
                </label>
                <label className="inp-l">
                  <span>{isStripe ? 'Secret Key' : 'Client Secret'}</span>
                  <input className="inp mono" type="password" defaultValue="••••••••••••••••••••••••••••••" />
                </label>
                <div className="row-flex">
                  <span className="pill green no-dot">Validated · 2 min ago</span>
                  <button className="adm-btn sm ghost">Test connection</button>
                </div>
              </div>
            </div>

            <div className="ff-row">
              <div className="ff-l">
                <div className="ff-tag">WEBHOOKS</div>
                <h5>Endpoint & signing secret</h5>
                <div className="ff-d">Configure this URL in your gateway's webhook settings. Every event is signature-verified with the shared secret before processing.</div>
              </div>
              <div className="ff-r">
                <label className="inp-l">
                  <span>Endpoint URL</span>
                  <input className="inp mono" readOnly value={`https://api.qdenty.io/webhooks/${gw.id}`} />
                </label>
                <label className="inp-l">
                  <span>Signing Secret</span>
                  <input className="inp mono" type="password" defaultValue="whsec_8f3a4b2c1dE7gH9j2K…" />
                </label>
                <div className="adm-form ff-grid-2">
                  <label className="tog">
                    <input type="checkbox" defaultChecked />
                    <span className="tog-track" />
                    <span>
                      <span className="tog-lbl">Verify signatures</span>
                      <span className="tog-sub">REQUIRED IN PRODUCTION</span>
                    </span>
                  </label>
                  <label className="tog">
                    <input type="checkbox" defaultChecked />
                    <span className="tog-track" />
                    <span>
                      <span className="tog-lbl">Replay protection</span>
                      <span className="tog-sub">5-MINUTE WINDOW</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="ff-row">
              <div className="ff-l">
                <div className="ff-tag">SECURITY</div>
                <h5>3DS2 / SCA & risk rules</h5>
                <div className="ff-d">Strong Customer Authentication is required for EU cards under PSD2. Following the gateway's recommendation we challenge on all transactions over €30.</div>
              </div>
              <div className="ff-r">
                <div className="rad-group">
                  <div className="rad on">
                    <span className="ind" />
                    <div className="rad-body">
                      <b>Automatic · gateway-managed (recommended)</b>
                      <span>The gateway decides when to challenge based on its built-in fraud signals.</span>
                    </div>
                  </div>
                  <div className="rad">
                    <span className="ind" />
                    <div className="rad-body">
                      <b>Always challenge</b>
                      <span>Maximum security · higher friction · slightly higher decline rate.</span>
                    </div>
                  </div>
                  <div className="rad">
                    <span className="ind" />
                    <div className="rad-body">
                      <b>Threshold</b>
                      <span>Challenge only above an amount you specify.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ff-row">
              <div className="ff-l">
                <div className="ff-tag">PAYOUTS</div>
                <h5>Settlement schedule</h5>
                <div className="ff-d">When the gateway should release funds to your bank account. Faster payouts may incur additional fees per the provider's pricing page.</div>
              </div>
              <div className="ff-r">
                <div className="ff-grid-2">
                  <label className="inp-l">
                    <span>Schedule</span>
                    <select className="sel" defaultValue="rolling-2">
                      <option value="rolling-2">Rolling · T+2 (default)</option>
                      <option value="rolling-7">Rolling · T+7</option>
                      <option value="weekly">Weekly · Monday</option>
                      <option value="monthly">Monthly · 1st</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </label>
                  <label className="inp-l">
                    <span>Destination</span>
                    <select className="sel" defaultValue="wise">
                      <option value="wise">Wise EUR · PT···0418</option>
                      <option value="revolut">Revolut · ···7724</option>
                      <option value="other">Add account…</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="ff-row">
              <div className="ff-l">
                <div className="ff-tag">CHECKOUT UX</div>
                <h5>Customer-facing options</h5>
                <div className="ff-d">Controls how the payment form appears at checkout and what payment methods are exposed.</div>
              </div>
              <div className="ff-r">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Apple Pay', 'Show on supported devices', true],
                    ['Google Pay', 'Show on supported devices', true],
                    ['Save card for future', 'Tokenise and store for renewals', true],
                    ['Receipt email', 'Auto-send gateway receipt + our invoice', true],
                    ['Show price in customer\'s currency', 'Detected from IP · GBP, USD, CHF added', false],
                  ].map((r, i) => (
                    <label key={i} className="tog">
                      <input type="checkbox" defaultChecked={r[2]} />
                      <span className="tog-track" />
                      <span>
                        <span className="tog-lbl">{r[0]}</span>
                        <span className="tog-sub">{r[1]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="m-foot">
          <button className="adm-btn ghost danger" onClick={onClose}>Disconnect</button>
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn pri" onClick={() => { showAdmToast('Gateway saved'); onClose(); }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

window.Gateways = Gateways;
