/* ============ qdenty admin — shared utilities ============ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- hash router ---------- */
function useAdminRoute() {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '') || 'dashboard';
    const [path, ...params] = h.split('/');
    return { path, params };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const h = () => setRoute(parse());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
}
function adminGo(path) { window.location.hash = '#/' + path; }

/* ---------- toast ---------- */
let toastTrigger = null;
function showAdmToast(msg, kind = 'ok') {
  toastTrigger && toastTrigger({ msg, kind, id: Date.now() });
}
function AdmToastHost() {
  const [t, setT] = useState(null);
  useEffect(() => {
    toastTrigger = (next) => {
      setT(next);
      setTimeout(() => setT(c => c && c.id === next.id ? null : c), 2600);
    };
    return () => { toastTrigger = null; };
  }, []);
  if (!t) return null;
  return (
    <div className="toast" style={{ boxShadow: t.kind === 'err' ? '6px 6px 0 #b91c1c' : '6px 6px 0 var(--accent)' }}>
      <span>{t.msg}</span>
    </div>
  );
}

/* ---------- mock data store ---------- */
const adminState = {
  metrics: {
    mrr: 48280,
    mrrPrev: 42910,
    arr: 579360,
    users: 18472,
    usersPrev: 17891,
    activeUsers: 12384,
    codes: 124891,
    codesPrev: 121034,
    scans30d: 1284910,
    scans30dPrev: 1109442,
    revenue30d: 58420,
    revenue30dPrev: 51290,
    churn: 2.4,
    churnPrev: 3.1,
    refunds30d: 1240,
    pendingPayouts: 12480,
    avgRevPerUser: 26.10,
    failedTx: 12,
  },
  revenueSeries: [
    { d: 'Apr 24', v: 1420, n: 1280 },
    { d: 'Apr 27', v: 1680, n: 1390 },
    { d: 'Apr 30', v: 1520, n: 1410 },
    { d: 'May 03', v: 1810, n: 1540 },
    { d: 'May 06', v: 2010, n: 1680 },
    { d: 'May 09', v: 1880, n: 1720 },
    { d: 'May 12', v: 2240, n: 1830 },
    { d: 'May 15', v: 2480, n: 1980 },
    { d: 'May 18', v: 2690, n: 2120 },
    { d: 'May 21', v: 2920, n: 2240 },
    { d: 'May 23', v: 3180, n: 2380 },
  ],
  plans: [
    { id: 'starter', name: 'Starter', price: 9, users: 8420, mrr: 12480, churn: 3.2 },
    { id: 'pro', name: 'Professional', price: 29, users: 4128, mrr: 24840, churn: 1.9 },
    { id: 'atelier', name: 'Atelier', price: 89, users: 218, mrr: 9420, churn: 0.8 },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', users: 24, mrr: 1540, churn: 0.0 },
  ],
  users: [
    { id: 'u_8f3a4', name: 'Adelaide Marlow', email: 'hello@adelaide.co', plan: 'Atelier', country: 'PT', joined: '2024-08-12', last: '2 min ago', status: 'active', mrr: 89, codes: 12, scans: 18420, role: 'Owner', av: 'AM', kind: 'a1' },
    { id: 'u_2c4b8', name: 'Tomás Vieira', email: 't.vieira@casa.co', plan: 'Pro', country: 'PT', joined: '2025-01-04', last: '14 min ago', status: 'active', mrr: 29, codes: 7, scans: 5240, role: 'Member', av: 'TV', kind: 'a2' },
    { id: 'u_9d2e1', name: 'Mireille Conrad', email: 'mireille@plana.fr', plan: 'Pro', country: 'FR', joined: '2024-11-22', last: '1 hr ago', status: 'active', mrr: 29, codes: 18, scans: 12480, role: 'Owner', av: 'MC', kind: 'a3' },
    { id: 'u_5a1c2', name: 'James Holloway', email: 'james@pamphlet.studio', plan: 'Starter', country: 'UK', joined: '2025-02-18', last: '3 hrs ago', status: 'active', mrr: 9, codes: 3, scans: 482, role: 'Owner', av: 'JH', kind: 'a4' },
    { id: 'u_7e8d3', name: 'Lena Maier', email: 'lena@maier.de', plan: 'Pro', country: 'DE', joined: '2024-09-30', last: 'Yesterday', status: 'active', mrr: 29, codes: 9, scans: 3280, role: 'Owner', av: 'LM', kind: 'a1' },
    { id: 'u_3b6f9', name: 'Cosimo Rinaldi', email: 'c.rinaldi@studio.it', plan: 'Atelier', country: 'IT', joined: '2024-06-15', last: '2 days ago', status: 'active', mrr: 89, codes: 22, scans: 18920, role: 'Owner', av: 'CR', kind: 'a2' },
    { id: 'u_1a2b3', name: 'Sophie Dubois', email: 'sophie@dubois.fr', plan: 'Starter', country: 'FR', joined: '2025-04-01', last: '1 week ago', status: 'trial', mrr: 0, codes: 1, scans: 28, role: 'Owner', av: 'SD', kind: 'a3' },
    { id: 'u_4c5d6', name: 'Ana Beatriz', email: 'ana.b@beatriz.pt', plan: 'Pro', country: 'PT', joined: '2024-12-08', last: '12 min ago', status: 'active', mrr: 29, codes: 5, scans: 1840, role: 'Member', av: 'AB', kind: 'a4' },
    { id: 'u_8e9f0', name: 'Olivier Faure', email: 'olivier@faure.fr', plan: 'Pro', country: 'FR', joined: '2025-01-22', last: '30 min ago', status: 'active', mrr: 29, codes: 4, scans: 920, role: 'Owner', av: 'OF', kind: 'a1' },
    { id: 'u_2f3a8', name: 'Henrik Borg', email: 'henrik@borg.se', plan: 'Atelier', country: 'SE', joined: '2024-07-29', last: '4 hrs ago', status: 'active', mrr: 89, codes: 14, scans: 7240, role: 'Owner', av: 'HB', kind: 'a2' },
    { id: 'u_5g6h7', name: 'Eva Schmidt', email: 'eva.s@schmidt.at', plan: 'Pro', country: 'AT', joined: '2025-03-11', last: '1 hr ago', status: 'active', mrr: 29, codes: 6, scans: 1428, role: 'Owner', av: 'ES', kind: 'a3' },
    { id: 'u_9i0j1', name: 'Marco Bianchi', email: 'marco@bianchi.it', plan: 'Starter', country: 'IT', joined: '2025-04-22', last: '6 hrs ago', status: 'paused', mrr: 0, codes: 2, scans: 184, role: 'Owner', av: 'MB', kind: 'a4' },
    { id: 'u_3k4l5', name: 'Inês Rocha', email: 'ines@rocha.pt', plan: 'Pro', country: 'PT', joined: '2024-10-05', last: '20 min ago', status: 'active', mrr: 29, codes: 11, scans: 4820, role: 'Owner', av: 'IR', kind: 'a1' },
    { id: 'u_6m7n8', name: 'Jakub Nowak', email: 'jakub@nowak.pl', plan: 'Starter', country: 'PL', joined: '2025-03-28', last: '8 hrs ago', status: 'active', mrr: 9, codes: 2, scans: 218, role: 'Owner', av: 'JN', kind: 'a2' },
    { id: 'u_0o1p2', name: 'Camille Bernard', email: 'camille@bernard.fr', plan: 'Pro', country: 'FR', joined: '2024-08-30', last: 'Yesterday', status: 'active', mrr: 29, codes: 8, scans: 2940, role: 'Owner', av: 'CB', kind: 'a3' },
  ],
  transactions: [
    { id: 'tx_9aF2k', user: 'Adelaide Marlow', email: 'hello@adelaide.co', amount: 89.00, fee: 2.91, net: 86.09, gw: 'Stripe', method: 'Visa · 4242', status: 'settled', date: '2026-05-23 14:22', kind: 'subscription', desc: 'Atelier · monthly' },
    { id: 'tx_3bH7m', user: 'Tomás Vieira', email: 't.vieira@casa.co', amount: 29.00, fee: 1.14, net: 27.86, gw: 'Stripe', method: 'Visa · 1834', status: 'settled', date: '2026-05-23 13:58', kind: 'subscription', desc: 'Pro · monthly' },
    { id: 'tx_1nP4q', user: 'Mireille Conrad', email: 'mireille@plana.fr', amount: 29.00, fee: 0.93, net: 28.07, gw: 'Stripe SEPA', method: 'SEPA · IBAN ··2918', status: 'settled', date: '2026-05-23 11:12', kind: 'subscription', desc: 'Pro · monthly' },
    { id: 'tx_8tQ5r', user: 'Cosimo Rinaldi', email: 'c.rinaldi@studio.it', amount: 89.00, fee: 2.91, net: 86.09, gw: 'Stripe', method: 'Mastercard · 5081', status: 'settled', date: '2026-05-23 09:44', kind: 'subscription', desc: 'Atelier · monthly' },
    { id: 'tx_2vY1z', user: 'James Holloway', email: 'james@pamphlet.studio', amount: 9.00, fee: 0.51, net: 8.49, gw: 'PayPal', method: 'PayPal · holloway', status: 'settled', date: '2026-05-22 22:18', kind: 'subscription', desc: 'Starter · monthly' },
    { id: 'tx_6wL3s', user: 'Lena Maier', email: 'lena@maier.de', amount: 29.00, fee: 0.99, net: 28.01, gw: 'Stripe SEPA', method: 'SEPA · IBAN ··0418', status: 'settled', date: '2026-05-22 18:02', kind: 'subscription', desc: 'Pro · monthly' },
    { id: 'tx_5xK8d', user: 'Inês Rocha', email: 'ines@rocha.pt', amount: 29.00, fee: 1.14, net: 27.86, gw: 'Stripe', method: 'Visa · 9012', status: 'settled', date: '2026-05-22 15:48', kind: 'subscription', desc: 'Pro · monthly' },
    { id: 'tx_4yJ0n', user: 'Marco Bianchi', email: 'marco@bianchi.it', amount: 9.00, fee: 0.51, net: 8.49, gw: 'Stripe', method: 'Visa · 7821', status: 'failed', date: '2026-05-22 12:30', kind: 'subscription', desc: 'Starter · monthly — declined' },
    { id: 'tx_7zM5b', user: 'Henrik Borg', email: 'henrik@borg.se', amount: 890.00, fee: 26.71, net: 863.29, gw: 'Stripe', method: 'Bank transfer', status: 'settled', date: '2026-05-21 11:18', kind: 'one-time', desc: 'Atelier · annual prepay' },
    { id: 'tx_0fG2h', user: 'Sophie Dubois', email: 'sophie@dubois.fr', amount: 0.00, fee: 0, net: 0, gw: '—', method: 'Trial', status: 'trial', date: '2026-05-20 09:00', kind: 'trial-start', desc: 'Starter · 14-day trial' },
    { id: 'tx_8hH4j', user: 'Eva Schmidt', email: 'eva.s@schmidt.at', amount: 29.00, fee: 0.99, net: 28.01, gw: 'Stripe SEPA', method: 'SEPA · IBAN ··7724', status: 'settled', date: '2026-05-19 16:42', kind: 'subscription', desc: 'Pro · monthly' },
    { id: 'tx_9iI8k', user: 'Olivier Faure', email: 'olivier@faure.fr', amount: -29.00, fee: -1.14, net: -27.86, gw: 'Stripe', method: 'Visa · 3315', status: 'refunded', date: '2026-05-18 14:08', kind: 'refund', desc: 'Pro · monthly — full refund issued' },
    { id: 'tx_1jJ0l', user: 'Ana Beatriz', email: 'ana.b@beatriz.pt', amount: 29.00, fee: 1.14, net: 27.86, gw: 'Stripe', method: 'Visa · 8842', status: 'settled', date: '2026-05-18 10:24', kind: 'subscription', desc: 'Pro · monthly' },
  ],
  countries: [
    { c: 'Portugal', code: 'PT', users: 4820, mrr: 18420, x: 38, y: 52 },
    { c: 'France', code: 'FR', users: 3210, mrr: 11240, x: 44, y: 38 },
    { c: 'Spain', code: 'ES', users: 2840, mrr: 8920, x: 39, y: 50 },
    { c: 'Germany', code: 'DE', users: 2120, mrr: 6840, x: 47, y: 33 },
    { c: 'Italy', code: 'IT', users: 1840, mrr: 5240, x: 48, y: 46 },
    { c: 'United Kingdom', code: 'UK', users: 1480, mrr: 4180, x: 42, y: 28 },
    { c: 'Netherlands', code: 'NL', users: 740, mrr: 2120, x: 46, y: 30 },
    { c: 'Sweden', code: 'SE', users: 520, mrr: 1480, x: 49, y: 18 },
    { c: 'United States', code: 'US', users: 480, mrr: 1420, x: 18, y: 38 },
    { c: 'Other', code: 'XX', users: 422, mrr: 980, x: 70, y: 60 },
  ],
  activity: [
    { kind: 'signup', who: 'Sofia Almeida', what: 'signed up for Pro', when: '12s ago', tag: '+€29 MRR', color: 'green' },
    { kind: 'payment', who: 'Adelaide Marlow', what: 'paid invoice #INV-8472', when: '4m ago', tag: 'Stripe · €89', color: 'green' },
    { kind: 'refund', who: 'Olivier Faure', what: 'requested refund · auto-approved', when: '12m ago', tag: '–€29', color: 'orange' },
    { kind: 'churn', who: 'Pierre Dubois', what: 'downgraded Pro → Starter', when: '34m ago', tag: '–€20 MRR', color: 'orange' },
    { kind: 'flagged', who: 'System', what: 'flagged code c_8472 for review · phishing pattern', when: '52m ago', tag: 'Auto-paused', color: 'red' },
    { kind: 'webhook', who: 'Stripe', what: 'invoice.payment_failed for u_4yJ0n', when: '1h ago', tag: 'Retry scheduled', color: 'gold' },
    { kind: 'upgrade', who: 'Henrik Borg', what: 'upgraded Pro → Atelier (annual)', when: '2h ago', tag: '+€890', color: 'green' },
    { kind: 'gw', who: 'PayPal', what: 'gateway reported elevated decline rate · 4.2%', when: '3h ago', tag: 'Auto-failover ready', color: 'gold' },
  ],
  gateways: [
    { id: 'stripe', name: 'Stripe', tagline: 'Cards · Apple Pay · Google Pay', logo: 'S', status: 'live', vol30d: 48280, tx30d: 1280, fees: 'EU 1.4% + €0.25', regions: 'Global', primary: true },
    { id: 'stripe-sepa', name: 'Stripe SEPA', tagline: 'European bank debit', logo: 'S€', status: 'live', vol30d: 12840, tx30d: 482, fees: '0.8% capped €5', regions: 'EU only', primary: false },
    { id: 'paypal', name: 'PayPal', tagline: 'PayPal · venmo (US)', logo: 'PP', status: 'live', vol30d: 8210, tx30d: 218, fees: '2.9% + €0.35', regions: 'Global', primary: false },
    { id: 'mollie', name: 'Mollie', tagline: 'iDEAL · Bancontact · giropay', logo: 'M', status: 'standby', vol30d: 0, tx30d: 0, fees: '1.8% + €0.25', regions: 'EU only', primary: false },
    { id: 'wise', name: 'Wise Business', tagline: 'Payouts · multi-currency', logo: 'W', status: 'live', vol30d: 0, tx30d: 0, fees: '0.43% FX', regions: 'Global', primary: false },
    { id: 'adyen', name: 'Adyen', tagline: 'Enterprise · global cards', logo: 'A', status: 'disabled', vol30d: 0, tx30d: 0, fees: 'Custom', regions: 'Global', primary: false },
  ],
  automations: [
    { id: 'a01', name: 'Failed payment recovery', desc: 'Retry declined cards on day 1, 3, 7 — then dunning email + grace 14d.', status: 'active', runs: 482, success: 312, kind: 'billing' },
    { id: 'a02', name: 'Welcome sequence', desc: 'On signup → 3-step product tour over 7 days · pause when user upgrades.', status: 'active', runs: 1284, success: 1240, kind: 'lifecycle' },
    { id: 'a03', name: 'Phishing-pattern auto-pause', desc: 'Flag any code redirecting to known phishing patterns → auto-pause + alert ops.', status: 'active', runs: 18, success: 18, kind: 'security' },
    { id: 'a04', name: 'Daily revenue digest', desc: 'Email daily reconciliation to accounting@qdenty.io at 09:00 UTC.', status: 'active', runs: 142, success: 142, kind: 'reporting' },
    { id: 'a05', name: 'Annual upsell offer', desc: 'When monthly user reaches 11 months → offer 2-month discount on annual prepay.', status: 'active', runs: 142, success: 38, kind: 'revenue' },
    { id: 'a06', name: 'VAT MOSS quarterly export', desc: 'Generate VAT MOSS report per EU country every quarter → upload to drive.', status: 'paused', runs: 4, success: 4, kind: 'tax' },
    { id: 'a07', name: 'Inactive user reactivation', desc: 'After 30d no scan → re-engagement email with template suggestion.', status: 'active', runs: 820, success: 84, kind: 'lifecycle' },
  ],
  invoices: [
    { id: 'INV-8472', user: 'Adelaide Marlow', amount: 89.00, status: 'paid', date: '2026-05-23', due: '2026-05-23' },
    { id: 'INV-8471', user: 'Tomás Vieira', amount: 29.00, status: 'paid', date: '2026-05-23', due: '2026-05-23' },
    { id: 'INV-8470', user: 'Mireille Conrad', amount: 29.00, status: 'paid', date: '2026-05-23', due: '2026-05-23' },
    { id: 'INV-8469', user: 'Cosimo Rinaldi', amount: 89.00, status: 'paid', date: '2026-05-23', due: '2026-05-23' },
    { id: 'INV-8468', user: 'James Holloway', amount: 9.00, status: 'paid', date: '2026-05-22', due: '2026-05-22' },
    { id: 'INV-8467', user: 'Marco Bianchi', amount: 9.00, status: 'overdue', date: '2026-05-22', due: '2026-05-22' },
    { id: 'INV-8466', user: 'Lena Maier', amount: 29.00, status: 'paid', date: '2026-05-22', due: '2026-05-22' },
  ],
  codes: [
    { id: 'c_8472', label: 'Casa Editorial · Spring Menu', user: 'Adelaide Marlow', type: 'Menu', scans: 18420, status: 'live', created: '2024-08-12', risk: 'low' },
    { id: 'c_2918', label: 'Plana Quarterly · Issue 16', user: 'Mireille Conrad', type: 'Gallery', scans: 12480, status: 'live', created: '2024-11-22', risk: 'low' },
    { id: 'c_5821', label: 'Studio Pamphlet · Loyalty', user: 'James Holloway', type: 'Loyalty', scans: 482, status: 'live', created: '2025-02-18', risk: 'low' },
    { id: 'c_0418', label: 'Maier Atelier · Identity', user: 'Lena Maier', type: 'Identity', scans: 3280, status: 'live', created: '2024-09-30', risk: 'low' },
    { id: 'c_7724', label: 'Schmidt Studio · CV', user: 'Eva Schmidt', type: 'CV', scans: 1428, status: 'live', created: '2025-03-11', risk: 'low' },
    { id: 'c_4129', label: 'unverified-promo · suspicious', user: '—', type: 'URL', scans: 12, status: 'flagged', created: '2026-05-22', risk: 'high' },
    { id: 'c_9301', label: 'Café Marlow · Event', user: 'Adelaide Marlow', type: 'Event', scans: 205, status: 'expired', created: '2026-01-15', risk: 'low' },
    { id: 'c_3340', label: 'Borg & Sons · Identity', user: 'Henrik Borg', type: 'Identity', scans: 7240, status: 'live', created: '2024-07-29', risk: 'low' },
  ],
};

