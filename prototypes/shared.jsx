/* ============ qdenty — shared components ============ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- store ---------- */
const STORAGE_KEY = 'qdenty.state.v2';

/* Plan tiers — qdenty access map.
   user planId → which `tier` markers (free/pro/elite) on items it unlocks */
const USER_RANK = { guest: 0, free: 0, starter: 1, pro: 2, atelier: 3 };
const TIER_RANK = { free: 0, pro: 1, elite: 2 };
function planRank(s) { return USER_RANK[s?.planId || 'guest'] || 0; }
function hasTier(s, tier) { return planRank(s) >= (TIER_RANK[tier] || 0); }
function planLabel(id) {
  return ({ guest: 'Guest', free: 'Free Account', starter: 'Starter', pro: 'Professional', atelier: 'Atelier' })[id] || 'Guest';
}
function requiredPlanFor(tier) {
  return ({ free: 'free', pro: 'starter', elite: 'pro' })[tier] || 'starter';
}

const defaultState = {
  authed: false,
  user: null,
  planId: 'guest',
  codes: [
    { id: 'c01', label: 'My Identity Card', type: 'Identity', created: '2 days ago', scans: 3128, status: 'live', payload: 'https://qdenty.io/u/adelaide', color: '#0f0e0c' },
    { id: 'c02', label: 'Studio Menu — Spring', type: 'Menu', created: '1 week ago', scans: 2041, status: 'live', payload: 'https://qdenty.io/m/casa-spring', color: '#0f0e0c' },
    { id: 'c03', label: 'Résumé · 2026 v3', type: 'CV', created: '3 weeks ago', scans: 412, status: 'live', payload: 'https://qdenty.io/cv/adelaide-2026', color: '#0f0e0c' },
    { id: 'c04', label: 'WiFi · Studio Guest', type: 'WiFi', created: '2 months ago', scans: 1892, status: 'live', payload: 'WIFI:T:WPA;S:CasaEditorial;P:welcome2026;;', color: '#0f0e0c' },
    { id: 'c05', label: 'Café Loyalty · Punch', type: 'Loyalty', created: '2 months ago', scans: 734, status: 'live', payload: 'https://qdenty.io/l/cafe-marlow', color: '#0f0e0c' },
    { id: 'c06', label: 'Event · Spring Launch', type: 'Event', created: '4 months ago', scans: 205, status: 'exp', payload: 'https://qdenty.io/e/spring-launch', color: '#0f0e0c' },
    { id: 'c07', label: 'Portfolio · Draft', type: 'Gallery', created: '5 days ago', scans: 0, status: 'draft', payload: 'https://qdenty.io/p/adelaide-portfolio', color: '#0f0e0c' },
  ],
  identity: {
    name: 'Adelaide Marlow',
    title: 'Editorial Designer · Type',
    pronouns: 'she / her',
    location: 'Lisbon · Portugal',
    email: 'hello@adelaide.co',
    phone: '+351 · 21 · 0188',
    bio: 'Designer working at the seam between editorial type and digital identity. Currently building a small studio for printed objects that talk to phones.',
    links: ['LinkedIn', 'Behance', 'Dribbble', 'GitHub'],
    slug: 'adelaide',
  },
  cv: {
    name: 'Adelaide Marlow',
    title: 'Editorial Designer · Type / Brand',
    email: 'hello@adelaide.co',
    phone: '+351 21 0188',
    location: 'Lisbon, PT · EU',
    summary: "Editorial designer working at the seam between printed type and digital identity. Eight years building books, brands, and small interactive objects for European studios and publishers. Currently leading type direction at Casa Editorial.",
    experience: [
      { role: 'Senior Designer · Type Lead', years: '2022 — Now', co: 'Casa Editorial · Lisbon',
        bullets: ['Direction of two custom typefaces shipped in 2024 and 2025.', 'Rebuilt the studio identity system — adopted across 14 imprints.'] },
      { role: 'Designer', years: '2019 — 2022', co: 'Atelier Plana · Porto',
        bullets: ['Editorial design for Plana Quarterly, a print-and-web magazine.', 'Led brand work for six early-stage hospitality clients.'] },
      { role: 'Junior Designer', years: '2018 — 2019', co: 'Studio Pamphlet · London',
        bullets: ['Production design across catalogues and exhibition graphics.'] },
    ],
    education: [
      { degree: 'MA Visual Communication', school: 'Royal College of Art · London · 2018' },
      { degree: 'BA Graphic Design', school: 'ESAD · Porto · 2015' },
    ],
    skills: ['Type Design', 'Editorial', 'Brand', 'Figma', 'InDesign', 'Glyphs', 'Web · CSS'],
    languages: [
      { name: 'Portuguese', level: 'Native' },
      { name: 'English', level: 'Fluent · C2' },
      { name: 'Spanish', level: 'Working · B2' },
    ],
    projects: [
      { name: 'Plana Quarterly', desc: '16 issues, custom serif, awarded TDC 2023.' },
      { name: 'Casa Sans', desc: 'Sans-serif family in 12 weights, in use by 14 imprints.' },
    ],
    template: 'editorial',
  },
  orders: [],
  apiKeys: [
    { id: 'k01', label: 'Production', token: 'qd_live_8f3a4b2c1d', created: '2026-04-12', lastUsed: '2 days ago' },
  ],
  notifications: {
    scanAlerts: true,
    weeklyDigest: true,
    productNews: false,
    securityAlerts: true,
  },
  apiUsage: { used: 1284, limit: 5000 },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch { return defaultState; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

/* tiny global state */
const listeners = new Set();
let appState = loadState();
function setAppState(patch) {
  appState = typeof patch === 'function' ? patch(appState) : { ...appState, ...patch };
  saveState(appState);
  listeners.forEach(fn => fn(appState));
}
function useAppState() {
  const [s, setS] = useState(appState);
  useEffect(() => { listeners.add(setS); return () => listeners.delete(setS); }, []);
  return [s, setAppState];
}

/* ---------- hash router ---------- */
function useHashRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '') || 'home';
    const [path, ...rest] = h.split('/');
    return { path, params: rest };
  };
  const [route, setRoute] = useState(parse());
  useEffect(() => {
    const onHash = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}
function navigate(path) {
  window.location.hash = '#/' + path.replace(/^\//, '');
}

/* ---------- toast ---------- */
const toastListeners = new Set();
function showToast(msg) {
  toastListeners.forEach(fn => fn(msg));
}
function ToastHost() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const fn = (m) => {
      setMsg(m);
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(() => setMsg(null), 2400);
    };
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  if (!msg) return null;
  return <div className="toast">◆ {msg}</div>;
}

/* ---------- QR Code component (uses qrcode-generator) ---------- */
function QRCode({ value, size = 240, fg = '#0f0e0c', bg = 'transparent', style = 'square', emblem, errorCorrect = 'M', margin = 0 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!window.qrcode) return;
    const text = value && value.length ? value : 'https://qdenty.io';
    const ec = ({ L: 'L', M: 'M', Q: 'Q', H: 'H' })[errorCorrect] || 'M';
    // typeNumber 0 = auto
    const qr = window.qrcode(0, ec);
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const px = size * dpr;
    canvas.width = px; canvas.height = px;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    if (bg === 'transparent') {
      ctx.clearRect(0, 0, px, px);
    } else {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, px, px);
    }
    const m = margin;
    const cell = (px - 2 * m * dpr) / count;
    ctx.fillStyle = fg;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!qr.isDark(r, c)) continue;
        // detect if this cell is part of a finder pattern (corner 7x7)
        const inFinder =
          (r < 7 && c < 7) ||
          (r < 7 && c >= count - 7) ||
          (r >= count - 7 && c < 7);
        const x = m * dpr + c * cell;
        const y = m * dpr + r * cell;
        if (style === 'dot' && !inFinder) {
          ctx.beginPath();
          ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else if (style === 'rounded' && !inFinder) {
          const rad = cell * 0.28;
          roundRect(ctx, x + cell * 0.06, y + cell * 0.06, cell * 0.88, cell * 0.88, rad);
          ctx.fill();
        } else if (style === 'cross' && !inFinder) {
          const w = cell * 0.3;
          ctx.fillRect(x + cell * 0.35, y + cell * 0.05, w, cell * 0.9);
          ctx.fillRect(x + cell * 0.05, y + cell * 0.35, cell * 0.9, w);
        } else {
          // square
          ctx.fillRect(x + cell * 0.04, y + cell * 0.04, cell * 0.92, cell * 0.92);
        }
      }
    }
    // re-draw finder patterns nicely
    if (style !== 'classic') {
      const corners = [[0, 0], [0, count - 7], [count - 7, 0]];
      ctx.fillStyle = bg === 'transparent' ? 'rgba(0,0,0,0)' : bg;
      corners.forEach(([cr, cc]) => {
        const x = m * dpr + cc * cell;
        const y = m * dpr + cr * cell;
        const s7 = cell * 7;
        // clear
        if (bg !== 'transparent') ctx.fillRect(x, y, s7, s7);
        // outer ring
        ctx.fillStyle = fg;
        roundRect(ctx, x, y, s7, s7, cell * 1.2); ctx.fill();
        // inner hole
        ctx.fillStyle = bg === 'transparent' ? 'rgba(255,255,255,1)' : bg;
        if (bg === 'transparent') {
          ctx.globalCompositeOperation = 'destination-out';
          roundRect(ctx, x + cell, y + cell, s7 - 2 * cell, s7 - 2 * cell, cell * 0.8); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        } else {
          roundRect(ctx, x + cell, y + cell, s7 - 2 * cell, s7 - 2 * cell, cell * 0.8); ctx.fill();
        }
        // inner dot
        ctx.fillStyle = fg;
        roundRect(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.6); ctx.fill();
      });
    }
  }, [value, size, fg, bg, style, errorCorrect, margin]);

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
      {emblem && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.22, height: size * 0.22,
          background: bg === 'transparent' ? '#f3efe7' : bg,
          display: 'grid', placeItems: 'center',
          fontFamily: 'Fraunces, serif', fontWeight: 700,
          fontSize: size * 0.13,
          border: `${Math.max(2, size * 0.012)}px solid ${fg}`,
          fontVariationSettings: '"SOFT" 0, "WONK" 1',
          letterSpacing: '-0.04em',
        }}>{emblem}</div>
      )}
    </div>
  );
}
function roundRect(ctx, x, y, w, h, r) {
  if (r > Math.min(w, h) / 2) r = Math.min(w, h) / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- UtilBar ---------- */
function UtilBar() {
  const items = ['Generate Without Login', 'Dynamic Identity Codes', 'Privacy-First Architecture', 'Currently in Beta', 'New · CV Studio v2', 'API Now Public'];
  return (
    <div className="util-bar">
      <span>EST. 2026</span>
      <div className="marquee">
        <div className="marquee-inner">
          {[...items, ...items].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <span>EN · USD</span>
    </div>
  );
}

/* ---------- Nav ---------- */
function Nav({ active, onSignIn }) {
  const [state] = useAppState();
  const items = [
    { id: 'home', label: 'Index' },
    { id: 'templates', label: 'Templates' },
    { id: 'builder', label: 'Generator' },
    { id: 'identity', label: 'Identity' },
    { id: 'cv', label: 'CV Studio' },
    { id: 'pricing', label: 'Tiers' },
  ];
  return (
    <nav className="primary">
      <div className="logo" onClick={() => navigate('home')}>
        qdenty<sup>™ 01</sup>
      </div>
      <ul>
        {items.map(it => (
          <li key={it.id}>
            <a
              className={active === it.id ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate(it.id); }}
            >{it.label}</a>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        {state.authed ? (
          <>
            <UserMenu state={state} active={active} />
            <a className="cta" onClick={() => navigate('builder')}>New Code</a>
          </>
        ) : (
          <>
            <a className="sign-in" onClick={onSignIn}>Sign In</a>
            <a className="cta" onClick={() => navigate('builder')}>Start Free</a>
          </>
        )}
      </div>
    </nav>
  );
}

function UserMenu({ state, active }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const initials = (state.user?.name || state.user?.email || 'U').split(/[\s.@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');
  const planTag = planLabel(state.planId);

  return (
    <div ref={ref} className="user-menu">
      <button
        className={'user-menu-trig' + ((active === 'account' || active === 'dashboard') ? ' on' : '')}
        onClick={() => setOpen(o => !o)}>
        <span className="avatar-pip">{initials || 'U'}</span>
        <span className="u-meta">
          <span className="u-name">{(state.user?.name || 'You').split(' ')[0]}</span>
          <span className="u-plan">{planTag}</span>
        </span>
        <span className="chev">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="user-menu-pop">
          <div className="ump-head">
            <div className="avatar-pip lg">{initials || 'U'}</div>
            <div>
              <div className="ump-name">{state.user?.name || 'You'}</div>
              <div className="ump-email">{state.user?.email || '—'}</div>
              <div className="ump-plan-tag">{planTag} plan</div>
            </div>
          </div>
          <div className="ump-list">
            <a onClick={() => { setOpen(false); navigate('dashboard'); }}>
              <span className="ump-i">▤</span> Dashboard
            </a>
            <a onClick={() => { setOpen(false); navigate('account'); }}>
              <span className="ump-i">●</span> Account &amp; Settings
            </a>
            <a onClick={() => { setOpen(false); navigate('account/billing'); }}>
              <span className="ump-i">$</span> Billing &amp; Invoices
            </a>
            <a onClick={() => { setOpen(false); navigate('account/api'); }}>
              <span className="ump-i">{`</>`}</span> API Keys
            </a>
            <a onClick={() => { setOpen(false); navigate('pricing'); }}>
              <span className="ump-i">⬆</span> Upgrade Plan
            </a>
          </div>
          <div className="ump-sep"></div>
          <a className="ump-signout" onClick={() => {
            setOpen(false);
            setAppState({ authed: false, user: null, planId: 'guest', plan: null });
            navigate('home');
            showToast('Signed out');
          }}>→ Sign out</a>
        </div>
      )}
    </div>
  );
}

/* ---------- Page label ---------- */
function PageLabel({ screen, total = 7, left, right }) {
  return (
    <div className="page-label">
      <span>{left}</span>
      <div className="dots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={'dot' + (i + 1 === screen ? ' on' : '')} />
        ))}
      </div>
      <span>{right}</span>
    </div>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer>
      <div className="ft-mark">
        qdenty<span className="it">.</span>
      </div>
      <div className="ft-grid">
        <div>
          <p className="ft-tagline">"The most ordinary objects deserve extraordinary handshakes."</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(243,239,231,0.5)' }}>— Manifesto · qdenty 2026</p>
        </div>
        <div>
          <h5>Product</h5>
          <ul>
            <li><a onClick={() => navigate('builder')}>Generator</a></li>
            <li><a onClick={() => navigate('templates')}>Templates</a></li>
            <li><a onClick={() => navigate('cv')}>CV Studio</a></li>
            <li><a onClick={() => navigate('identity')}>Identity</a></li>
            <li><a>API</a></li>
          </ul>
        </div>
        <div>
          <h5>Plans</h5>
          <ul>
            <li><a onClick={() => navigate('pricing')}>Guest</a></li>
            <li><a onClick={() => navigate('pricing')}>Free Account</a></li>
            <li><a onClick={() => navigate('pricing')}>Starter</a></li>
            <li><a onClick={() => navigate('pricing')}>Professional</a></li>
            <li><a onClick={() => navigate('pricing')}>Atelier</a></li>
          </ul>
        </div>
        <div>
          <h5>Resources</h5>
          <ul>
            <li><a>Documentation</a></li>
            <li><a>Use Cases</a></li>
            <li><a>Brand Kit</a></li>
            <li><a>Changelog</a></li>
            <li><a>Status</a></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><a>Manifesto</a></li>
            <li><a>Privacy</a></li>
            <li><a>Terms</a></li>
            <li><a>Contact</a></li>
            <li><a>Press Kit</a></li>
          </ul>
        </div>
      </div>
      <div className="ft-bottom">
        <span>© 2026 Mabous Innovations &amp; Engineering Ltd. · qdenty is a product</span>
        <span>Dhaka · Lisbon · Singapore</span>
        <span>v1.2 · build 06</span>
      </div>
    </footer>
  );
}

/* ---------- Sign in modal ---------- */
function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('signin');
  if (!open) return null;
  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { showToast('Enter a valid email'); return; }
    setAppState(s => ({
      ...s,
      authed: true,
      user: { email, name: email.split('@')[0].replace(/\b\w/g, c => c.toUpperCase()) },
      planId: s.planId === 'guest' ? 'free' : s.planId,
    }));
    onClose();
    showToast('Welcome back');
    navigate('dashboard');
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <h3>{mode === 'signin' ? <>Welcome <span className="it">back.</span></> : <>Create <span className="it">account.</span></>}</h3>
        <p>{mode === 'signin' ? 'Pick up where you left off.' : 'Free forever — dynamic codes & analytics included.'}</p>
        <form className="form-stack" onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@studio.co" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" defaultValue="demo" />
          </div>
          <button className="btn-pri full-btn" type="submit">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="alt">
          {mode === 'signin' ? (
            <>No account? <b onClick={() => setMode('signup')}>Create one</b></>
          ) : (
            <>Already have one? <b onClick={() => setMode('signin')}>Sign in</b></>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { QRCode, UtilBar, Nav, PageLabel, Footer, SignInModal, ToastHost, useHashRoute, navigate, useAppState, setAppState, showToast, hasTier, planRank, planLabel, requiredPlanFor, USER_RANK, TIER_RANK });
