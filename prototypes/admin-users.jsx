/* ============ Users management ============ */

function UserDrawer({ user, onClose }) {
  if (!user) return null;
  return (
    <>
      <div className="adm-drawer-bd" onClick={onClose} />
      <aside className="adm-drawer">
        <div className="d-head">
          <div>
            <h3><span className="it">{user.name.split(' ')[0]}</span> {user.name.split(' ').slice(1).join(' ')}</h3>
            <div className="ds">{user.id} · {user.email}</div>
          </div>
          <button className="adm-btn ghost sm" onClick={onClose}>Close ✕</button>
        </div>
        <div className="d-body">
          {/* hero */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '14px 0 22px', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--paper-3), var(--paper-4))', border: '1.5px solid var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22 }}>
              {user.av}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <StatusPill status={user.status} />
                <span className="pill solid no-dot">{user.plan}</span>
                <span className="pill gray no-dot">{user.role}</span>
              </div>
              <div className="mono-tiny">Joined {user.joined} · {user.country} · Last seen {user.last}</div>
            </div>
          </div>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1.5px solid var(--line)', marginTop: 22, marginBottom: 22 }}>
            <div style={{ padding: '16px 18px', borderRight: '1px solid var(--rule)' }}>
              <div className="mono-tiny">MRR Contribution</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, marginTop: 6, fontVariationSettings: '"SOFT" 100' }}>€{user.mrr}</div>
            </div>
            <div style={{ padding: '16px 18px', borderRight: '1px solid var(--rule)' }}>
              <div className="mono-tiny">Codes</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, marginTop: 6 }}>{user.codes}</div>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div className="mono-tiny">Lifetime Scans</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, marginTop: 6, fontVariationSettings: '"SOFT" 100' }}>{fmt.int(user.scans)}</div>
            </div>
          </div>

          {/* sections */}
          <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>Account</h4>
          <div className="dl" style={{ marginBottom: 22 }}>
            <div className="row">User ID</div>
            <div className="row v mono">{user.id}</div>
            <div className="row">Email</div>
            <div className="row v mono">{user.email}</div>
            <div className="row">Plan</div>
            <div className="row v">{user.plan} · €{user.mrr}/mo</div>
            <div className="row">Country / VAT</div>
            <div className="row v">{user.country} · IVA validated</div>
            <div className="row">Two-factor</div>
            <div className="row v it">Enabled · TOTP</div>
            <div className="row">API access</div>
            <div className="row v it">2 keys · 1.2K req/day</div>
          </div>

          <h4 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>Recent activity</h4>
          <div style={{ border: '1.5px solid var(--line)', marginBottom: 22 }}>
            <div className="feed">
              {[
                { ic: '€', col: 'green', msg: 'Paid invoice INV-8472 · €' + user.mrr, when: '2 days ago' },
                { ic: '+', col: 'green', msg: 'Created code "Spring Loyalty"', when: '4 days ago' },
                { ic: '◇', col: 'gold', msg: 'Updated payment method · Visa ··4242', when: '1 week ago' },
                { ic: '↑', col: 'green', msg: 'Upgraded Pro → ' + user.plan, when: '3 weeks ago' },
              ].map((a, i) => (
                <div key={i} className="feed-item">
                  <div className={'f-ico ' + a.col}>{a.ic}</div>
                  <div className="f-body"><div className="f-msg">{a.msg}</div></div>
                  <div className="f-time">{a.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="d-foot">
          <button className="adm-btn ghost" onClick={() => showAdmToast('Magic link sent · expires 15 min')}>Email login link</button>
          <button className="adm-btn ghost danger" onClick={() => showAdmToast('User suspended')}>Suspend</button>
          <button className="adm-btn pri" onClick={() => showAdmToast('Impersonation session started')}>Impersonate ↗</button>
        </div>
      </aside>
    </>
  );
}

function Users() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [drawer, setDrawer] = useState(null);

  const all = adminState.users;
  const filtered = all.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false;
    if (planFilter !== 'all' && u.plan.toLowerCase() !== planFilter) return false;
    if (search && !(u.name + u.email + u.id + u.country).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="adm-page">
      <PageHead
        tag="02 · Business"
        title={<>The <span className="it">people</span> on qdenty.</>}
        sub="Every customer, their plan, their footprint. Click a row to open the full account drawer — impersonate, refund, change plan, send magic links."
        actions={
          <>
            <button className="adm-btn ghost" onClick={() => showAdmToast('CSV export queued')}>Export CSV</button>
            <button className="adm-btn pri" onClick={() => showAdmToast('Invite drafted')}>+ Invite User</button>
          </>
        }
      />

      {/* mini stats */}
      <div className="kpi-grid">
        <KPI label="Total Users" value="18,472" delta="+3.2%" foot="vs. last month" />
        <KPI label="Active · 30d" value="12,384" delta="+1.8%" foot="67% of base" />
        <KPI label="Trial Users" value="284" delta="+12" foot="14-day window" />
        <KPI label="Suspended" value="14" deltaDir="dn" delta="2 today" foot="3 awaiting appeal" />
      </div>

      <div className="panel">
        <div className="tbl-filters">
          {[
            ['all', 'All Users'],
            ['active', 'Active'],
            ['trial', 'On Trial'],
            ['paused', 'Paused'],
            ['suspended', 'Suspended'],
          ].map(([k, l]) => (
            <button key={k} className={'chip-sel ' + (filter === k ? 'on' : '')} onClick={() => setFilter(k)}>
              {l}
              {filter === k && k !== 'all' && <span className="x">✕</span>}
            </button>
          ))}
          <span style={{ width: 1, height: 18, background: 'var(--rule)' }} />
          {[
            ['all', 'Any Plan'],
            ['starter', 'Starter'],
            ['pro', 'Pro'],
            ['atelier', 'Atelier'],
          ].map(([k, l]) => (
            <button key={'p' + k} className={'chip-sel ' + (planFilter === k ? 'on' : '')} onClick={() => setPlanFilter(k)}>{l}</button>
          ))}
          <div className="tf-spacer" />
          <input
            className="tf-search"
            placeholder="Search by name, email, ID, country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <table className="adm-tbl">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>MRR</th>
              <th>Codes</th>
              <th>Lifetime Scans</th>
              <th>Status</th>
              <th>Country</th>
              <th>Last Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} onClick={() => setDrawer(u)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="row-link">
                    <div className={'av-sm ' + u.kind}>{u.av}</div>
                    <div className="stack">
                      <b>{u.name}</b>
                      <span className="sub">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={'pill no-dot ' + (u.plan === 'Atelier' ? 'gold' : u.plan === 'Pro' ? 'orange' : 'gray')}>
                    {u.plan}
                  </span>
                </td>
                <td className="amount"><span className="curr">€</span>{u.mrr}</td>
                <td className="num">{u.codes}</td>
                <td className="num">{fmt.int(u.scans)}</td>
                <td><StatusPill status={u.status} /></td>
                <td className="mono">{u.country}</td>
                <td className="mono" style={{ color: 'var(--ink-mute)' }}>{u.last}</td>
                <td className="r" onClick={e => e.stopPropagation()}>
                  <button className="row-menu" title="Actions">⋯</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 16 }}>
                No users match the current filter.
              </td></tr>
            )}
          </tbody>
        </table>

        <div className="adm-page-bar">
          <span>{filtered.length} of 18,472 users</span>
          <div className="pgs">
            <button disabled>‹ Prev</button>
            <button className="on">1</button>
            <button>2</button>
            <button>3</button>
            <button>…</button>
            <button>1,232</button>
            <button>Next ›</button>
          </div>
          <span>50 per page</span>
        </div>
      </div>

      <UserDrawer user={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

window.Users = Users;
