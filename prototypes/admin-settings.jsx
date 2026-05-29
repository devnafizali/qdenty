/* ============ Settings — site, security, team, API ============ */

function Settings() {
  const [section, setSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'brand', label: 'Brand & Site' },
    { id: 'security', label: 'Security' },
    { id: 'team', label: 'Team & Roles' },
    { id: 'api', label: 'API & Webhooks' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data', label: 'Data & Compliance' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="adm-page">
      <PageHead
        tag="10 · Configuration"
        title={<>Settings & <span className="it">controls.</span></>}
        sub="Everything site-wide — brand, security policies, the team that operates qdenty, API keys, and the legal compliance posture."
        actions={
          <>
            <button className="adm-btn ghost">Audit log</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('Settings saved')}>Save changes</button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Section nav */}
        <aside className="panel" style={{ alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
          <ul style={{ listStyle: 'none', padding: 8 }}>
            {sections.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => setSection(s.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    background: section === s.id ? 'var(--paper-2)' : 'transparent',
                    borderLeft: '2px solid ' + (section === s.id ? 'var(--accent)' : 'transparent'),
                    color: s.id === 'danger' ? '#b91c1c' : 'var(--ink)',
                    fontWeight: section === s.id ? 500 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {section === 'general' && <GeneralSettings />}
          {section === 'brand' && <BrandSettings />}
          {section === 'security' && <SecuritySettings />}
          {section === 'team' && <TeamSettings />}
          {section === 'api' && <APISettings />}
          {section === 'notifications' && <NotificationSettings />}
          {section === 'data' && <DataSettings />}
          {section === 'danger' && <DangerZone />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="panel">
      <div className="pn-head"><h3>General <span className="it">settings</span></h3></div>
      <div className="pn-body">
        <div className="adm-form">
          <div className="ff-row">
            <div className="ff-l">
              <h5>Company details</h5>
              <div className="ff-d">Legal entity & contact info — printed on invoices and used for tax filings.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-2">
                <label className="inp-l"><span>Legal name</span><input className="inp" defaultValue="qdenty, Lda." /></label>
                <label className="inp-l"><span>Trading name</span><input className="inp" defaultValue="qdenty" /></label>
                <label className="inp-l"><span>VAT number</span><input className="inp mono" defaultValue="PT 514 820 199" /></label>
                <label className="inp-l"><span>Company registration</span><input className="inp mono" defaultValue="514820199" /></label>
              </div>
              <label className="inp-l"><span>Registered address</span><textarea className="txt" defaultValue="Rua da Misericórdia 28, 4° &#10;1200-273 Lisbon · Portugal" /></label>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <h5>Localisation</h5>
              <div className="ff-d">Defaults for new users and admin views.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-3">
                <label className="inp-l"><span>Default currency</span>
                  <select className="sel" defaultValue="EUR"><option>EUR</option><option>USD</option><option>GBP</option></select>
                </label>
                <label className="inp-l"><span>Default locale</span>
                  <select className="sel" defaultValue="en-PT"><option>en-PT</option><option>en-GB</option><option>en-US</option><option>pt-PT</option></select>
                </label>
                <label className="inp-l"><span>Timezone</span>
                  <select className="sel" defaultValue="Europe/Lisbon"><option>Europe/Lisbon</option><option>UTC</option></select>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandSettings() {
  return (
    <div className="panel">
      <div className="pn-head"><h3>Brand & <span className="it">site</span></h3></div>
      <div className="pn-body">
        <div className="adm-form">
          <div className="ff-row">
            <div className="ff-l">
              <h5>Public site</h5>
              <div className="ff-d">qdenty.io — what visitors see before they sign in.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-2">
                <label className="inp-l"><span>Primary domain</span><input className="inp mono" defaultValue="qdenty.io" /></label>
                <label className="inp-l"><span>QR redirect domain</span><input className="inp mono" defaultValue="qd.cards" /></label>
              </div>
              <label className="inp-l"><span>Tagline</span><input className="inp" defaultValue="Identity codes for the real world." /></label>
              <label className="tog"><input type="checkbox" defaultChecked /><span className="tog-track" /><span><span className="tog-lbl">Marketing site is live</span><span className="tog-sub">DISABLE FOR MAINTENANCE MODE</span></span></label>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <h5>Brand colours</h5>
              <div className="ff-d">The base palette across product + emails + receipts.</div>
            </div>
            <div className="ff-r">
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {[
                  ['Ink', '#0F0E0C'],
                  ['Paper', '#F3EFE7'],
                  ['Accent', '#C2410C'],
                  ['Field', '#1E3A2B'],
                  ['Gold', '#8A6D2C'],
                ].map(([n, c]) => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                    <div style={{ width: 56, height: 56, background: c, border: '1.5px solid var(--ink)' }} />
                    <div className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{n}</div>
                    <div className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--ink-mute)' }}>{c}</div>
                  </div>
                ))}
                <button className="adm-btn ghost" style={{ alignSelf: 'flex-end' }}>+ Add</button>
              </div>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <h5>Email templates</h5>
              <div className="ff-d">Transactional emails sent automatically by the system.</div>
            </div>
            <div className="ff-r">
              <div style={{ border: '1px solid var(--rule)' }}>
                {[
                  ['Welcome · post-signup', 'live', 'Edited 2 weeks ago'],
                  ['Invoice receipt', 'live', 'Edited 1 month ago'],
                  ['Trial ending', 'live', 'Edited 1 month ago'],
                  ['Payment failed · day 1', 'live', 'Edited 2 weeks ago'],
                  ['Payment failed · day 7', 'live', 'Edited 2 weeks ago'],
                  ['Account suspended', 'live', 'Edited 3 months ago'],
                ].map((r, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr auto', gap: 14, padding: '12px 14px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--rule-soft)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 14 }}>{r[0]}</span>
                    <StatusPill status={r[1]} />
                    <span className="mono-tiny" style={{ textTransform: 'none', letterSpacing: 0 }}>{r[2]}</span>
                    <button className="adm-btn sm ghost">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="panel">
      <div className="pn-head"><h3>Security <span className="it">policies</span></h3></div>
      <div className="pn-body">
        <div className="adm-form">
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">USER AUTH</div>
              <h5>Authentication</h5>
              <div className="ff-d">How customers and admins log in.</div>
            </div>
            <div className="ff-r" style={{ gap: 14 }}>
              <label className="tog"><input type="checkbox" defaultChecked /><span className="tog-track" /><span><span className="tog-lbl">Require 2FA for all admins</span><span className="tog-sub">TOTP OR HARDWARE KEY</span></span></label>
              <label className="tog"><input type="checkbox" defaultChecked /><span className="tog-track" /><span><span className="tog-lbl">Allow magic-link login</span><span className="tog-sub">EMAILED · 15 MIN EXPIRY</span></span></label>
              <label className="tog"><input type="checkbox" defaultChecked /><span className="tog-track" /><span><span className="tog-lbl">Sign in with Google</span><span className="tog-sub">OAUTH2 · WORKSPACE OK</span></span></label>
              <label className="tog"><input type="checkbox" /><span className="tog-track" /><span><span className="tog-lbl">Sign in with Apple</span><span className="tog-sub">REQUIRED FOR IOS · NOT YET</span></span></label>
              <label className="tog"><input type="checkbox" defaultChecked /><span className="tog-track" /><span><span className="tog-lbl">Block disposable email domains</span><span className="tog-sub">512 BLOCKED DOMAINS</span></span></label>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">SESSIONS</div>
              <h5>Session policy</h5>
              <div className="ff-d">How long sessions last and when to force re-auth.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-2">
                <label className="inp-l"><span>Session lifetime</span>
                  <select className="sel" defaultValue="30d"><option value="1d">1 day</option><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option></select>
                </label>
                <label className="inp-l"><span>Idle timeout (admin)</span>
                  <select className="sel" defaultValue="30m"><option>15 min</option><option>30 min</option><option>1 hour</option><option>Never</option></select>
                </label>
              </div>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">RATE LIMITS</div>
              <h5>API & abuse limits</h5>
              <div className="ff-d">Caps that protect the platform from spam and bots.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-3">
                <label className="inp-l"><span>Codes / hour per user</span><input className="inp mono" defaultValue="20" /></label>
                <label className="inp-l"><span>API requests / minute</span><input className="inp mono" defaultValue="100" /></label>
                <label className="inp-l"><span>Login attempts / hour</span><input className="inp mono" defaultValue="10" /></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSettings() {
  const team = [
    { name: 'Adelaide Marlow', email: 'adelaide@qdenty.io', role: 'Super Admin', last: 'Online', av: 'A', kind: 'a1' },
    { name: 'Tomás Vieira', email: 'tomas@qdenty.io', role: 'Ops Manager', last: '12 min ago', av: 'T', kind: 'a2' },
    { name: 'Mireille Conrad', email: 'mireille@qdenty.io', role: 'Finance', last: '2 hrs ago', av: 'M', kind: 'a3' },
    { name: 'James Holloway', email: 'james@qdenty.io', role: 'Support', last: 'Yesterday', av: 'J', kind: 'a4' },
    { name: 'Lena Maier', email: 'lena@qdenty.io', role: 'Read-only', last: '4 days ago', av: 'L', kind: 'a1' },
  ];
  return (
    <div className="panel">
      <div className="pn-head">
        <h3>Team & <span className="it">roles</span></h3>
        <button className="adm-btn sm pri">+ Invite member</button>
      </div>
      <table className="adm-tbl">
        <thead>
          <tr><th>Member</th><th>Role</th><th>Last Active</th><th>2FA</th><th></th></tr>
        </thead>
        <tbody>
          {team.map(t => (
            <tr key={t.email}>
              <td>
                <div className="row-link">
                  <div className={'av-sm ' + t.kind}>{t.av}</div>
                  <div className="stack"><b>{t.name}</b><span className="sub">{t.email}</span></div>
                </div>
              </td>
              <td><span className={'pill no-dot ' + (t.role.includes('Super') ? 'gold' : t.role === 'Read-only' ? 'gray' : 'green')}>{t.role}</span></td>
              <td className="mono" style={{ color: t.last === 'Online' ? 'var(--accent-2)' : 'var(--ink-mute)' }}>{t.last}</td>
              <td><span className="pill green no-dot">Enabled</span></td>
              <td className="r"><button className="row-menu">⋯</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: 22, borderTop: '1.5px solid var(--line)' }}>
        <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 14 }}>Role permissions</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Capability</th>
              <th style={{ padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Super</th>
              <th style={{ padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Ops</th>
              <th style={{ padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Finance</th>
              <th style={{ padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Support</th>
              <th style={{ padding: '10px 12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400 }}>Read-only</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['View dashboard', [1, 1, 1, 1, 1]],
              ['Manage users', [1, 1, 0, 1, 0]],
              ['Issue refunds', [1, 1, 1, 0, 0]],
              ['Edit billing plans', [1, 0, 1, 0, 0]],
              ['Configure gateways', [1, 0, 1, 0, 0]],
              ['Edit automations', [1, 1, 0, 0, 0]],
              ['Manage team', [1, 0, 0, 0, 0]],
              ['View audit log', [1, 1, 1, 1, 1]],
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--rule-soft)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--serif)', fontSize: 13 }}>{r[0]}</td>
                {r[1].map((v, j) => (
                  <td key={j} style={{ padding: '10px 12px', textAlign: 'center', color: v ? 'var(--accent-2)' : 'var(--ink-mute)', fontFamily: 'var(--mono)', fontSize: 14 }}>{v ? '✓' : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function APISettings() {
  return (
    <div className="panel">
      <div className="pn-head">
        <h3>API & <span className="it">webhooks</span></h3>
        <button className="adm-btn sm pri">+ Create key</button>
      </div>
      <table className="adm-tbl">
        <thead><tr><th>Key</th><th>Scope</th><th>Created</th><th>Last Used</th><th></th></tr></thead>
        <tbody>
          {[
            ['qd_live_8f3a4b2c1d…', 'Production · full', '2024-08-12', '2 min ago'],
            ['qd_live_2c4b8a3d9e…', 'Production · read-only', '2024-11-22', '14 min ago'],
            ['qd_test_9d2e1f4a8b…', 'Sandbox · full', '2025-02-18', 'Yesterday'],
          ].map((r, i) => (
            <tr key={i}>
              <td className="mono">{r[0]}</td>
              <td><span className={'pill no-dot ' + (r[1].includes('read') ? 'gray' : 'orange')}>{r[1]}</span></td>
              <td className="mono" style={{ color: 'var(--ink-mute)' }}>{r[2]}</td>
              <td className="mono" style={{ color: 'var(--ink-mute)' }}>{r[3]}</td>
              <td className="r">
                <button className="adm-btn sm ghost">Rotate</button>
                <button className="adm-btn sm ghost danger" style={{ marginLeft: 6 }}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: 22, borderTop: '1.5px solid var(--line)' }}>
        <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>Example request</h4>
        <div className="code-block">
          <button className="copy" onClick={() => showAdmToast('Copied')}>Copy</button>
          <span className="c">{'# Create a new identity code'}</span>{'\n'}
          <span className="k">curl</span>{' -X POST '}<span className="s">"https://api.qdenty.io/v2/codes"</span>{' \\\n'}
          {'  -H '}<span className="s">"Authorization: Bearer qd_live_8f3a4b2c1d…"</span>{' \\\n'}
          {'  -H '}<span className="s">"Content-Type: application/json"</span>{' \\\n'}
          {'  -d '}<span className="s">{`'{"type":"identity","label":"My Card","payload":"https://qdenty.io/u/adelaide"}'`}</span>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="panel">
      <div className="pn-head"><h3>Admin <span className="it">notifications</span></h3></div>
      <div className="pn-body">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--serif)' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400, borderBottom: '1.5px solid var(--ink)' }}>Event</th>
              <th style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400, borderBottom: '1.5px solid var(--ink)' }}>Email</th>
              <th style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400, borderBottom: '1.5px solid var(--ink)' }}>Slack</th>
              <th style={{ padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', fontWeight: 400, borderBottom: '1.5px solid var(--ink)' }}>SMS</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['New high-value signup (≥ Atelier)', [1, 1, 0]],
              ['Payment failed', [1, 0, 0]],
              ['Refund issued', [1, 1, 0]],
              ['Code flagged for moderation', [1, 1, 0]],
              ['Gateway outage detected', [1, 1, 1]],
              ['Daily revenue digest', [1, 0, 0]],
              ['Weekly cohort report', [1, 0, 0]],
              ['Security alert (failed admin login)', [1, 1, 1]],
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--rule-soft)' }}>
                <td style={{ padding: '12px 14px', fontSize: 14 }}>{r[0]}</td>
                {r[1].map((v, j) => (
                  <td key={j} style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <label className="tog" style={{ gap: 0 }}>
                      <input type="checkbox" defaultChecked={!!v} />
                      <span className="tog-track" />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataSettings() {
  return (
    <div className="panel">
      <div className="pn-head"><h3>Data & <span className="it">compliance</span></h3></div>
      <div className="pn-body">
        <div className="adm-form">
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">GDPR</div>
              <h5>Data residency</h5>
              <div className="ff-d">Where customer data lives at rest. Changing region requires a 14-day migration window.</div>
            </div>
            <div className="ff-r">
              <div className="rad-group">
                <div className="rad on">
                  <span className="ind" />
                  <div className="rad-body"><b>EU — eu-west-1 (Ireland)</b><span>Default · GDPR-compliant · GDPR DPA in place with all subprocessors.</span></div>
                </div>
                <div className="rad">
                  <span className="ind" />
                  <div className="rad-body"><b>US — us-east-1</b><span>For US-based customers. Schrems II transfer clauses apply.</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">RETENTION</div>
              <h5>Data retention</h5>
              <div className="ff-d">How long to keep different categories of data after account closure.</div>
            </div>
            <div className="ff-r">
              <div className="ff-grid-2">
                <label className="inp-l"><span>Scan analytics</span><select className="sel" defaultValue="2y"><option>30 days</option><option>1 year</option><option value="2y">2 years (default)</option><option>Indefinite</option></select></label>
                <label className="inp-l"><span>Invoices (legal min.)</span><select className="sel" defaultValue="10y"><option>5 years</option><option value="10y">10 years (PT law)</option></select></label>
                <label className="inp-l"><span>Email logs</span><select className="sel" defaultValue="90d"><option value="90d">90 days</option><option>1 year</option></select></label>
                <label className="inp-l"><span>Closed accounts</span><select className="sel" defaultValue="30d"><option value="30d">30-day grace, then delete</option><option>Soft-delete · 1 year</option></select></label>
              </div>
            </div>
          </div>
          <div className="ff-row">
            <div className="ff-l">
              <div className="ff-tag">EXPORT</div>
              <h5>GDPR data requests</h5>
              <div className="ff-d">Self-serve flow for "Subject Access Requests" and account deletion under Article 17.</div>
            </div>
            <div className="ff-r">
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
                14 SAR exports queued · 3 right-to-be-forgotten requests pending review.
              </p>
              <button className="adm-btn ghost">Open request queue</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DangerZone() {
  return (
    <div className="panel" style={{ borderColor: '#b91c1c' }}>
      <div className="pn-head" style={{ background: 'rgba(185, 28, 28, 0.05)' }}>
        <h3 style={{ color: '#b91c1c' }}>Danger <span className="it">zone</span></h3>
        <span className="pill red no-dot">REQUIRES SUPER ADMIN</span>
      </div>
      <div className="pn-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['Enter maintenance mode', 'Block all public traffic — login still works for admins.', 'Enter maintenance'],
            ['Purge analytics events', 'Permanently delete all scan analytics older than retention. Cannot be reversed.', 'Purge events'],
            ['Rotate all admin sessions', 'Force-logout every admin including yourself. Use after a suspected breach.', 'Rotate sessions'],
            ['Transfer ownership', 'Hand the Super Admin role to another team member.', 'Transfer'],
            ['Close qdenty', 'End-of-business shutdown wizard. 14-day customer notification, data export, account closure.', 'Begin wind-down'],
          ].map((r, i, arr) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--rule)' : 'none', alignItems: 'center' }}>
              <div>
                <h5 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{r[0]}</h5>
                <p style={{ color: 'var(--ink-mute)', fontSize: 13, lineHeight: 1.4 }}>{r[1]}</p>
              </div>
              <button className="adm-btn danger" style={{ borderColor: '#b91c1c', color: '#b91c1c' }} onClick={() => { if (confirm('Confirm: ' + r[0] + '?')) showAdmToast(r[0] + ' triggered'); }}>{r[2]}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Settings = Settings;
