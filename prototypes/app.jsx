/* ============ Screen 07 — Dashboard ============ */

function Sparkline({ pts, dim }) {
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 64, h = 26;
  const pad = 1.5;
  const stepX = (w - pad * 2) / (pts.length - 1);
  const norm = (v) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
  const linePath = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${norm(v)}`).join(' ');
  const areaPath = linePath + ` L ${pad + (pts.length - 1) * stepX} ${h} L ${pad} ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`}>
      <path className="area" d={areaPath} />
      <path d={linePath} />
      <circle cx={pad + (pts.length - 1) * stepX} cy={norm(last)} r="1.6" fill={dim ? 'var(--ink-mute)' : 'var(--accent)'} stroke="var(--paper-2)" strokeWidth="0.8" />
    </svg>
  );
}

function RowActionsMenu({ code }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const doEdit = () => {
    setAppState({ pendingTemplate: { it: code.type } });
    navigate('builder');
  };
  const doOpen = () => {
    if (code.type === 'Identity') navigate('preview/identity');
    else if (code.type === 'CV') navigate('preview/cv');
    else showToast('Opens public page · ' + (code.payload.startsWith('http') ? code.payload : code.label));
  };
  const doDuplicate = () => {
    const dup = { ...code, id: 'c' + Date.now().toString(36), label: code.label + ' (copy)', scans: 0, status: 'draft', created: 'just now' };
    setAppState(s => ({ ...s, codes: [dup, ...s.codes] }));
    showToast('Code duplicated');
  };
  const doCopyLink = () => {
    navigator.clipboard?.writeText(code.payload);
    showToast('Payload copied');
  };
  const doDownload = () => showToast('Re-downloading PNG · demo');
  const doAnalytics = () => showToast('Analytics drill-down · demo');
  const doDelete = () => {
    if (!confirm(`Delete "${code.label}" permanently? This cannot be undone.`)) return;
    setAppState(s => ({ ...s, codes: s.codes.filter(c => c.id !== code.id) }));
    showToast('Code deleted');
  };

  return (
    <div ref={ref} className={'row-actions' + (open ? ' open' : '')}>
      <button className="row-actions-btn" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} title="Actions">⋯</button>
      {open && (
        <div className="row-actions-menu" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setOpen(false); doEdit(); }}>
            <span className="ra-i">✎</span> Edit code
          </button>
          <button onClick={() => { setOpen(false); doOpen(); }}>
            <span className="ra-i">↗</span> Open public page
          </button>
          <button onClick={() => { setOpen(false); doAnalytics(); }}>
            <span className="ra-i">▤</span> View analytics
          </button>
          <div className="row-actions-sep"></div>
          <button onClick={() => { setOpen(false); doDuplicate(); }}>
            <span className="ra-i">⎘</span> Duplicate
          </button>
          <button onClick={() => { setOpen(false); doCopyLink(); }}>
            <span className="ra-i">⌥</span> Copy payload
          </button>
          <button onClick={() => { setOpen(false); doDownload(); }}>
            <span className="ra-i">↓</span> Download PNG
          </button>
          <div className="row-actions-sep"></div>
          <button className="danger" onClick={() => { setOpen(false); doDelete(); }}>
            <span className="ra-i">✕</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [state] = useAppState();
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  // require auth
  useEffect(() => {
    if (!state.authed) {
      // auto sign in for demo
      setAppState({ authed: true, user: { email: 'adelaide@casa.co', name: 'Adelaide' } });
    }
  }, []);

  const codes = state.codes.filter(c =>
    !search || (c.label + c.type + c.payload).toLowerCase().includes(search.toLowerCase())
  );
  const visible = showAll ? codes : codes.slice(0, 7);

  const totalScans = state.codes.reduce((s, c) => s + (c.scans || 0), 0);
  const liveCodes = state.codes.filter(c => c.status === 'live').length;

  const bars = [22, 38, 30, 52, 45, 68, 60, 74, 58, 82, 70, 92, 88, 76, 100];

  return (
    <>
      <PageLabel screen={7} left="SCREEN 07 — ACCOUNT DASHBOARD (post-login)" right={`AUTHED · ${state.user?.name?.toUpperCase() || 'STARTER'} · STARTER PLAN`} />
      <section className="screen" style={{ background: 'var(--paper-2)' }}>
        <div className="screen-tag"><b>§ 07</b>Dashboard</div>

        <div className="uc-head" style={{ marginBottom: 32 }}>
          <h2>Your <span className="it">codes,</span> at a glance.</h2>
          <div className="uc-intro">
            <span className="lbl">After login · Starter tier example</span>
            Every code you've created, with live scan counts, edit access, and analytics. Pin frequent ones, archive expired ones, replace destinations in two clicks.
          </div>
        </div>

        <div className="dash-frame">
          <div className="dash-top">
            <div className="dh-ttl">
              Hello, <span className="it">{state.user?.name || 'Adelaide'}</span> — you have {liveCodes} active codes.
            </div>
            <div className="dh-search">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search codes, labels, URLs…"
              />
              <span className="kbd">⌘ K</span>
            </div>
            <a className="dh-new" onClick={() => navigate('builder')}>+ New Code</a>
          </div>

          <div className="dash-metrics">
            <div className="m">
              <Sparkline pts={[18, 22, 30, 28, 42, 48, 56, 62, 58, 78, 90]} />
              <div className="lbl">Total Scans · 30d</div>
              <div className="val">{totalScans.toLocaleString()}</div>
              <div className="delta">↗ +12.4% vs last 30d</div>
            </div>
            <div className="m">
              <Sparkline pts={[2, 2, 3, 3, 4, 5, 5, 6, 7, 7, liveCodes]} />
              <div className="lbl">Active Codes</div>
              <div className="val">
                {liveCodes}<span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink-mute)', marginLeft: 6 }}>of 50</span>
              </div>
              <div className="delta">↗ 3 added this week</div>
            </div>
            <div className="m dim">
              <Sparkline pts={[28, 32, 30, 34, 36, 38, 40, 42, 41, 42, 42]} dim />
              <div className="lbl">Top Country</div>
              <div className="val" style={{ fontSize: 32 }}>Portugal</div>
              <div className="delta">42% of scans</div>
            </div>
            <div className="m dim">
              <div className="lbl">Plan</div>
              <div className="val" style={{ fontSize: 32 }}>{state.plan || 'Starter'}</div>
              {state.plan ? (
                <div className="delta">↗ Active · all features unlocked</div>
              ) : (
                <div className="delta dn" style={{ cursor: 'pointer' }} onClick={() => navigate('pricing')}>Upgrade unlocks unlimited ↗</div>
              )}
            </div>
          </div>

          <div className="dash-body">
            <div className="dash-table-wrap">
              <h3>
                Your Codes
                <span className="all" onClick={() => setShowAll(s => !s)}>
                  {showAll ? 'Show Less ←' : 'View All →'}
                </span>
              </h3>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Scans</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(c => (
                    <tr key={c.id} style={c.status === 'exp' ? { opacity: 0.55 } : c.status === 'draft' ? { opacity: 0.65 } : {}}>
                      <td>
                        <span className="qr-thumb">
                          <QRCode value={c.payload} size={28} fg="#0f0e0c" bg="#f3efe7" style="square" />
                        </span>
                        {c.label}
                      </td>
                      <td><span className="type-pill">{c.type}</span></td>
                      <td>{c.created}</td>
                      <td className="scans">{c.scans ? c.scans.toLocaleString() : '—'}</td>
                      <td><span className={'status ' + c.status}>{c.status === 'live' ? 'Live' : c.status === 'exp' ? 'Expired' : 'Draft'}</span></td>
                      <td className="row-actions"><RowActionsMenu code={c} /></td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--ink-mute)', fontStyle: 'italic' }}>No codes match "{search}"</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="dash-side">
              <h3>Scan Activity · 30d</h3>
              <div className="scan-chart">
                {bars.map((h, i) => (
                  <div key={i} className={'bar' + (i === bars.length - 1 ? ' peak' : '')} style={{ height: h + '%' }} title={`Day ${i+1}: ${h * 8 | 0} scans`} />
                ))}
              </div>
              <div className="scan-chart-axis">
                <span>APR 20</span>
                <span>MAY 20</span>
              </div>

              <h3>Top Geographies</h3>
              <ul className="geo-list">
                {[
                  ['Portugal', 'PT', 82, 42],
                  ['Spain', 'ES', 56, 28],
                  ['United Kingdom', 'UK', 32, 14],
                  ['Germany', 'DE', 22, 9],
                  ['Other · 24 countries', '··', 12, 7],
                ].map(([n, fl, w, p], i) => (
                  <li key={i}>
                    <span className="flag">{fl}</span>
                    <span style={{ flex: '0 0 auto', minWidth: 110 }}>{n}</span>
                    <span className="geo-bar" style={{ '--w': w + '%' }}></span>
                    <span className="pct">{p}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============ App root ============ */

function App() {
  const route = useHashRoute();
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const fn = () => setSignInOpen(true);
    document.addEventListener('qd:openSignIn', fn);
    return () => document.removeEventListener('qd:openSignIn', fn);
  }, []);

  let screen = null;
  switch (route.path) {
    case 'home': screen = <Landing />; break;
    case 'templates': screen = <Templates />; break;
    case 'builder': screen = <Builder />; break;
    case 'identity': screen = <Identity />; break;
    case 'cv': screen = <CVStudio />; break;
    case 'cv-builder': screen = <CVBuilder />; break;
    case 'pricing': screen = <Pricing />; break;
    case 'dashboard': screen = <Dashboard />; break;
    case 'account': screen = <Account />; break;
    case 'preview':
      screen = route.params[0] === 'cv' ? <CVPreview /> : <IdentityPreview />;
      break;
    case 'checkout':
      screen = route.params[0] === 'success' ? <CheckoutSuccess /> : <Checkout />;
      break;
    default: screen = <Landing />;
  }

  return (
    <>
      <UtilBar />
      <Nav active={route.path} onSignIn={() => setSignInOpen(true)} />
      <main>{screen}</main>
      <Footer />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <ToastHost />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
