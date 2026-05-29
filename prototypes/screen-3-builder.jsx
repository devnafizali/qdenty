/* ============ Screen 03 — Builder (functional QR generator) ============ */

const BUILDER_TYPES = [
  { id: 'url', label: 'Plain URL', tier: 'free', fields: ['url'] },
  { id: 'vcard', label: 'Personal vCard', tier: 'free', fields: ['name', 'title', 'email', 'phone'] },
  { id: 'identity', label: 'Identity Page', tier: 'free', fields: ['name', 'title', 'bio', 'email', 'phone', 'avatar', 'links'] },
  { id: 'cv', label: 'Résumé / CV', tier: 'free', fields: ['name', 'title', 'cvLink'] },
  { id: 'business', label: 'Business Card', tier: 'free', fields: ['name', 'title', 'company', 'email', 'phone'] },
  { id: 'wifi', label: 'WiFi', tier: 'free', fields: ['ssid', 'wifiPass', 'wifiAuth'] },
  { id: 'menu', label: 'Menu', tier: 'pro', fields: ['restaurant', 'menuUrl'] },
  { id: 'payment', label: 'Payment', tier: 'pro', fields: ['payProvider', 'payHandle'] },
  { id: 'event', label: 'Event Ticket', tier: 'pro', fields: ['eventName', 'eventDate', 'eventVenue'] },
  { id: 'pet', label: 'Pet Tag', tier: 'free', fields: ['petName', 'ownerName', 'phone'] },
  { id: 'property', label: 'Property', tier: 'pro', fields: ['propertyAddr', 'propertyUrl'] },
  { id: 'loyalty', label: 'Loyalty', tier: 'pro', fields: ['businessName', 'punchTotal'] },
  { id: 'bulk', label: 'Bulk Codes', tier: 'elite', fields: [] },
  { id: 'geo', label: 'Geo / Multi', tier: 'elite', fields: [] },
];

const STYLES = [
  { id: 'square', label: 'Square', tier: 'free' },
  { id: 'rounded', label: 'Rounded', tier: 'free' },
  { id: 'dot', label: 'Dots', tier: 'free' },
  { id: 'cross', label: 'Cross', tier: 'pro' },
  { id: 'organic', label: 'Atelier', tier: 'elite' },
];

const COLORS = [
  { hex: '#0f0e0c', name: 'Ink' },
  { hex: '#c2410c', name: 'Burnt' },
  { hex: '#1e3a2b', name: 'Forest' },
  { hex: '#8a6d2c', name: 'Gold' },
  { hex: '#1a3a8a', name: 'Indigo' },
];

const FORMATS = [
  { id: 'png', label: 'PNG', tier: 'free' },
  { id: 'jpg', label: 'JPG', tier: 'free' },
  { id: 'svg', label: 'SVG', tier: 'pro' },
  { id: 'pdf', label: 'PDF', tier: 'pro' },
  { id: 'eps', label: 'EPS', tier: 'elite' },
];

const TIER_LBL = { free: 'FREE', pro: 'STARTER+', elite: 'PRO+' };

