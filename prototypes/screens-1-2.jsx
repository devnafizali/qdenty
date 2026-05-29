/* ============ Screen 01 — Landing ============ */

const AESTHETIC_QRS = [
  { cat: 'Poetry',     title: 'A Rumi couplet',          line: '“The wound is the place where the Light enters.”', url: 'https://qdenty.io/s/poem/rumi-0144',         tone: '#c2410c', emblem: 'P' },
  { cat: 'Cinema',     title: 'In the Mood for Love',     line: 'Wong Kar-wai · 2000 · a slow drift in red',         url: 'https://qdenty.io/s/film/wkw-mood',          tone: '#8a2d2d', emblem: '8' },
  { cat: 'Music',      title: 'Bossa for a rainy hour',   line: 'A 47-min mixtape · Stan Getz, Jobim, Astrud',       url: 'https://qdenty.io/s/playlist/bossa-rain',    tone: '#1e3a2b', emblem: '♪' },
  { cat: 'Astronomy',  title: 'Tonight\'s sky',           line: 'NASA APOD · the Carina nebula, in dust & ink',      url: 'https://qdenty.io/s/sky/apod',                tone: '#0f0e0c', emblem: '✦' },
  { cat: 'Tea',        title: 'Bengali ginger blend',     line: 'Steep 4 minutes, no milk, two crushed cardamom',    url: 'https://qdenty.io/s/recipe/ginger-cha',      tone: '#a3812d', emblem: 'অ' },
  { cat: 'Letters',    title: 'Borges, to a friend',      line: '“Time is the substance I am made of.”',             url: 'https://qdenty.io/s/letter/borges',          tone: '#5b3e2b', emblem: 'B' },
  { cat: 'Paintings',  title: 'Hammershøi · Interior',    line: 'Vilhelm Hammershøi · 1908 · grey & quiet',          url: 'https://qdenty.io/s/art/hammershoi',         tone: '#475569', emblem: 'H' },
  { cat: 'Walks',      title: 'A loop in old Lisbon',     line: 'Alfama at golden hour · 38 minutes, mostly down',   url: 'https://qdenty.io/s/walk/lisbon-alfama',     tone: '#c2410c', emblem: '↻' },
  { cat: 'Notebook',   title: 'Tanizaki on shadow',       line: '“We delight in the mere sight of shadow…”',         url: 'https://qdenty.io/s/essay/in-praise-shadows', tone: '#0f0e0c', emblem: '陰' },
  { cat: 'Architecture', title: 'Carlo Scarpa · Brion',   line: 'A tomb of light, water & concrete',                 url: 'https://qdenty.io/s/place/brion',            tone: '#1e3a2b', emblem: 'C' },
  { cat: 'Recipes',    title: 'Tarte aux pommes',         line: 'Cold butter, salted crust, almost-burnt sugar',     url: 'https://qdenty.io/s/cook/tarte-pommes',      tone: '#8a6d2c', emblem: '✿' },
  { cat: 'Postcards',  title: 'From Kyoto, in spring',    line: 'Cherry blossom @ Maruyama · stamped 04/03',         url: 'https://qdenty.io/s/post/kyoto-spring',      tone: '#d97a8b', emblem: '櫻' },
];

