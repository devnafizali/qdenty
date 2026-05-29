/* ============ Screen 04 — Identity public profile ============ */

function Identity() {
  const [state] = useAppState();
  const id = state.identity;
  const profileUrl = `https://qdenty.io/u/${id.slug}`;

  const actions = [
    { label: 'Save vCard', pri: true, fn: () => {
      const blob = new Blob([buildPayload('vcard', id)], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${id.name.replace(/\s+/g, '-').toLowerCase()}.vcf`;
      a.click(); URL.revokeObjectURL(url);
      showToast('Contact downloaded');
    }},
    { label: 'Email', fn: () => { window.location.href = `mailto:${id.email}`; } },
    { label: 'Call', fn: () => { window.location.href = `tel:${id.phone.replace(/[^+0-9]/g, '')}`; } },
    { label: 'WhatsApp', fn: () => showToast('Opens WhatsApp · demo') },
    { label: 'Share Profile', fn: () => {
      if (navigator.share) navigator.share({ url: profileUrl, title: id.name });
      else { navigator.clipboard?.writeText(profileUrl); showToast('Link copied'); }
    }},
    { label: 'Download Résumé', fn: () => navigate('cv') },
  ];

  return (
    <>
      <PageLabel screen={4} left="SCREEN 04 — IDENTITY PROFILE (the hosted page behind a scan)" right={`PUBLIC URL · qdenty.io/u/${id.slug}`} />
      <section className="screen">
        <div className="screen-tag"><b>§ 04</b>Identity Profile</div>

        <div className="identity-page" style={{ padding: '24px 0 0' }}>
          <div className="identity-frame">
            <div className="identity-card">
              <div className="ic-head">
                <div className="ic-logo">qdenty<sup>™</sup></div>
                <div className="ic-verified">✓ Verified</div>
              </div>
              <div className="ic-avatar" style={id.avatar ? { backgroundImage: `url(${id.avatar})` } : {}} data-initials={id.name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')} />
              <div className="ic-name">{id.name.split(' ').slice(0, -1).join(' ')} <span className="it">{id.name.split(' ').slice(-1)[0]}</span></div>
              <div className="ic-role">{id.title}</div>

              <div className="ic-contact-mini">
                <div><span className="lbl">@</span><span>{id.email}</span></div>
                <div><span className="lbl">☏</span><span>{id.phone}</span></div>
                <div><span className="lbl">◉</span><span>{id.location}</span></div>
              </div>

              <div className="ic-qr-row">
                <div className="ic-qr">
                  <QRCode value={profileUrl} size={116} fg="#0f0e0c" bg="#f3efe7" style="rounded" />
                </div>
                <div className="ic-qr-l">
                  <div className="ic-qr-h">Scan to <span className="it">connect</span></div>
                  <div className="ic-qr-p">Save contact · open profile · share back</div>
                </div>
              </div>

              <div className="ic-foot">
                <span>ID · #A4-{(id.slug.charCodeAt(0) * 91 % 9999).toString().padStart(4, '0')}</span>
                <span>Issued · {new Date().getFullYear()}</span>
              </div>
            </div>

            <div className="identity-info">
              <h2>The page <span className="it">behind</span> your code.</h2>
              <p className="ii-lede">
                Every Identity QR points to a hosted, editable profile page. Update your number, add a new portfolio, change your job — the code never changes. Scanners always see the latest version.
              </p>

              <div className="ii-list">
                <div className="row"><div className="k">Display Name</div><div className="v">{id.name}</div></div>
                <div className="row"><div className="k">Pronouns</div><div className="v it">{id.pronouns}</div></div>
                <div className="row"><div className="k">Title</div><div className="v">{id.title.split('·')[0].trim()}</div></div>
                <div className="row"><div className="k">Location</div><div className="v">{id.location}</div></div>
                <div className="row"><div className="k">Email</div><div className="v">{id.email}</div></div>
                <div className="row"><div className="k">Phone</div><div className="v">{id.phone}</div></div>
                <div className="row" style={{ gridColumn: 'span 2' }}>
                  <div className="k">Linked Profiles</div>
                  <div className="v">{id.links.join(' · ')}</div>
                </div>
                <div className="row"><div className="k">Code Validity</div><div className="v it">lifetime</div></div>
                <div className="row"><div className="k">Last Updated</div><div className="v">2 days ago</div></div>
              </div>

              <div className="action-bar">
                {actions.map((a, i) => (
                  <button key={i} className={a.pri ? 'pri' : ''} onClick={a.fn}>{a.label}</button>
                ))}
                <button className="pri" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', marginLeft: 'auto' }} onClick={() => navigate('preview/identity')}>
                  ↗ Preview as visitor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============ Screen 05 — CV Studio ============ */

const CV_TEMPLATES = [
  { id: 'editorial', name: 'Editorial', tag: 'default', locked: false },
  { id: 'modern', name: 'Modern', tag: 'free', locked: false },
  { id: 'atelier', name: 'Atelier', tag: 'two-col', locked: true },
];

function CVStudio() {
  const [state] = useAppState();
  const cv = state.cv;
  const template = cv.template || 'editorial';
  const setTemplate = (t) => setAppState(s => ({ ...s, cv: { ...s.cv, template: t } }));
  const cvUrl = `https://qdenty.io/cv/${state.identity.slug}`;

  const atelierLocked = !hasTier(state, 'pro');

  return (
    <>
      <PageLabel screen={5} left="SCREEN 05 — CV STUDIO" right="AUTH OPTIONAL · DYNAMIC LINK FOR LOGGED-IN USERS" />
      <section className="screen" id="cv">
        <div className="screen-tag"><b>§ 05</b>CV / Résumé Studio</div>

        <div className="cv-frame">
          <div className="cv-side">
            <h2>The <span className="it">résumé</span><br />that updates itself.</h2>
            <p>
              Build once. Edit anywhere. The QR on your printed CV always points to the latest version — no more "this is an old draft, sorry."
            </p>

            <div className="cv-templates">
              <div className={'tmp' + (template === 'editorial' ? ' on' : '')} onClick={() => setTemplate('editorial')}>
                <div className="tmp-h">Adelaide <span className="it">Marlow</span></div>
                <div className="tmp-role">Editorial Designer</div>
                <div className="tmp-divider"></div>
                <div className="row2">
                  <div className="blk"></div>
                  <div className="col">
                    <div className="ln full"></div><div className="ln full"></div><div className="ln s"></div>
                  </div>
                </div>
                <div className="ln" style={{ width: '30%', background: 'var(--ink)', marginTop: 8 }}></div>
                <div className="ln full"></div>
                <div className="ln full"></div>
                <div className="ln s"></div>
                <div className="tmp-name"><b>Editorial</b> · default</div>
              </div>

              <div className={'tmp' + (template === 'modern' ? ' on' : '')} onClick={() => setTemplate('modern')}>
                <div className="tmp-h">Adelaide Marlow</div>
                <div className="tmp-role">— Editorial / Type</div>
                <div className="ln" style={{ background: 'var(--accent)', height: 4, width: '100%', marginTop: 4 }}></div>
                <div className="ln" style={{ width: '20%', background: 'var(--ink)', height: 6, marginTop: 8 }}></div>
                <div className="ln full"></div>
                <div className="ln full"></div>
                <div className="ln s"></div>
                <div className="ln" style={{ width: '25%', background: 'var(--ink)', height: 6, marginTop: 6 }}></div>
                <div className="ln full"></div>
                <div className="ln s"></div>
                <div className="tmp-name"><b>Modern</b> · free</div>
              </div>

              <div className={'tmp atl-mini' + (template === 'atelier' ? ' on' : '') + (atelierLocked ? ' locked' : '')}
                   onClick={() => {
                     if (atelierLocked) {
                       showToast('Atelier template requires Starter+ plan');
                       navigate('pricing');
                     } else {
                       setTemplate('atelier');
                     }
                   }} style={atelierLocked ? {} : { cursor: 'pointer' }}>
                <div className="atl-mini-ord">N°<span>01</span></div>
                <div className="atl-mini-eyebrow">— Curriculum Vitæ</div>
                <div className="atl-mini-name">
                  <span>Adelaide</span>
                  <span className="ln">Marlow</span>
                </div>
                <div className="atl-mini-rule"><span></span><span>◆</span><span></span></div>
                <div className="atl-mini-role">Editorial · Type</div>
                <div className="atl-mini-body">
                  <div className="ln full"></div>
                  <div className="ln full"></div>
                  <div className="ln s"></div>
                </div>
                <div className="atl-mini-section">
                  <span>I.</span>
                  <div className="ln" style={{ width: '60%' }}></div>
                </div>
                <div className="ln full"></div>
                <div className="ln s"></div>
                <div className="atl-mini-section">
                  <span>II.</span>
                  <div className="ln" style={{ width: '50%' }}></div>
                </div>
                <div className="ln full"></div>
                <div className="atl-mini-seal">★</div>
                <div className="tmp-name"><b>Atelier</b> · premium folio</div>
              </div>
            </div>

            <div style={{ marginTop: 48, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <a className="btn-pri" onClick={() => navigate('cv-builder')}>Start CV Builder</a>
              <a className="btn-sec" onClick={() => navigate('preview/cv')}>↗ Preview as visitor</a>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>3 templates · 2 free</span>
            </div>

            <div className="cv-included">
              <div className="cv-included-head">
                <div className="lbl">— What's included</div>
                <h5>Made for paper. <span className="it">Built</span> for phones.</h5>
                <p>Every CV you publish on qdenty is a hosted page <i>and</i> a printable document. Same QR, same URL, always current.</p>
              </div>
              <ul className="cv-included-list">
                {[
                  { ico: '✦', t: 'AI summary writer',       d: 'Distills your experience into 3–4 polished lines.', tier: 'pro' },
                  { ico: '◈', t: 'ATS-friendly export',     d: 'PDF that parses cleanly in every applicant tracker.', tier: 'free' },
                  { ico: '↓', t: 'PDF · DOCX · Web',        d: 'Three formats, one source. Same QR points to all.', tier: 'free' },
                  { ico: '⌘', t: 'Multi-language',          d: 'Keep an EN and a PT version under one slug.', tier: 'free' },
                  { ico: '⟳', t: 'Version history',         d: 'Roll back any edit. See what changed between drafts.', tier: 'pro' },
                  { ico: '◉', t: 'Recruiter view tracking', d: 'Know who scanned, when, and what they opened.', tier: 'pro' },
                ].map((f, i) => (
                  <li key={i} className={'cvi-' + f.tier}>
                    <span className="cvi-ico">{f.ico}</span>
                    <div className="cvi-text">
                      <span className="cvi-t">{f.t}</span>
                      <span className="cvi-d">{f.d}</span>
                    </div>
                    <span className={'cvi-tier cvi-tier-' + f.tier}>{f.tier === 'pro' ? 'Pro' : 'Free'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CV doc preview · live from cv state */}
          <CVDocLive cv={cv} cvUrl={cvUrl} template={template} />
        </div>
      </section>
    </>
  );
}

/* ============ Screen 06 — Pricing ============ */

const TIERS = [
  {
    id: 'guest',
    name: 'Guest', desc: 'For one-off codes. No account, no email, no fuss.',
    monthly: 0, annual: 0, label: 'free', period: 'No login required',
    validity: 'Validity · forever (static codes)',
    features: [
      { t: <>Up to <b>3 codes per session</b></> },
      { t: 'Static codes only' },
      { t: '6 basic templates' },
      { t: 'PNG download · 600px' },
      { t: 'No analytics', no: true },
      { t: 'No editing after generation', no: true },
      { t: 'No custom colours / logo', no: true },
    ],
    cta: 'Generate Now', route: 'builder',
  },
  {
    id: 'free',
    name: <>Free <span className="it">Account</span></>, desc: 'Personal use. Save codes, edit them, basic dynamic links.',
    monthly: 0, annual: 0, label: 'free', period: 'Per month · forever',
    validity: 'Validity · 12 months per dynamic code',
    features: [
      { t: <>Up to <b>10 saved codes</b></> },
      { t: <><b>2 dynamic codes</b> · editable</> },
      { t: 'All free templates (12)' },
      { t: 'PNG · JPG · SVG download' },
      { t: 'Basic scan analytics · 30 days' },
      { t: '1 Identity Page + 1 CV' },
      { t: 'No custom branding', no: true },
    ],
    cta: 'Create Account', signin: true,
  },
  {
    id: 'starter',
    name: 'Starter', desc: 'For creators, freelancers, side projects. Everything dynamic.',
    monthly: 8, annual: 6, label: 'mo',
    period: 'Billed annually · $72/yr',
    validity: 'Validity · 3 years per code',
    tag: 'Popular',
    features: [
      { t: <>Up to <b>50 codes</b> · all dynamic</> },
      { t: 'All 22 templates unlocked' },
      { t: 'PDF · EPS · vector exports' },
      { t: 'Logo + custom colours' },
      { t: 'Scan analytics · 12 months' },
      { t: 'Geo & device breakdowns' },
      { t: '3 CV templates · ATS check' },
      { t: 'Custom domain redirect' },
    ],
    cta: 'Start Starter',
  },
  {
    id: 'pro',
    name: 'Professional', desc: 'Small businesses & teams. Unlimited generation with team controls.',
    monthly: 25, annual: 19, label: 'mo',
    period: 'Billed annually · $228/yr',
    validity: 'Validity · lifetime, codes never expire',
    featured: true, tag: 'Recommended',
    features: [
      { t: <><b>Unlimited dynamic codes</b></> },
      { t: <>Up to <b>5 team seats</b></> },
      { t: 'All templates + bulk generation' },
      { t: 'API access · 5,000 calls/mo' },
      { t: 'White-label landing pages' },
      { t: 'Full analytics + CSV export' },
      { t: 'All 12 CV templates' },
      { t: 'Password-protected codes' },
      { t: 'Priority support · 24h SLA' },
    ],
    cta: 'Go Professional',
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <PageLabel screen={6} left="SCREEN 06 — TIERS & PRICING" right="3 PAID TIERS + GUEST + FREE LOGIN" />
      <section className="screen" id="pricing">
        <div className="screen-tag"><b>§ 06</b>Pricing Tiers</div>

        <div className="pricing-head">
          <div className="eyebrow">Five tiers · no surprises</div>
          <h2>Pay for <span className="it">power,</span><br />not for paper.</h2>
          <p>Generate without signing in. Make an account for dynamic codes. Subscribe when you need volume, validity, or analytics.</p>
        </div>

        <div className="billing-toggle">
          <div className="tg">
            <span className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Monthly</span>
            <span className={annual ? 'on' : ''} onClick={() => setAnnual(true)}>Annual</span>
          </div>
          <span className="save">save up to 32%</span>
        </div>

        <div className="price-grid">
          {TIERS.map((t, i) => (
            <div key={i} className={'price-tier' + (t.featured ? ' featured' : '')}>
              {t.tag && <span className="pt-tag">{t.tag}</span>}
              <div className="pt-name">{t.name}</div>
              <div className="pt-desc">{t.desc}</div>
              <div className="pt-price">
                <span className="amount">{annual ? t.annual : t.monthly}</span>
                <span className="curr">{t.monthly === 0 ? 'free' : '/' + t.label}</span>
              </div>
              <div className="pt-period">{t.period}</div>
              <div className="pt-validity">{t.validity}</div>
              <ul className="feat-list">
                {t.features.map((f, j) => (
                  <li key={j} className={f.no ? 'no' : ''}>{f.t}</li>
                ))}
              </ul>
              <a className="pt-cta" onClick={() => {
                if (t.signin) document.dispatchEvent(new CustomEvent('qd:openSignIn'));
                else if (t.route) navigate(t.route);
                else {
                  setAppState({ checkout: { planId: t.id, annual } });
                  navigate('checkout');
                }
              }}>{t.cta}</a>
            </div>
          ))}
        </div>

        <div className="atelier-row">
          <div>
            <div className="lbl">Parent Company · Enterprise</div>
            <h3>Mabous Innovations<br /><span className="it">&amp; Engineering Ltd.</span></h3>
            <p style={{ color: 'var(--ink-mute)', fontSize: 14, marginTop: 8, textWrap: 'pretty' }}>
              The studio behind qdenty. For enterprise rollouts — events, hospitality, retail, education, government — talk to us about custom plans, on-prem hosting, and SLAs.
            </p>
          </div>
          <ul>
            {['Unlimited seats', 'SSO / SAML', 'Dedicated CSM', 'On-prem option',
              'Custom SLA · 4h', 'Audit logs · SOC2', 'Unlimited API', 'Custom integrations']
              .map((l, i) => <li key={i}>— {l}</li>)}
          </ul>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Dhaka · Lisbon</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>Talk to us</div>
            <a className="btn-pri" style={{ marginTop: 12 }} onClick={() => showToast('Calendar opens · demo')}>Book a Call</a>
          </div>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { Identity, CVStudio, Pricing, CV_TEMPLATES, TIERS });