/* ---------- formatters ---------- */
const fmt = {
  money: (n, curr = '€') => curr + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  int: (n) => n.toLocaleString('en-US'),
  signed: (n) => (n > 0 ? '+' : '') + n.toFixed(1) + '%',
  pct: (a, b) => {
    if (!b) return '+0.0%';
    const v = ((a - b) / b) * 100;
    return (v > 0 ? '+' : '') + v.toFixed(1) + '%';
  },
};

/* ---------- nav definition ---------- */
const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', count: null, ico: <svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="5" height="6" /><rect x="9.5" y="1.5" width="5" height="3" /><rect x="9.5" y="6.5" width="5" height="8" /><rect x="1.5" y="9.5" width="5" height="5" /></svg> },
    { id: 'reports', label: 'Reports', count: null, ico: <svg viewBox="0 0 16 16"><path d="M2 14 L2 2 M2 14 L14 14" /><path d="M4 11 L7 7 L9 9 L13 4" /><circle cx="13" cy="4" r="1" fill="currentColor" stroke="none" /></svg> },
  ]},
  { group: 'Business', items: [
    { id: 'users', label: 'Users', count: '18.4K', ico: <svg viewBox="0 0 16 16"><circle cx="6" cy="5" r="2.4" /><path d="M2 14 Q6 9 10 14" /><circle cx="12" cy="6" r="1.8" /><path d="M9.5 13 Q12 10 14.5 13" /></svg> },
    { id: 'sites', label: 'Site Management', count: '124K', ico: <svg viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" /><path d="M1.5 5.5 L14.5 5.5" /><circle cx="3.5" cy="4" r="0.5" fill="currentColor" stroke="none" /><circle cx="5" cy="4" r="0.5" fill="currentColor" stroke="none" /></svg> },
    { id: 'billing', label: 'Billing', count: '€48K', ico: <svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" /><path d="M1.5 6.5 L14.5 6.5" /><rect x="3" y="9" width="3" height="1.5" /></svg> },
    { id: 'transactions', label: 'Transactions', count: '12', ico: <svg viewBox="0 0 16 16"><path d="M2 5 L13 5 L11 3 M14 11 L3 11 L5 13" /></svg>, alert: true },
    { id: 'accounting', label: 'Accounting', count: null, ico: <svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" /><path d="M2 6 L14 6 M2 10 L14 10 M6 2 L6 14 M10 2 L10 14" strokeWidth="1" opacity="0.5" /></svg> },
  ]},
  { group: 'Configuration', items: [
    { id: 'gateways', label: 'Payment Gateways', count: '6', ico: <svg viewBox="0 0 16 16"><rect x="1.5" y="4.5" width="13" height="7" /><path d="M1.5 7 L14.5 7" /><circle cx="11.5" cy="9.5" r="1" /></svg> },
    { id: 'automation', label: 'Automation', count: '7', ico: <svg viewBox="0 0 16 16"><circle cx="4" cy="4" r="2" /><circle cx="12" cy="12" r="2" /><path d="M5.5 5.5 L10.5 10.5 M10 3 L13 3 M13 3 L13 6" /></svg> },
    { id: 'settings', label: 'Settings', count: null, ico: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.4" /><path d="M8 1.5 L8 3.5 M8 12.5 L8 14.5 M1.5 8 L3.5 8 M12.5 8 L14.5 8 M3.5 3.5 L4.9 4.9 M11.1 11.1 L12.5 12.5 M12.5 3.5 L11.1 4.9 M4.9 11.1 L3.5 12.5" /></svg> },
  ]},
];

const ROUTE_LABEL = {
  dashboard: 'Dashboard',
  reports: 'Reports',
  users: 'Users',
  sites: 'Site Management',
  billing: 'Billing',
  transactions: 'Transactions',
  accounting: 'Accounting',
  gateways: 'Payment Gateways',
  automation: 'Automation',
  settings: 'Settings',
};

/* ---------- Sidebar ---------- */
function Sidebar({ active }) {
  return (
    <aside className="adm-side">
      <div className="adm-brand">
        <div className="lg">qdenty<sup>CTL</sup></div>
        <div className="lg-tag">Admin</div>
      </div>
      <div className="adm-user">
        <div className="av">A</div>
        <div className="uinfo">
          <div className="uname">Adelaide Marlow</div>
          <div className="urole">Super Admin · ops</div>
        </div>
        <div className="ind" title="Online" />
      </div>
      <nav>
        <ul className="adm-nav">
          {NAV.map(g => (
            <React.Fragment key={g.group}>
              <li className="group-h">{g.group}</li>
              {g.items.map(it => (
                <li key={it.id}>
                  <a
                    className={active === it.id ? 'on' : ''}
                    onClick={() => adminGo(it.id)}
                  >
                    <span className="ico">{it.ico}</span>
                    <span>{it.label}</span>
                    {it.alert && <span className="dot" title="Needs attention" />}
                    {!it.alert && it.count && <span className="count">{it.count}</span>}
                  </a>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </nav>
      <div className="adm-side-foot">
        <div className="sf-row"><span>System</span><span className="ok">All Healthy</span></div>
        <div className="sf-row"><span>Build</span><span>v2.18.4</span></div>
        <div className="sf-row"><span>Region</span><span>eu-west-1</span></div>
      </div>
    </aside>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ active }) {
  const label = ROUTE_LABEL[active] || 'Dashboard';
  return (
    <header className="adm-top">
      <div className="crumb">
        <span>Control</span>
        <span className="sep">/</span>
        <b>{label}</b>
      </div>
      <div className="search">
        <svg width="12" height="12" viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.6"><circle cx="7" cy="7" r="5" /><path d="M11 11 L14 14" strokeLinecap="round" /></svg>
        <input placeholder="Search users, transactions, codes, invoices…" />
        <span className="kbd">⌘ K</span>
      </div>
      <div className="top-actions">
        <span className="env live"><span className="ind" />Live</span>
        <span className="ic-btn" title="Notifications">
          <svg viewBox="0 0 16 16"><path d="M4 11 L4 7 Q4 4 8 4 Q12 4 12 7 L12 11 L13 12 L3 12 Z M7 13 Q7 14 8 14 Q9 14 9 13" /></svg>
          <span className="dot" />
        </span>
        <span className="ic-btn" title="Help">
          <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M6.5 6.5 Q6.5 5 8 5 Q9.5 5 9.5 6.5 Q9.5 7.5 8 8.5 L8 9.5" strokeLinecap="round" /><circle cx="8" cy="11.5" r="0.4" fill="currentColor" stroke="none" /></svg>
        </span>
      </div>
    </header>
  );
}

/* ---------- Charts ---------- */
function LineChart({ data, height = 220, keys = ['v', 'n'], colors = ['var(--ink)', 'var(--accent)'], dashed = [false, false] }) {
  const max = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)));
  const pad = { t: 10, r: 12, b: 8, l: 36 };
  const w = 800;
  const h = height - pad.t - pad.b;
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const norm = (v) => pad.t + h - (v / max) * h;

  const buildPath = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${norm(d[key] || 0)}`).join(' ');

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <div className="chart-canvas">
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
        {/* grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.l} y1={norm(t)} x2={w - pad.r} y2={norm(t)}
              stroke="var(--rule)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '2 4'}
            />
            <text x={pad.l - 8} y={norm(t) + 4} fontSize="9" fill="var(--ink-mute)" textAnchor="end" fontFamily="var(--mono)">
              {t >= 1000 ? (t / 1000).toFixed(1) + 'k' : t}
            </text>
          </g>
        ))}
        {/* area for first series */}
        <path
          d={buildPath(keys[0]) + ` L ${pad.l + (data.length - 1) * stepX} ${pad.t + h} L ${pad.l} ${pad.t + h} Z`}
          fill="var(--ink)"
          opacity="0.05"
        />
        {/* lines */}
        {keys.map((k, i) => (
          <path
            key={k}
            d={buildPath(k)}
            stroke={colors[i]}
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={dashed[i] ? '4 4' : '0'}
          />
        ))}
        {/* dots on last point */}
        {keys.map((k, i) => (
          <circle
            key={k + '-c'}
            cx={pad.l + (data.length - 1) * stepX}
            cy={norm(data[data.length - 1][k])}
            r="3"
            fill={colors[i]}
            stroke="var(--paper)"
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
}

function Sparkline({ pts, accent = false }) {
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 200, h = 36;
  const pad = 2;
  const stepX = (w - pad * 2) / (pts.length - 1);
  const norm = (v) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
  const linePath = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${norm(v)}`).join(' ');
  const areaPath = linePath + ` L ${pad + (pts.length - 1) * stepX} ${h} L ${pad} ${h} Z`;
  return (
    <div className="spk">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path className="area" d={areaPath} />
        <path className={'line' + (accent ? ' accent' : '')} d={linePath} />
        <circle cx={pad + (pts.length - 1) * stepX} cy={norm(pts[pts.length - 1])} r="2" />
      </svg>
    </div>
  );
}

function Donut({ value, total, label, color = 'var(--accent)' }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const pct = value / total;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="var(--paper-3)" strokeWidth="14" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke={color} strokeWidth="14"
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="butt"
        />
      </svg>
      <div className="ctr">
        <div>
          <div className="b">{(pct * 100).toFixed(0)}%</div>
          <div className="s">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page header ---------- */
function PageHead({ tag, title, sub, actions }) {
  return (
    <div className="adm-page-head">
      <div className="ph-l">
        <div className="ph-tag">{tag}</div>
        <h1>{title}</h1>
        {sub && <div className="ph-sub">{sub}</div>}
      </div>
      {actions && <div className="ph-r">{actions}</div>}
    </div>
  );
}

/* ---------- KPI ---------- */
function KPI({ label, value, unit, currency, delta, deltaDir = 'up', foot, icon }) {
  return (
    <div className="kpi">
      <div className="k-head">
        <span>{label}</span>
        {icon && <span className="ico">{icon}</span>}
      </div>
      <div className="k-val">
        {currency && <span className="curr">{currency}</span>}
        <span>{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="k-foot">
        {delta && <span className={deltaDir === 'up' ? 'd-up' : 'd-dn'}>{delta}</span>}
        <span>{foot}</span>
      </div>
    </div>
  );
}

/* ---------- Status pill helpers ---------- */
function StatusPill({ status }) {
  const map = {
    active: ['green', 'Active'],
    trial: ['gold', 'Trial'],
    paused: ['gray', 'Paused'],
    suspended: ['red', 'Suspended'],
    settled: ['green', 'Settled'],
    failed: ['red', 'Failed'],
    refunded: ['orange', 'Refunded'],
    pending: ['gold', 'Pending'],
    'trial-start': ['gold', 'Trial Start'],
    paid: ['green', 'Paid'],
    overdue: ['red', 'Overdue'],
    draft: ['gray', 'Draft'],
    live: ['green', 'Live'],
    expired: ['gray', 'Expired'],
    flagged: ['red', 'Flagged'],
    standby: ['gold', 'Standby'],
    disabled: ['gray', 'Disabled'],
  };
  const [cls, label] = map[status] || ['gray', status];
  return <span className={'pill ' + cls}>{label}</span>;
}

/* expose */
Object.assign(window, {
  useAdminRoute, adminGo,
  showAdmToast, AdmToastHost,
  adminState, fmt,
  Sidebar, TopBar, PageHead, KPI,
  LineChart, Sparkline, Donut,
  StatusPill,
  useState, useEffect, useRef, useMemo, useCallback,
});