function Landing() {
  const [qrIdx, setQrIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQrIdx(i => (i + 1) % AESTHETIC_QRS.length);
        setFade(true);
      }, 380);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const heroQR = AESTHETIC_QRS[qrIdx];

  return (
    <>
      <PageLabel screen={1} left="SCREEN 01 — LANDING / INDEX" right="PUBLIC · NO AUTH REQUIRED" />
      <section className="screen" id="hero">
        <div className="screen-tag"><b>§ 01</b>The Index Page</div>

        <div className="hero">
          <div className="hero-left">
            <div className="eyebrow">A platform for everything scannable</div>
            <h1>
              One code,<br />
              <span className="it">infinite</span> identities.
              <span className="small">— for people, businesses & objects</span>
            </h1>
            <p className="lede">
              qdenty turns any moment into a scannable artefact. Your résumé, your business card, your menu, your Wi-Fi, your pet's collar — generate purposeful QR codes for the things that matter, and update them whenever life moves.
            </p>
            <div className="cta-row">
              <a className="btn-pri" onClick={() => navigate('builder')}>Generate For Free</a>
              <a className="btn-sec" onClick={() => navigate('pricing')}>View Tiers</a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="num">22+</div>
                <div className="label">Code Templates</div>
              </div>
              <div className="stat">
                <div className="num">∞</div>
                <div className="label">Static Codes · Free Tier</div>
              </div>
              <div className="stat">
                <div className="num">42</div>
                <div className="label">Languages Supported</div>
              </div>
            </div>
          </div>

          <div className="hero-card aesthetic" onClick={() => navigate('templates')} style={{ cursor: 'pointer', '--tone': heroQR.tone }}>
            <div className="deco">scan me.</div>
            <div className="card-head">
              <div className="ttl">
                <span className="cat-tag" style={{ background: heroQR.tone }}>{heroQR.cat}</span>
                <span className="rot">No. {String(qrIdx + 1).padStart(2, '0')} / {AESTHETIC_QRS.length}</span>
              </div>
              <div className="badge live-badge">
                <span className="dot"></span> Live · rotating
              </div>
            </div>
            <div className={'qr-frame aesthetic-qr' + (fade ? ' in' : ' out')}>
              <QRCode value={heroQR.url} size={320} fg={heroQR.tone} bg="#f3efe7" style="rounded" emblem={heroQR.emblem} />
            </div>
            <div className={'qr-caption' + (fade ? ' in' : ' out')}>
              <div className="cap-h">{heroQR.title}</div>
              <div className="cap-l">{heroQR.line}</div>
            </div>
            <div className="meta">
              <div><b>POINTS TO</b><span className="mono-sm">{heroQR.url.replace('https://', '')}</span></div>
              <div><b>CATEGORY</b>{heroQR.cat} · curated</div>
            </div>
            <div className="hero-dots" aria-hidden>
              {AESTHETIC_QRS.map((_, i) => (
                <span key={i} className={i === qrIdx ? 'on' : ''}></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto strip */}
      <section className="screen" style={{ paddingTop: 56, paddingBottom: 80, background: 'var(--paper-2)', borderTop: '2px solid var(--line)' }}>
        <div className="screen-tag"><b>§ 01.b</b>Quiet manifesto</div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)' }}>— Why we built this</div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 32, lineHeight: 1.3, color: 'var(--ink)', letterSpacing: '-0.01em', textWrap: 'pretty' }}>
              "Every business card we've ever printed is already out of date. Every résumé we've ever emailed is already a draft. qdenty is a small protest against printed information that can't be changed."
            </p>
            <div style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              — Founders' note · Lisbon, 2026
            </div>
          </div>
        </div>
      </section>

      {/* Quick-glance flow */}
      <section className="screen" style={{ paddingTop: 80 }}>
        <div className="screen-tag"><b>§ 01.c</b>How it works · 3 steps</div>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 0.95, marginBottom: 48 }}>
            From idea to scan in <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic' }}>under a minute.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1.5px solid var(--line)', borderLeft: '1.5px solid var(--line)' }}>
            {[
              { n: '01', t: 'Pick a template', d: 'Choose from 22 use-cases — from vCards and menus to pet tags and IoT triggers. Each template knows what data to ask for.' },
              { n: '02', t: 'Fill the details', d: 'A three-pane builder updates the code as you type. Change colours, add a logo, set validity windows.' },
              { n: '03', t: 'Download or host', d: 'Static codes for free, no account needed. Sign in for dynamic codes you can edit without reprinting.' },
            ].map((s, i) => (
              <div key={i} style={{ borderRight: '1.5px solid var(--line)', borderBottom: '1.5px solid var(--line)', padding: '32px 28px 36px', background: 'var(--paper)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.25em', color: 'var(--accent)', marginBottom: 24 }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 12 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.5, textWrap: 'pretty' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="screen" style={{ paddingTop: 56, paddingBottom: 64, background: 'var(--ink)', color: 'var(--paper)', borderTop: '2px solid var(--line)' }}>
        <div className="screen-tag" style={{ color: 'rgba(243,239,231,0.5)' }}><b style={{ color: 'var(--paper)' }}>§ 01.d</b>Quiet credentials</div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48 }}>
          {[
            { v: '128-bit', l: 'AES at rest' },
            { v: 'GDPR', l: 'Compliant by default' },
            { v: 'Zero', l: 'Scan trackers without consent' },
            { v: 'EU', l: 'Hosted · Lisbon DC' },
          ].map((s, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(243,239,231,0.25)', paddingTop: 20 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(243,239,231,0.5)', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ============ Screen 02 — Templates library ============ */

const ALL_TEMPLATES = [
  { n: '01', name: 'Personal Identity Cards', it: 'Identity', desc: 'Build a living digital ID page. Avatar, bio, socials, contact, downloadable vCard. Update once — the code stays the same.', tier: 'free', cat: 'people', feature: true, icon: 'identity' },
  { n: '02', name: 'Business Card', it: 'Card', desc: 'Replace paper. Logo, role, team, calendar link.', tier: 'free', cat: 'people', icon: 'card' },
  { n: '03', name: 'Résumé / CV', it: 'CV', desc: 'Link to a hosted CV page, or PDF download.', tier: 'free', cat: 'people', icon: 'cv' },
  { n: '04', name: 'Restaurant Menu', it: 'Menu', desc: 'Digital menu with allergens, photos & multi-language.', tier: 'pro', cat: 'business', icon: 'menu' },
  { n: '05', name: 'WiFi Access', it: 'Access', desc: 'Auto-connect for guests. SSID + password embedded.', tier: 'free', cat: 'utility', icon: 'wifi' },
  { n: '06', name: 'Link Hub', it: 'Hub', desc: 'One scan → all your socials, portfolio, music, shop.', tier: 'free', cat: 'people', icon: 'hub' },
  { n: '07', name: 'Payment Code', it: 'Code', desc: 'UPI · PayPal · bank · crypto · regional wallets.', tier: 'pro', cat: 'business', icon: 'pay' },
  { n: '08', name: 'Pet ID Tag', it: 'ID Tag', desc: 'Found pet? Scanner sees owner, meds, vet contact.', tier: 'free', cat: 'objects', icon: 'pet' },
  { n: '09', name: 'Medical Alert', it: 'Alert', desc: 'Blood type, allergies, emergency contacts.', tier: 'pro', cat: 'utility', icon: 'med' },
  { n: '10', name: 'Event Ticket', it: 'Ticket', desc: 'Validated entry pass with seat, time, calendar add.', tier: 'pro', cat: 'business', icon: 'ticket' },
  { n: '11', name: 'Property Listing', it: 'Listing', desc: 'House for sale. Floor plan, gallery, agent contact.', tier: 'pro', cat: 'business', icon: 'home' },
  { n: '12', name: 'Loyalty Punch', it: 'Card', desc: 'Earn stamps in the browser. No app to install.', tier: 'pro', cat: 'business', icon: 'star' },
  { n: '13', name: 'Calendar Invite', it: 'Invite', desc: '.ics download. Add to any calendar with one tap.', tier: 'free', cat: 'utility', icon: 'cal' },
  { n: '14', name: 'App Download', it: 'Link', desc: 'Smart-detect iOS / Android. Send to right store.', tier: 'free', cat: 'utility', icon: 'app' },
  { n: '15', name: 'Product Page', it: 'Page', desc: 'Packaging insert. Reviews, manual, warranty link.', tier: 'pro', cat: 'objects', icon: 'pkg' },
  { n: '16', name: 'Gallery / Portfolio', it: 'Portfolio', desc: 'Lightbox gallery for designers, photographers.', tier: 'pro', cat: 'people', icon: 'gallery' },
  { n: '17', name: 'Audio Note', it: 'Note', desc: 'Voice message behind a card. Useful for gifts.', tier: 'pro', cat: 'people', icon: 'audio' },
  { n: '18', name: 'Video Embed', it: 'Embed', desc: 'YouTube · Vimeo · self-hosted. Tutorial behind a sticker.', tier: 'pro', cat: 'utility', icon: 'video' },
  { n: '19', name: 'Donation', it: 'Code', desc: 'One-tap donation page for non-profits & creators.', tier: 'free', cat: 'business', icon: 'heart' },
  { n: '20', name: 'Bulk / Batch Codes', it: 'Batch Codes', desc: 'Generate 100s at once — invoices, parcels, seats.', tier: 'elite', cat: 'utility', icon: 'bulk' },
  { n: '21', name: 'Custom Action', it: 'Action', desc: 'API endpoint, app deep-link, IoT trigger. Build it.', tier: 'elite', cat: 'utility', icon: 'custom' },
  { n: '22', name: 'Multi-link / Geo', it: 'Geo', desc: 'Same code, different destinations by location.', tier: 'elite', cat: 'utility', icon: 'geo' },
];

/* Premium duotone icon set — fill + stroke, accent highlight */
const ICO = {
  identity: <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="8.5" r="3.5" className="ico-fill"/><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 19.5c1.2-3.4 4.3-5 7.5-5s6.3 1.6 7.5 5"/><circle cx="16.5" cy="6" r="1.4" className="ico-accent"/></svg>,
  card: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="6" width="18" height="13" rx="1.5" className="ico-fill"/><rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 10.5h18M7 14.5h5M14 14.5h3"/><circle cx="17" cy="9" r="0.9" className="ico-accent ico-accent-stroke" fill="currentColor"/></svg>,
  cv: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M5 3h10l4 4v14H5z" className="ico-fill"/><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M8 12h8M8 15.5h8M8 19h5"/><rect x="14" y="14.5" width="4" height="4" className="ico-accent" fill="currentColor" stroke="none" rx="0.4"/></svg>,
  menu: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M5 7h14v12H5z" className="ico-fill"/><path d="M5 7h14v12H5z"/><circle cx="12" cy="13" r="3"/><path d="M3 9V7a2 2 0 0 1 2-2h2"/><path d="M9 13h6" className="ico-accent ico-accent-stroke"/></svg>,
  wifi: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M2.5 9.5a15 15 0 0 1 19 0"/><path d="M5.5 13a10.5 10.5 0 0 1 13 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  hub: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="4" y="4" width="16" height="16" rx="1" className="ico-fill"/><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9.5 4v16M14.5 4v16M4 9.5h16M4 14.5h16"/><rect x="9.5" y="9.5" width="5" height="5" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  pay: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="2.5" y="5.5" width="19" height="13" rx="1" className="ico-fill"/><rect x="2.5" y="5.5" width="19" height="13" rx="1"/><path d="M2.5 9.5h19"/><rect x="5.5" y="13" width="5" height="2.5" className="ico-accent" fill="currentColor" stroke="none" rx="0.3"/></svg>,
  pet: <svg viewBox="0 0 24 24" className="ico-duo"><ellipse cx="12" cy="13" rx="5" ry="4.5" className="ico-fill"/><ellipse cx="12" cy="13" rx="5" ry="4.5"/><ellipse cx="6.5" cy="8.5" rx="1.7" ry="2.3"/><ellipse cx="17.5" cy="8.5" rx="1.7" ry="2.3"/><circle cx="9.5" cy="6" r="1.5"/><circle cx="14.5" cy="6" r="1.5"/><circle cx="12" cy="13" r="0.9" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  med: <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="9" className="ico-fill"/><circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M7.5 12h9" className="ico-accent-stroke"/></svg>,
  ticket: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M3 7v3a2 2 0 0 1 0 4v3h18v-3a2 2 0 0 1 0-4V7z" className="ico-fill"/><path d="M3 7v3a2 2 0 0 1 0 4v3h18v-3a2 2 0 0 1 0-4V7z"/><path d="M9 7v10" strokeDasharray="1.5 1.5"/><circle cx="15" cy="12" r="1.2" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  home: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M4 11 12 4l8 7v9H4z" className="ico-fill"/><path d="M4 11 12 4l8 7v9H4z"/><path d="M2.5 12 12 3l9.5 9"/><rect x="10" y="14" width="4" height="6" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  star: <svg viewBox="0 0 24 24" className="ico-duo"><path d="m12 3 2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.7l-5.9 3.5L7.7 14.5 2.5 9.9l6.8-.6z" className="ico-fill"/><path d="m12 3 2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.7l-5.9 3.5L7.7 14.5 2.5 9.9l6.8-.6z"/><circle cx="12" cy="12.5" r="1.5" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  cal: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="5" width="18" height="16" rx="1.5" className="ico-fill"/><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 9.5h18M8 3v4M16 3v4"/><rect x="13" y="12.5" width="4" height="4" className="ico-accent" fill="currentColor" stroke="none" rx="0.4"/></svg>,
  app: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="6" y="3" width="12" height="18" rx="2.5" className="ico-fill"/><rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M10 18.5h4"/><rect x="9" y="6.5" width="6" height="8" className="ico-accent" fill="currentColor" stroke="none" rx="0.4"/></svg>,
  pkg: <svg viewBox="0 0 24 24" className="ico-duo"><path d="m12 3 9 5v8l-9 5-9-5V8z" className="ico-fill"/><path d="m12 3 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v10"/><path d="m7.5 5.5 9 5" className="ico-accent-stroke"/></svg>,
  gallery: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="3" y="5" width="18" height="14" rx="1" className="ico-fill"/><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 17 5-5 4 4 3-3 6 6"/><circle cx="8" cy="9.5" r="1.6" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  audio: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M4 9h3l5-4v14l-5-4H4z" className="ico-fill"/><path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6" className="ico-accent-stroke"/><path d="M18.5 6.5a7 7 0 0 1 0 11" className="ico-accent-stroke" opacity="0.5"/></svg>,
  video: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="2.5" y="6" width="14" height="12" rx="1" className="ico-fill"/><rect x="2.5" y="6" width="14" height="12" rx="1"/><path d="m17 10.5 4-2.5v8L17 13.5z"/><path d="m8 9.5 4 2.5-4 2.5z" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  heart: <svg viewBox="0 0 24 24" className="ico-duo"><path d="M12 20s-7.5-4.5-7.5-10.5A4 4 0 0 1 12 7.5 4 4 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20z" className="ico-fill"/><path d="M12 20s-7.5-4.5-7.5-10.5A4 4 0 0 1 12 7.5 4 4 0 0 1 19.5 9.5C19.5 15.5 12 20 12 20z"/><circle cx="9" cy="11" r="1.2" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  bulk: <svg viewBox="0 0 24 24" className="ico-duo"><rect x="4" y="4" width="7" height="7" className="ico-fill"/><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
  custom: <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="3.5" className="ico-fill"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8"/></svg>,
  geo: <svg viewBox="0 0 24 24" className="ico-duo"><circle cx="12" cy="12" r="9" className="ico-fill"/><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/><circle cx="16" cy="9" r="1.3" className="ico-accent" fill="currentColor" stroke="none"/></svg>,
};

const TIER_LABELS = { free: 'Free', pro: 'Starter+', elite: 'Atelier' };

function Templates() {
  const [filter, setFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const visible = ALL_TEMPLATES.filter(t =>
    (filter === 'all' || t.cat === filter) &&
    (tierFilter === 'all' || t.tier === tierFilter)
  );

  const pick = (t) => {
    setAppState({ pendingTemplate: t });
    navigate('builder');
  };

  return (
    <>
      <PageLabel screen={2} left="SCREEN 02 — TEMPLATE LIBRARY" right={`${visible.length} OF ${ALL_TEMPLATES.length} TEMPLATES SHOWN`} />
      <section className="screen" id="templates">
        <div className="screen-tag"><b>§ 02</b>Template Library</div>

        <div className="uc-head">
          <h2>A QR for <span className="it">every</span> intention.</h2>
          <div className="uc-intro">
            <span className="lbl">Research-backed use cases · 2026</span>
            From the boardroom to the bookshelf — pick a template, fill in the details, and walk away with a code that does the work. Free tier covers the essentials; Pro and Atelier unlock dynamic codes, analytics, and team controls.
          </div>
        </div>

        <div className="tpl-filter">
          {[
            { id: 'all', label: 'All categories' },
            { id: 'people', label: 'People' },
            { id: 'business', label: 'Business' },
            { id: 'objects', label: 'Objects' },
            { id: 'utility', label: 'Utility' },
          ].map(c => (
            <button key={c.id} className={filter === c.id ? 'on' : ''} onClick={() => setFilter(c.id)}>{c.label}</button>
          ))}
          <span style={{ flex: 1 }} />
          {[
            { id: 'all', label: 'All tiers' },
            { id: 'free', label: 'Free' },
            { id: 'pro', label: 'Starter+' },
            { id: 'elite', label: 'Atelier' },
          ].map(c => (
            <button key={c.id} className={tierFilter === c.id ? 'on' : ''} onClick={() => setTierFilter(c.id)}>{c.label}</button>
          ))}
        </div>

        <div className="uc-grid">
          {visible.map(t => (
            <button
              key={t.n}
              className={'uc-tile' + (t.feature ? ' feature' : '')}
              onClick={() => pick(t)}
            >
              <div>
                <div className="num">{t.n}{t.feature ? ' · Flagship' : ''}</div>
                <div className="ico">{ICO[t.icon]}</div>
                <h3>{t.name.split(' ').slice(0, -1).join(' ') || t.name} <span className="it">{t.name.split(' ').slice(-1)[0]}</span></h3>
                <p>{t.desc}</p>
                {t.feature && <span className="go" style={{ color: 'var(--accent)' }}>Build one</span>}
              </div>
              <div className={'tier ' + t.tier}>{TIER_LABELS[t.tier]}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

Object.assign(window, { Landing, Templates, ALL_TEMPLATES, ICO, TIER_LABELS });