function buildPayload(type, data) {
  switch (type) {
    case 'url': return data.url || 'https://qdenty.io';
    case 'vcard':
    case 'business':
      return [
        'BEGIN:VCARD', 'VERSION:3.0',
        `FN:${data.name || ''}`,
        data.company ? `ORG:${data.company}` : '',
        `TITLE:${data.title || ''}`,
        data.email ? `EMAIL:${data.email}` : '',
        data.phone ? `TEL:${data.phone}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    case 'identity':
      return `https://qdenty.io/u/${(data.name || 'anon').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`;
    case 'cv': return data.cvLink || `https://qdenty.io/cv/${(data.name || 'anon').toLowerCase().replace(/\s+/g, '-')}`;
    case 'wifi': return `WIFI:T:${data.wifiAuth || 'WPA'};S:${data.ssid || 'Network'};P:${data.wifiPass || ''};;`;
    case 'menu': return data.menuUrl || `https://qdenty.io/m/${(data.restaurant || 'menu').toLowerCase().replace(/\s+/g, '-')}`;
    case 'payment': return `${data.payProvider || 'PAY'}:${data.payHandle || ''}`;
    case 'event': return `BEGIN:VEVENT\nSUMMARY:${data.eventName || ''}\nDTSTART:${data.eventDate || ''}\nLOCATION:${data.eventVenue || ''}\nEND:VEVENT`;
    case 'pet': return `https://qdenty.io/pet/${(data.petName || 'pet').toLowerCase().replace(/\s+/g, '-')}`;
    case 'property': return data.propertyUrl || `https://qdenty.io/p/${(data.propertyAddr || 'home').toLowerCase().slice(0, 20).replace(/\s+/g, '-')}`;
    case 'loyalty': return `https://qdenty.io/l/${(data.businessName || 'shop').toLowerCase().replace(/\s+/g, '-')}`;
    case 'bulk': return `https://qdenty.io/bulk/atelier-preview`;
    case 'geo': return `https://qdenty.io/geo/atelier-preview`;
    default: return 'https://qdenty.io';
  }
}

function StyleIcon({ id }) {
  // tiny pictogram per style
  if (id === 'square') return (
    <svg viewBox="0 0 32 32"><g fill="#0f0e0c">
      {[0,1,2,4,6,7].map(c => <rect key={'a'+c} x={c*4} y={0} width="3" height="3"/>)}
      {[0,2,3,5,7].map(c => <rect key={'b'+c} x={c*4} y={4} width="3" height="3"/>)}
      {[1,2,4,6].map(c => <rect key={'c'+c} x={c*4} y={8} width="3" height="3"/>)}
      {[0,3,5,7].map(c => <rect key={'d'+c} x={c*4} y={12} width="3" height="3"/>)}
      {[1,2,4,6,7].map(c => <rect key={'e'+c} x={c*4} y={16} width="3" height="3"/>)}
      {[0,2,5,7].map(c => <rect key={'f'+c} x={c*4} y={20} width="3" height="3"/>)}
      {[0,1,3,4,6].map(c => <rect key={'g'+c} x={c*4} y={24} width="3" height="3"/>)}
      {[0,2,3,5,7].map(c => <rect key={'h'+c} x={c*4} y={28} width="3" height="3"/>)}
    </g></svg>
  );
  if (id === 'dot') return (
    <svg viewBox="0 0 32 32"><g fill="#0f0e0c">
      {Array.from({length: 7}).flatMap((_, r) =>
        Array.from({length: 7}).map((__, c) =>
          (r * 13 + c * 7) % 3 ? <circle key={r+'-'+c} cx={2 + c*4.5} cy={2 + r*4.5} r="1.8"/> : null
        )
      )}
    </g></svg>
  );
  if (id === 'rounded') return (
    <svg viewBox="0 0 32 32"><g fill="#0f0e0c">
      {Array.from({length: 7}).flatMap((_, r) =>
        Array.from({length: 7}).map((__, c) =>
          (r * 11 + c * 5) % 2 ? <rect key={r+'-'+c} x={1 + c*4.5} y={1 + r*4.5} width="3.2" height="3.2" rx="1.2"/> : null
        )
      )}
    </g></svg>
  );
  if (id === 'cross') return (
    <svg viewBox="0 0 32 32"><g fill="#0f0e0c">
      {Array.from({length: 6}).flatMap((_, r) =>
        Array.from({length: 6}).map((__, c) => (
          (r * 9 + c * 7) % 3 ? (
            <g key={r+'-'+c} transform={`translate(${2 + c*5}, ${2 + r*5})`}>
              <rect x="1.4" y="0" width="0.8" height="3.6"/>
              <rect x="0" y="1.4" width="3.6" height="0.8"/>
            </g>
          ) : null
        ))
      )}
    </g></svg>
  );
  return (
    <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#6b6660" strokeDasharray="2 2"/></svg>
  );
}

function Builder() {
  const [state] = useAppState();
  const initialType = state.pendingTemplate?.it === 'CV' ? 'cv'
    : state.pendingTemplate?.it === 'Card' ? 'business'
    : state.pendingTemplate?.it === 'Menu' ? 'menu'
    : state.pendingTemplate?.it === 'Access' ? 'wifi'
    : state.pendingTemplate?.it === 'ID Tag' ? 'pet'
    : state.pendingTemplate?.icon === 'identity' ? 'identity'
    : 'identity';
  const [typeId, setTypeId] = useState(initialType);
  const type = BUILDER_TYPES.find(t => t.id === typeId);
  const [style, setStyle] = useState('rounded');
  const [fg, setFg] = useState('#0f0e0c');
  const [format, setFormat] = useState('png');
  const [data, setData] = useState({
    name: 'Adelaide Marlow',
    title: 'Editorial Designer',
    email: 'hello@adelaide.co',
    phone: '+351 21 0188',
    bio: '',
    url: 'https://qdenty.io',
    company: 'Casa Editorial',
    ssid: 'CasaGuest',
    wifiPass: 'welcome2026',
    wifiAuth: 'WPA',
    restaurant: 'Casa Editorial',
    menuUrl: '',
    payProvider: 'paypal',
    payHandle: '@adelaide',
    eventName: 'Spring Launch',
    eventDate: '20260520T180000',
    eventVenue: 'Casa Editorial',
    petName: 'Tinta',
    ownerName: 'Adelaide Marlow',
    propertyAddr: '12 Rua das Flores, Lisbon',
    propertyUrl: '',
    businessName: 'Café Marlow',
    punchTotal: 10,
    cvLink: '',
    links: ['LinkedIn', 'GitHub', 'Portfolio'],
    avatar: null,
    bulkCsv: null,
    geoRules: null,
  });

  const payload = useMemo(() => buildPayload(typeId, data), [typeId, data]);

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleType = (t) => {
    if (!hasTier(state, t.tier)) {
      showToast(`Requires ${requiredPlanFor(t.tier).toUpperCase()} plan`);
      setAppState({ checkout: { planId: requiredPlanFor(t.tier), annual: true } });
      navigate('pricing');
      return;
    }
    setTypeId(t.id);
  };

  const handleStyle = (s) => {
    if (!hasTier(state, s.tier)) {
      showToast(`Requires ${requiredPlanFor(s.tier).toUpperCase()} plan`);
      navigate('pricing');
      return;
    }
    setStyle(s.id);
  };

  const handleFormat = (f) => {
    if (!hasTier(state, f.tier)) {
      showToast(`Requires ${requiredPlanFor(f.tier).toUpperCase()} plan`);
      navigate('pricing');
      return;
    }
    setFormat(f.id);
  };

  const customHexAllowed = hasTier(state, 'pro'); // Starter+

  const handleSave = () => {
    // download the QR
    const canvas = document.querySelector('#prev-qr-canvas canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qdenty-${typeId}-${Date.now()}.${format === 'jpg' ? 'jpg' : 'png'}`;
      link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
      link.click();
    }
    // also push into codes
    const newCode = {
      id: 'c' + Date.now().toString(36),
      label: data.name ? `${data.name} · ${type.label}` : type.label,
      type: type.label,
      created: 'just now',
      scans: 0,
      status: 'live',
      payload,
      color: fg,
      style,
    };
    setAppState(s => ({ ...s, codes: [newCode, ...s.codes], pendingTemplate: null }));
    showToast('Code downloaded & saved');
  };

  const handleDynamic = () => {
    if (state.authed) {
      navigate('dashboard');
    } else {
      showToast('Sign in to enable dynamic editing');
      document.dispatchEvent(new CustomEvent('qd:openSignIn'));
    }
  };

  return (
    <>
      <PageLabel screen={3} left="SCREEN 03 — GENERATOR / BUILDER" right={state.authed ? "AUTHED · DYNAMIC CODES" : "NO LOGIN · STATIC CODE OUTPUT"} />
      <section className="screen" id="builder">
        <div className="screen-tag"><b>§ 03</b>The Builder</div>

        <div className="uc-head">
          <h2>Tell us <span className="it">what</span><br />it should do.</h2>
          <div className="uc-intro">
            <span className="lbl">Three-pane workspace · always live</span>
            Pick a type from the rail, fill the details in the centre, watch the code come together on the right. Anonymous users get static codes and PNG. Logged-in users unlock dynamic editing, SVG, EPS and analytics.
          </div>
        </div>

        <div className="builder">
          {/* Left: type rail */}
          <aside className="builder-side">
            <div className="side-ttl">QR Type</div>
            <ul>
              {BUILDER_TYPES.map(t => {
                const locked = !hasTier(state, t.tier);
                return (
                  <li key={t.id}
                      className={(typeId === t.id ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                      onClick={() => handleType(t)}>
                    {t.label}
                    <span className="lock">{TIER_LBL[t.tier]}</span>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Middle: form */}
          <div className="builder-main">
            <div className="crumb">Templates › {type.tier === 'free' ? 'Free' : type.tier === 'pro' ? 'Starter' : 'Atelier'} › {type.label}</div>
            <h2>{type.label.split(' ').slice(0, -1).join(' ') || type.label} <span className="it">{type.label.split(' ').slice(-1)[0].toLowerCase()}</span></h2>
            <p className="sub">{
              typeId === 'identity' ? 'A hosted profile behind your code. Edit it any time without reprinting.'
              : typeId === 'wifi' ? 'Embed the network credentials directly in the code. Phones auto-connect on scan.'
              : typeId === 'vcard' || typeId === 'business' ? 'A vCard payload — scanners get a "Save Contact" prompt.'
              : typeId === 'menu' ? 'A short link to your hosted menu page. Update prices anytime.'
              : typeId === 'wifi' ? 'WiFi credentials embedded directly in the code.'
              : typeId === 'pet' ? 'A page strangers see when they scan your pet\'s collar.'
              : typeId === 'event' ? 'A calendar invite payload. Adds straight to iOS/Google Calendar.'
              : typeId === 'payment' ? 'Payment handle embedded for tap-to-pay.'
              : typeId === 'cv' ? 'The link on your printed résumé that always points to the latest version.'
              : 'Fill the basics — preview updates live on the right.'
            }</p>

            <div className="form-stack">
              <BuilderFields type={type} data={data} update={update} />

              <div className="field">
                <label>Code Style</label>
                <div className="style-row">
                  {STYLES.map(s => {
                    const locked = !hasTier(state, s.tier);
                    return (
                      <div key={s.id}
                           className={'swatch' + (style === s.id ? ' on' : '') + (locked ? ' locked' : '')}
                           onClick={() => handleStyle(s)}
                           title={s.label + (locked ? ` · needs ${requiredPlanFor(s.tier)}` : '')}>
                        <StyleIcon id={s.id} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="field">
                <label>Foreground colour</label>
                <div className="color-row">
                  {COLORS.map(c => (
                    <div key={c.hex}
                         className={'c' + (fg === c.hex ? ' on' : '')}
                         style={{ background: c.hex }}
                         onClick={() => setFg(c.hex)}
                         title={c.name} />
                  ))}
                  <div className={'c-custom' + (customHexAllowed ? '' : ' locked')}
                       title={customHexAllowed ? 'Pick any colour' : 'Custom HEX requires Starter+'}
                       onClick={() => { if (!customHexAllowed) { showToast('Custom HEX requires Starter+'); navigate('pricing'); } }}>
                    {customHexAllowed ? (
                      <>
                        <input type="color" value={fg} onChange={e => setFg(e.target.value)} />
                        <span>{fg.toUpperCase().slice(1, 4)}</span>
                      </>
                    ) : null}
                  </div>
                  {customHexAllowed && (
                    <span className="note" style={{ color: 'var(--accent-2)' }}>✓ HEX unlocked</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <aside className="builder-prev">
            <div className="prev-ttl">
              <span>Live Output</span>
              <span className="live">Updating</span>
            </div>
            <div className="qr-frame" id="prev-qr-canvas" style={{ background: 'var(--paper)' }}>
              <QRCode value={payload} size={260} fg={fg} bg="#f3efe7" style={style} emblem="q" />
            </div>
            <div className="prev-info">
              <div><b>Type</b><span className="v">{type.label}</span></div>
              <div><b>Mode</b><span className="v">{state.authed ? 'Dynamic' : 'Static'}</span></div>
              <div><b>Validity</b><span className="v">{state.authed ? '12 months' : 'Lifetime'}</span></div>
              <div><b>Payload</b><span className="v">{payload.length} chars</span></div>
            </div>
            <div className="prev-actions">
              <a className="a-pri" onClick={handleSave}>Download {format.toUpperCase()}</a>
              <a className="a-sec" onClick={handleDynamic}>
                {state.authed ? 'Open in dashboard' : 'Sign in to make dynamic'}
              </a>
              <div className="fmt">
                {FORMATS.map(f => {
                  const locked = !hasTier(state, f.tier);
                  return (
                    <span key={f.id}
                          className={(format === f.id ? 'on ' : '') + (locked ? 'locked' : '')}
                          onClick={() => handleFormat(f)}>{f.label}{locked ? ' ★' : ''}</span>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function BuilderFields({ type, data, update }) {
  const f = type.fields;
  const has = (k) => f.includes(k);

  return (
    <>
      {has('url') && (
        <div className="field">
          <label>Destination URL</label>
          <input type="url" value={data.url} onChange={e => update('url', e.target.value)} placeholder="https://example.com" />
        </div>
      )}
      {(has('name') || has('title')) && (
        <div className="field-row">
          {has('name') && (
            <div className="field">
              <label>{has('petName') ? 'Owner Name' : 'Full Name'}</label>
              <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Adelaide Marlow" />
            </div>
          )}
          {has('title') && (
            <div className="field">
              <label>Display Title</label>
              <input value={data.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Editorial Designer" />
            </div>
          )}
        </div>
      )}
      {has('company') && (
        <div className="field">
          <label>Company / Studio</label>
          <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Casa Editorial" />
        </div>
      )}
      {has('bio') && (
        <div className="field">
          <label>Short Bio · 240 chars</label>
          <textarea rows={2} maxLength={240} value={data.bio} onChange={e => update('bio', e.target.value)} placeholder="The story behind the scan." />
        </div>
      )}
      {(has('email') || has('phone')) && (
        <div className="field-row">
          {has('email') && (
            <div className="field">
              <label>Email</label>
              <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="hello@example.com" />
            </div>
          )}
          {has('phone') && (
            <div className="field">
              <label>Phone</label>
              <input value={data.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 · 555 · 0184" />
            </div>
          )}
        </div>
      )}
      {has('avatar') && (
        <div className="field">
          <label>Avatar / Photo</label>
          <label className="upload-zone">
            <div className="uz-l">Drop or upload <span>PNG, JPG · max 5 MB · square recommended</span></div>
            <div className="uz-btn">Browse</div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files?.[0]; if (!f) return;
              const reader = new FileReader();
              reader.onload = () => update('avatar', reader.result);
              reader.readAsDataURL(f);
            }} />
            {data.avatar && <div className="uz-preview" style={{ backgroundImage: `url(${data.avatar})` }} />}
          </label>
        </div>
      )}
      {has('links') && (
        <div className="field">
          <label>Linked Profiles · up to 8</label>
          <div className="chip-row">
            {data.links.map((l, i) => (
              <span key={i} className="chip">{l}<span className="x" onClick={() => update('links', data.links.filter((_, j) => j !== i))}>✕</span></span>
            ))}
            {data.links.length < 8 && (
              <span className="chip add" onClick={() => {
                const v = prompt('Profile name (e.g. Behance)');
                if (v) update('links', [...data.links, v]);
              }}>+ Add</span>
            )}
          </div>
        </div>
      )}
      {has('ssid') && (
        <div className="field-row">
          <div className="field">
            <label>Network (SSID)</label>
            <input value={data.ssid} onChange={e => update('ssid', e.target.value)} placeholder="MyWiFi" />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={data.wifiPass} onChange={e => update('wifiPass', e.target.value)} placeholder="••••••" />
          </div>
        </div>
      )}
      {has('wifiAuth') && (
        <div className="field">
          <label>Security</label>
          <select value={data.wifiAuth} onChange={e => update('wifiAuth', e.target.value)}>
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">Open · no password</option>
          </select>
        </div>
      )}
      {has('restaurant') && (
        <div className="field">
          <label>Restaurant name</label>
          <input value={data.restaurant} onChange={e => update('restaurant', e.target.value)} placeholder="Casa Editorial" />
        </div>
      )}
      {has('menuUrl') && (
        <div className="field">
          <label>Menu URL (optional)</label>
          <input value={data.menuUrl} onChange={e => update('menuUrl', e.target.value)} placeholder="https://your-menu.com (leave empty to auto-host)" />
        </div>
      )}
      {has('payProvider') && (
        <div className="field-row">
          <div className="field">
            <label>Provider</label>
            <select value={data.payProvider} onChange={e => update('payProvider', e.target.value)}>
              <option value="paypal">PayPal</option>
              <option value="upi">UPI</option>
              <option value="venmo">Venmo</option>
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div className="field">
            <label>Handle / address</label>
            <input value={data.payHandle} onChange={e => update('payHandle', e.target.value)} placeholder="@username" />
          </div>
        </div>
      )}
      {has('eventName') && (
        <>
          <div className="field">
            <label>Event name</label>
            <input value={data.eventName} onChange={e => update('eventName', e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>When (ISO)</label>
              <input value={data.eventDate} onChange={e => update('eventDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Venue</label>
              <input value={data.eventVenue} onChange={e => update('eventVenue', e.target.value)} />
            </div>
          </div>
        </>
      )}
      {has('petName') && (
        <>
          <div className="field">
            <label>Pet name</label>
            <input value={data.petName} onChange={e => update('petName', e.target.value)} />
          </div>
          <div className="field">
            <label>Owner name</label>
            <input value={data.ownerName} onChange={e => update('ownerName', e.target.value)} />
          </div>
        </>
      )}
      {has('propertyAddr') && (
        <div className="field">
          <label>Property address</label>
          <input value={data.propertyAddr} onChange={e => update('propertyAddr', e.target.value)} />
        </div>
      )}
      {has('propertyUrl') && (
        <div className="field">
          <label>Listing URL</label>
          <input value={data.propertyUrl} onChange={e => update('propertyUrl', e.target.value)} placeholder="optional" />
        </div>
      )}
      {has('businessName') && (
        <div className="field-row">
          <div className="field">
            <label>Business name</label>
            <input value={data.businessName} onChange={e => update('businessName', e.target.value)} />
          </div>
          <div className="field">
            <label>Punches to reward</label>
            <input type="number" value={data.punchTotal} onChange={e => update('punchTotal', e.target.value)} />
          </div>
        </div>
      )}
      {has('cvLink') && (
        <div className="field">
          <label>CV link (or leave blank to auto-host)</label>
          <input value={data.cvLink} onChange={e => update('cvLink', e.target.value)} placeholder="https://qdenty.io/cv/..." />
        </div>
      )}
      {type.id === 'bulk' && (
        <BulkPane data={data} update={update} />
      )}
      {type.id === 'geo' && (
        <GeoPane data={data} update={update} />
      )}
    </>
  );
}

function BulkPane({ data, update }) {
  const [csv, setCsv] = useState(data.bulkCsv || 'label,url\nInvoice 001,https://invoice.co/001\nInvoice 002,https://invoice.co/002\nInvoice 003,https://invoice.co/003\nInvoice 004,https://invoice.co/004\nInvoice 005,https://invoice.co/005\nInvoice 006,https://invoice.co/006');
  const rows = csv.split('\n').filter(Boolean);
  const [head, ...body] = rows.map(r => r.split(',').map(c => c.trim()));
  const preview = body.slice(0, 5);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setCsv(reader.result); update('bulkCsv', reader.result); };
    reader.readAsText(f);
    showToast(`Loaded ${f.name}`);
  };

  return (
    <div className="bulk-pane">
      <h4>Bulk <span className="it">batch</span> generation</h4>
      <p className="p">Upload a CSV with one code per row. We'll generate them all and bundle as a ZIP — useful for invoices, parcels, conference badges, seat numbers.</p>

      <label className="upload-zone" style={{ marginBottom: 16 }}>
        <div className="uz-l">Drop CSV or paste below<span>Format: label, url (or any payload) · max 5,000 rows</span></div>
        <div className="uz-btn">Browse CSV</div>
        <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFile} />
      </label>

      <div className="field">
        <label>Or paste CSV</label>
        <textarea
          rows={5}
          value={csv}
          onChange={e => { setCsv(e.target.value); update('bulkCsv', e.target.value); }}
          style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.5 }}
        />
      </div>

      <table className="bulk-table">
        <thead>
          <tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {preview.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
        <span>{body.length} rows ready · {Math.min(5, body.length)} previewed</span>
        <span style={{ color: 'var(--accent-2)' }}>✓ Validated</span>
      </div>
    </div>
  );
}

function GeoPane({ data, update }) {
  const rows = data.geoRules || [
    { country: 'BD', url: 'https://qdenty.io/bd-page' },
    { country: 'IN', url: 'https://qdenty.io/in-page' },
    { country: 'US', url: 'https://qdenty.io/us-page' },
  ];

  const updateRow = (i, patch) => {
    const next = rows.map((r, j) => j === i ? { ...r, ...patch } : r);
    update('geoRules', next);
  };
  const addRow = () => update('geoRules', [...rows, { country: 'GB', url: 'https://' }]);
  const rmRow = (i) => update('geoRules', rows.filter((_, j) => j !== i));

  const COUNTRY_OPTS = [
    ['BD', 'Bangladesh'], ['IN', 'India'], ['PK', 'Pakistan'], ['LK', 'Sri Lanka'],
    ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'],
    ['FR', 'France'], ['IT', 'Italy'], ['ES', 'Spain'], ['PT', 'Portugal'],
    ['CA', 'Canada'], ['AU', 'Australia'], ['JP', 'Japan'], ['SG', 'Singapore'],
    ['AE', 'UAE'], ['SA', 'Saudi Arabia'], ['ZA', 'South Africa'],
    ['*', 'Everywhere else (fallback)'],
  ];

  return (
    <div className="geo-pane">
      <h4>Geo <span className="it">routing</span></h4>
      <p className="p">Same QR, different destinations. The scanner's country is detected and they're redirected to the right URL. Always set a fallback (★).</p>

      <div className="geo-rows">
        {rows.map((r, i) => (
          <div key={i} className="geo-row">
            <select value={r.country} onChange={e => updateRow(i, { country: e.target.value })}>
              {COUNTRY_OPTS.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}
            </select>
            <input value={r.url} onChange={e => updateRow(i, { url: e.target.value })} placeholder="https://your-page.com" />
            <button className="rm" onClick={() => rmRow(i)} title="Remove">✕</button>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={addRow}>+ Add destination</button>
      <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-2)' }}>
        {rows.length} routes configured · IP detected at scan time
      </div>
    </div>
  );
}

Object.assign(window, { Builder, BUILDER_TYPES, buildPayload });
