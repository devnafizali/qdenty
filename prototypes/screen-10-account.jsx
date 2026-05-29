/* ============ Screen 11 — Account & Settings ============ */

const ACCOUNT_SECTIONS = [
  { id: 'profile', n: '01', label: 'Profile', desc: 'Name, photo, public slug' },
  { id: 'security', n: '02', label: 'Security', desc: 'Password & 2FA' },
  { id: 'billing', n: '03', label: 'Plan & Billing', desc: 'Subscription · invoices' },
  { id: 'notifications', n: '04', label: 'Notifications', desc: 'What we email you' },
  { id: 'api', n: '05', label: 'API Keys', desc: 'For developers' },
  { id: 'team', n: '06', label: 'Team', desc: 'Seats & invites' },
  { id: 'danger', n: '07', label: 'Danger Zone', desc: 'Export · delete' },
];

function Account() {
  const [state] = useAppState();
  const route = useHashRoute();
  const sub = route.params[0] || 'profile';
  const section = ACCOUNT_SECTIONS.find(s => s.id === sub) || ACCOUNT_SECTIONS[0];

  useEffect(() => {
    if (!state.authed) {
      showToast('Sign in to access your account');
      document.dispatchEvent(new CustomEvent('qd:openSignIn'));
    }
  }, []);

  if (!state.authed) return <PageLabel screen={1} left="ACCOUNT · SIGN IN REQUIRED" right="" />;

  return (
    <>
      <PageLabel
        screen={1}
        left={`SCREEN 11 — ACCOUNT · ${section.label.toUpperCase()}`}
        right={`${(state.user?.email || '').toUpperCase()} · ${planLabel(state.planId).toUpperCase()}`}
      />
      <section className="screen" style={{ paddingTop: 48 }}>
        <div className="screen-tag"><b>§ 11</b>Account &amp; Settings</div>

        <div className="acct-wrap">
          <div className="uc-head" style={{ marginBottom: 32 }}>
            <h2>Your <span className="it">account.</span></h2>
            <div className="uc-intro">
              <span className="lbl">Signed in as {state.user?.email}</span>
              Everything personal, billable, and developer-facing lives here. Edits save instantly — no "save" button needed unless we say so.
            </div>
          </div>

          <div className="acct-frame">
            <aside className="acct-rail">
              <div className="acct-rail-ttl">Sections</div>
              <ul>
                {ACCOUNT_SECTIONS.map(s => (
                  <li key={s.id}
                      className={sub === s.id ? 'on' : ''}
                      onClick={() => navigate('account/' + s.id)}>
                    <div className="acct-rail-row">
                      <span className="n">{s.n}</span>
                      <span>
                        <span className="lbl">{s.label}</span>
                        <span className="desc">{s.desc}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="acct-rail-foot">
                <div className="rail-status">
                  <div className="lbl">Plan</div>
                  <div className="val">{planLabel(state.planId)}</div>
                  {state.planId !== 'pro' && state.planId !== 'atelier' && (
                    <a onClick={() => navigate('pricing')}>↗ Upgrade</a>
                  )}
                </div>
              </div>
            </aside>

            <div className="acct-main">
              {sub === 'profile' && <AcctProfile state={state} />}
              {sub === 'security' && <AcctSecurity state={state} />}
              {sub === 'billing' && <AcctBilling state={state} />}
              {sub === 'notifications' && <AcctNotifications state={state} />}
              {sub === 'api' && <AcctApi state={state} />}
              {sub === 'team' && <AcctTeam state={state} />}
              {sub === 'danger' && <AcctDanger state={state} />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Profile ---------- */
function AcctProfile({ state }) {
  const u = state.user || { email: '', name: '' };
  const id = state.identity;
  const updateUser = (patch) => setAppState(s => ({ ...s, user: { ...s.user, ...patch } }));
  const updateIdentity = (patch) => setAppState(s => ({ ...s, identity: { ...s.identity, ...patch } }));

  return (
    <>
      <AcctHeader title={<>Your <span className="it">profile.</span></>} sub="What appears on your hosted identity page and CV." />

      <div className="acct-card">
        <div className="acct-card-row">
          <div className="acct-avatar">
            <span>{(u.name || u.email).split(/[\s.@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
              Profile photo
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 12 }}>
              We use the first two letters of your name when no photo is set.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-mini">Upload photo</button>
              <button className="btn-mini-ghost">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div className="form-stack">
        <div className="field-row">
          <div className="field">
            <label>Display name</label>
            <input value={u.name || ''} onChange={e => updateUser({ name: e.target.value })} placeholder="Adelaide Marlow" />
          </div>
          <div className="field">
            <label>Pronouns</label>
            <input value={id.pronouns} onChange={e => updateIdentity({ pronouns: e.target.value })} placeholder="she / her" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input value={u.email || ''} onChange={e => updateUser({ email: e.target.value })} type="email" />
            <div className="field-hint">Change requires re-verification</div>
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={id.phone} onChange={e => updateIdentity({ phone: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Job title</label>
          <input value={id.title} onChange={e => updateIdentity({ title: e.target.value })} placeholder="Editorial Designer · Type" />
        </div>
        <div className="field">
          <label>Bio · 240 chars</label>
          <textarea rows={3} maxLength={240} value={id.bio} onChange={e => updateIdentity({ bio: e.target.value })} />
          <div className="field-hint">{id.bio.length} / 240</div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={id.location} onChange={e => updateIdentity({ location: e.target.value })} />
        </div>
        <div className="field">
          <label>Public URL slug</label>
          <div className="slug-row">
            <span>qdenty.io/u/</span>
            <input value={id.slug} onChange={e => updateIdentity({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 32) })} />
            <a className="btn-mini-ghost" onClick={() => navigate('preview/identity')}>↗ Preview</a>
          </div>
          <div className="field-hint">Lowercase letters, numbers, hyphens. This is the link your QR points to.</div>
        </div>
      </div>
    </>
  );
}

/* ---------- Security ---------- */
function AcctSecurity({ state }) {
  const [old1, setOld] = useState('');
  const [new1, setNew] = useState('');
  const [new2, setNew2] = useState('');
  const [tfa, setTfa] = useState(false);

  const changePw = (e) => {
    e.preventDefault();
    if (!old1) { showToast('Enter current password'); return; }
    if (new1.length < 8) { showToast('New password too short'); return; }
    if (new1 !== new2) { showToast('Passwords do not match'); return; }
    setOld(''); setNew(''); setNew2('');
    showToast('Password updated');
  };

  return (
    <>
      <AcctHeader title={<>Keep things <span className="it">tight.</span></>} sub="Password, two-factor auth, and your active sessions." />

      <h3 className="acct-h3">Change password</h3>
      <form onSubmit={changePw} className="form-stack">
        <div className="field">
          <label>Current password</label>
          <input type="password" value={old1} onChange={e => setOld(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>New password</label>
            <input type="password" value={new1} onChange={e => setNew(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={new2} onChange={e => setNew2(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-pri" style={{ padding: '12px 22px' }} type="submit">Update password</button>
        </div>
      </form>

      <h3 className="acct-h3" style={{ marginTop: 40 }}>Two-factor authentication</h3>
      <div className="acct-card flex">
        <div style={{ flex: 1 }}>
          <div className="acct-card-h">
            Authenticator app
            <span className={'acct-pill ' + (tfa ? 'on' : '')}>{tfa ? 'Enabled' : 'Off'}</span>
          </div>
          <p className="acct-card-p">Use any TOTP app (1Password · Authy · Google Authenticator). Adds a 6-digit code on each sign-in.</p>
        </div>
        <button className={tfa ? 'btn-mini-ghost' : 'btn-mini'} onClick={() => { setTfa(t => !t); showToast(tfa ? '2FA disabled' : '2FA enrolled (demo)'); }}>
          {tfa ? 'Disable' : 'Enable'}
        </button>
      </div>

      <h3 className="acct-h3" style={{ marginTop: 40 }}>Active sessions</h3>
      <table className="acct-table">
        <thead><tr><th>Device</th><th>Location</th><th>Last active</th><th></th></tr></thead>
        <tbody>
          <tr>
            <td><b>MacBook Pro · Safari 17</b><br /><span className="acct-sub">This device</span></td>
            <td>Lisbon, PT</td>
            <td>Now</td>
            <td><span className="acct-pill on">current</span></td>
          </tr>
          <tr>
            <td>iPhone 15 · qdenty App</td>
            <td>Lisbon, PT</td>
            <td>2 hours ago</td>
            <td><a className="acct-link" onClick={() => showToast('Session revoked')}>Sign out</a></td>
          </tr>
          <tr>
            <td>Chrome · Windows 11</td>
            <td>Dhaka, BD</td>
            <td>Yesterday</td>
            <td><a className="acct-link" onClick={() => showToast('Session revoked')}>Sign out</a></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* ---------- Billing ---------- */
function AcctBilling({ state }) {
  const plan = state.planId || 'guest';
  const isPaid = ['starter', 'pro', 'atelier'].includes(plan);
  const orders = state.orders || (state.lastOrder ? [state.lastOrder] : []);

  return (
    <>
      <AcctHeader title={<>Plan &amp; <span className="it">billing.</span></>} sub="Manage your subscription, see past invoices." />

      <div className={'plan-banner ' + (isPaid ? 'paid' : 'free')}>
        <div>
          <div className="lbl">Current plan</div>
          <div className="plan-banner-h">{planLabel(plan)}</div>
          <div className="plan-banner-p">
            {plan === 'guest' && 'You\'re using the free guest tier. No saved codes, no analytics.'}
            {plan === 'free' && 'Free Account. Up to 10 saved codes and 2 dynamic links.'}
            {plan === 'starter' && 'Starter · 50 dynamic codes, all 22 templates, vector exports.'}
            {plan === 'pro' && 'Professional · unlimited codes, team controls, API + analytics.'}
            {plan === 'atelier' && 'Atelier Enterprise · talk to your account manager for changes.'}
          </div>
        </div>
        <div className="plan-banner-cta">
          {!isPaid && <a className="btn-pri" onClick={() => navigate('pricing')}>Upgrade plan</a>}
          {isPaid && plan !== 'pro' && plan !== 'atelier' && <a className="btn-pri" onClick={() => navigate('pricing')}>Upgrade to Pro</a>}
          {isPaid && <a className="btn-mini-ghost" onClick={() => showToast('Cancellation flow · demo')}>Cancel plan</a>}
        </div>
      </div>

      <h3 className="acct-h3" style={{ marginTop: 32 }}>Payment method</h3>
      {isPaid && state.lastOrder ? (
        <div className="acct-card flex">
          <div style={{ flex: 1 }}>
            <div className="acct-card-h">
              {state.lastOrder.brand} · ending {state.lastOrder.last4}
            </div>
            <p className="acct-card-p">Charged in {state.lastOrder.country} · next renewal {state.lastOrder.annual ? 'in 12 months' : 'in 30 days'}.</p>
          </div>
          <button className="btn-mini-ghost" onClick={() => navigate('pricing')}>Replace</button>
        </div>
      ) : (
        <div className="acct-card flex">
          <div style={{ flex: 1 }}>
            <div className="acct-card-h">No payment method on file</div>
            <p className="acct-card-p">Add one when you upgrade your plan.</p>
          </div>
          <button className="btn-mini" onClick={() => navigate('pricing')}>Add</button>
        </div>
      )}

      <h3 className="acct-h3" style={{ marginTop: 32 }}>Invoices</h3>
      {orders.length === 0 ? (
        <div className="acct-empty">
          <div className="acct-empty-h">No invoices yet</div>
          <div className="acct-empty-p">Once you subscribe, every payment we send you will appear here as a downloadable PDF.</div>
        </div>
      ) : (
        <table className="acct-table">
          <thead><tr><th>Date</th><th>Order</th><th>Plan</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i}>
                <td>{o.date}</td>
                <td><b style={{ fontFamily: 'var(--mono)' }}>{o.no}</b></td>
                <td>{o.planName} · {o.annual ? 'Annual' : 'Monthly'}</td>
                <td><b>{currencySymbolAcct(o.country)}{o.amount.toLocaleString()}</b></td>
                <td><span className="acct-pill on">Paid</span></td>
                <td>
                  <a className="acct-link" onClick={() => showToast('PDF receipt · demo')}>↓ PDF</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function currencySymbolAcct(country) {
  // mirror checkout's symbol map so this file is self-contained
  const map = {
    US: '$', CA: 'C$', GB: '£', JP: '¥', IN: '₹', BR: 'R$', MX: 'MX$',
    SG: 'S$', ZA: 'R', AU: 'A$', AE: 'د.إ', SA: '﷼',
    BD: '৳', PK: '₨', LK: '₨', NP: '₨',
  };
  return map[country] || '€';
}

/* ---------- Notifications ---------- */
function AcctNotifications({ state }) {
  const n = state.notifications || {};
  const set = (k, v) => setAppState(s => ({ ...s, notifications: { ...s.notifications, [k]: v } }));

  const ITEMS = [
    { id: 'scanAlerts', label: 'Scan alerts', desc: 'Realtime ping when one of your codes is scanned. Mute is per-code.' },
    { id: 'weeklyDigest', label: 'Weekly digest', desc: 'Monday-morning summary of scans, geographies and top performers.' },
    { id: 'productNews', label: 'Product news', desc: 'New templates, features, and the occasional studio interview.' },
    { id: 'securityAlerts', label: 'Security alerts', desc: 'New sign-ins, password changes, payment-method changes. Cannot disable.' },
  ];

  return (
    <>
      <AcctHeader title={<>What we <span className="it">email</span> you.</>} sub="Granular controls. We only email when it matters." />
      <div className="notif-list">
        {ITEMS.map(it => (
          <div key={it.id} className="notif-row">
            <div>
              <div className="notif-h">{it.label}</div>
              <div className="notif-p">{it.desc}</div>
            </div>
            <Toggle
              on={!!n[it.id]}
              disabled={it.id === 'securityAlerts'}
              onToggle={() => set(it.id, !n[it.id])}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function Toggle({ on, disabled, onToggle }) {
  return (
    <button
      className={'toggle' + (on ? ' on' : '') + (disabled ? ' disabled' : '')}
      onClick={() => !disabled && onToggle()}
      aria-pressed={on}>
      <span className="toggle-knob"></span>
    </button>
  );
}

/* ---------- API Keys ---------- */
function AcctApi({ state }) {
  const proPlus = hasTier(state, 'elite');
  const keys = state.apiKeys || [];
  const usage = state.apiUsage || { used: 0, limit: 0 };

  const createKey = () => {
    if (!proPlus) { showToast('API access · Professional plan'); navigate('pricing'); return; }
    const label = prompt('Label for new key (e.g. "Staging")');
    if (!label) return;
    const newKey = {
      id: 'k' + Date.now().toString(36),
      label,
      token: 'qd_live_' + Math.random().toString(36).slice(2, 14),
      created: new Date().toISOString().slice(0, 10),
      lastUsed: 'never',
    };
    setAppState(s => ({ ...s, apiKeys: [newKey, ...(s.apiKeys || [])] }));
    showToast('Key created · copy it now');
  };
  const revoke = (id) => {
    if (!confirm('Revoke this key? Apps using it will stop working immediately.')) return;
    setAppState(s => ({ ...s, apiKeys: s.apiKeys.filter(k => k.id !== id) }));
    showToast('Key revoked');
  };

  return (
    <>
      <AcctHeader title={<>API <span className="it">keys.</span></>} sub="For developers. Programmatically generate, edit, and read scans." />

      {!proPlus && (
        <div className="acct-lock-card">
          <div>
            <div className="acct-lock-h">API access requires Professional</div>
            <div className="acct-lock-p">Programmatic key creation, REST + Webhook endpoints, 5,000 calls/month on Pro · unlimited on Atelier.</div>
          </div>
          <button className="btn-pri" onClick={() => navigate('pricing')}>Upgrade to Pro</button>
        </div>
      )}

      <div className="acct-card api-usage">
        <div className="api-usage-h">
          <div>
            <div className="lbl">Monthly API usage</div>
            <div className="api-usage-v"><b>{usage.used.toLocaleString()}</b> / {usage.limit.toLocaleString()} calls</div>
          </div>
          <div className="api-usage-pct">{((usage.used / Math.max(1, usage.limit)) * 100).toFixed(1)}%</div>
        </div>
        <div className="api-bar">
          <div className="api-bar-fill" style={{ width: ((usage.used / Math.max(1, usage.limit)) * 100) + '%' }}></div>
        </div>
        <div className="api-usage-foot">Resets {new Date(Date.now() + 8 * 86400e3).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 14 }}>
        <h3 className="acct-h3" style={{ margin: 0 }}>Your keys</h3>
        <button className="btn-mini" onClick={createKey}>+ Create key</button>
      </div>

      <table className="acct-table">
        <thead><tr><th>Label</th><th>Token (masked)</th><th>Created</th><th>Last used</th><th></th></tr></thead>
        <tbody>
          {keys.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-mute)', fontStyle: 'italic' }}>No keys yet.</td></tr>
          )}
          {keys.map(k => (
            <tr key={k.id}>
              <td><b>{k.label}</b></td>
              <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{k.token.slice(0, 8)}••••{k.token.slice(-4)}</span></td>
              <td>{k.created}</td>
              <td>{k.lastUsed}</td>
              <td>
                <a className="acct-link" onClick={() => { navigator.clipboard?.writeText(k.token); showToast('Token copied'); }}>Copy</a>
                <span style={{ margin: '0 8px', color: 'var(--rule)' }}>·</span>
                <a className="acct-link danger" onClick={() => revoke(k.id)}>Revoke</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="acct-card" style={{ marginTop: 28 }}>
        <div className="acct-card-h">Webhook endpoint</div>
        <p className="acct-card-p">Receive a POST every time one of your codes is scanned.</p>
        <div className="slug-row" style={{ marginTop: 10 }}>
          <span>POST</span>
          <input placeholder="https://your-app.com/qdenty-webhook" />
          <a className="btn-mini-ghost" onClick={() => showToast('Webhook saved')}>Save</a>
        </div>
      </div>
    </>
  );
}

/* ---------- Team ---------- */
function AcctTeam({ state }) {
  const proPlus = hasTier(state, 'elite');
  const members = [
    { name: state.user?.name || 'You', email: state.user?.email || '', role: 'Owner', avatar: 'AM' },
    ...(proPlus ? [
      { name: 'João Ribeiro', email: 'joao@casa.co', role: 'Editor', avatar: 'JR' },
      { name: 'Mari Tanaka', email: 'mari@casa.co', role: 'Viewer', avatar: 'MT' },
    ] : []),
  ];

  return (
    <>
      <AcctHeader title={<>Your <span className="it">team.</span></>} sub="Invite collaborators. Roles control who can edit codes." />

      {!proPlus && (
        <div className="acct-lock-card">
          <div>
            <div className="acct-lock-h">Team seats require Professional</div>
            <div className="acct-lock-p">Up to 5 seats on Pro · unlimited on Atelier · SSO + role-based permissions.</div>
          </div>
          <button className="btn-pri" onClick={() => navigate('pricing')}>Upgrade to Pro</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 className="acct-h3" style={{ margin: 0 }}>Members · {members.length} of 5</h3>
        <button className="btn-mini" onClick={() => {
          if (!proPlus) { showToast('Teams require Professional'); return; }
          showToast('Invite sent · demo');
        }}>+ Invite member</button>
      </div>

      <div className="team-list">
        {members.map((m, i) => (
          <div key={i} className="team-row">
            <div className="team-avatar">{m.avatar}</div>
            <div className="team-info">
              <div className="team-name">{m.name}</div>
              <div className="team-email">{m.email}</div>
            </div>
            <div className="team-role">
              <select defaultValue={m.role} disabled={m.role === 'Owner'}>
                <option>Owner</option>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div>
              {m.role !== 'Owner' && <a className="acct-link danger" onClick={() => showToast('Member removed')}>Remove</a>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Danger zone ---------- */
function AcctDanger({ state }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qdenty-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Account export downloaded');
  };

  const deleteAccount = () => {
    if (!confirm('Delete your account permanently? All codes will be archived and analytics deleted. This cannot be undone.')) return;
    const final = prompt('Type DELETE in capitals to confirm');
    if (final !== 'DELETE') { showToast('Cancelled'); return; }
    localStorage.removeItem('qdenty.state.v2');
    setAppState({ authed: false, user: null, planId: 'guest', codes: [], orders: [] });
    showToast('Account deleted');
    navigate('home');
  };

  return (
    <>
      <AcctHeader title={<>Danger <span className="it">zone.</span></>} sub="Things that are permanent. Be careful." />

      <div className="acct-danger-row">
        <div>
          <div className="acct-card-h">Export your data</div>
          <p className="acct-card-p">Download everything we have on you as JSON — codes, identity, CV, scan history. GDPR / DSAR compliant.</p>
        </div>
        <button className="btn-mini-ghost" onClick={exportData}>Export JSON</button>
      </div>

      <div className="acct-danger-row">
        <div>
          <div className="acct-card-h">Archive all codes</div>
          <p className="acct-card-p">Set every code to "expired". Scanners will see an expired-code page. Reversible within 30 days.</p>
        </div>
        <button className="btn-mini-ghost" onClick={() => {
          if (!confirm('Archive all codes?')) return;
          setAppState(s => ({ ...s, codes: s.codes.map(c => ({ ...c, status: 'exp' })) }));
          showToast('All codes archived');
        }}>Archive all</button>
      </div>

      <div className="acct-danger-row danger">
        <div>
          <div className="acct-card-h danger">Delete account</div>
          <p className="acct-card-p">Permanently delete your account, all codes, and analytics. You can't undo this.</p>
        </div>
        <button className="btn-mini danger" onClick={deleteAccount}>Delete account</button>
      </div>
    </>
  );
}

/* ---------- Shared bits ---------- */
function AcctHeader({ title, sub }) {
  return (
    <div className="acct-section-head">
      <h2 className="acct-h2">{title}</h2>
      <p className="acct-sub">{sub}</p>
    </div>
  );
}

Object.assign(window, { Account });
