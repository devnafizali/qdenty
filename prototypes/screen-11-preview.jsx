/* ============ Screen 12 — Public Preview (what scanners see) ============ */

function PreviewWrapper({ kind, children, url }) {
  const [device, setDevice] = useState('phone');

  const copyLink = () => {
    navigator.clipboard?.writeText(url);
    showToast('Public link copied');
  };

  return (
    <>
      <PageLabel
        screen={4}
        left={`SCREEN 12 — PUBLIC ${kind.toUpperCase()} PREVIEW`}
        right={`PUBLIC URL · ${url.replace('https://', '')}`}
      />
      <section className="screen" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="screen-tag"><b>§ 12</b>Public {kind} preview</div>

        <div className="prv-wrap">
          <div className="uc-head" style={{ marginBottom: 32 }}>
            <h2>What people <span className="it">see</span><br />when they scan.</h2>
            <div className="uc-intro">
              <span className="lbl">Live preview · {url.replace('https://', '')}</span>
              This is the hosted page a scanner lands on. Tweak your details and refresh — what shows up here is what shows up on phones.
            </div>
          </div>

          <div className="prv-toolbar">
            <div className="prv-tools-l">
              <span className="prv-url"><span className="prv-lock">●</span> {url.replace('https://', '')}</span>
            </div>
            <div className="prv-tools-r">
              <div className="prv-device-switch">
                <span className={device === 'phone' ? 'on' : ''} onClick={() => setDevice('phone')}>Phone</span>
                <span className={device === 'web' ? 'on' : ''} onClick={() => setDevice('web')}>Web</span>
              </div>
              <button className="btn-mini-ghost" onClick={copyLink}>Copy URL</button>
              <button className="btn-mini" onClick={() => kind === 'CV' ? navigate('cv-builder') : navigate('account/profile')}>
                Edit content →
              </button>
            </div>
          </div>

          <div className={'prv-stage ' + device}>
            {device === 'phone' ? (
              <PhoneBezel url={url}>{children}</PhoneBezel>
            ) : (
              <BrowserBezel url={url}>{children}</BrowserBezel>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function PhoneBezel({ url, children }) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="phone-bezel">
      <div className="ph-side-btn ph-mute"></div>
      <div className="ph-side-btn ph-vol-up"></div>
      <div className="ph-side-btn ph-vol-dn"></div>
      <div className="ph-side-btn ph-power"></div>
      <div className="ph-screen">
        <div className="ph-statusbar">
          <span>{time}</span>
          <div className="ph-notch"></div>
          <div className="ph-status-r">
            <span>···</span>
            <span className="ph-bar"></span>
            <span>100%</span>
            <span className="ph-batt"><span></span></span>
          </div>
        </div>
        <div className="ph-tabbar">
          <span className="ph-tab-l">←</span>
          <span className="ph-tab-url"><span className="ph-lock">●</span> {url.replace('https://', '')}</span>
          <span className="ph-tab-r">⊕</span>
        </div>
        <div className="ph-content">
          {children}
        </div>
        <div className="ph-home-indicator"></div>
      </div>
    </div>
  );
}

function BrowserBezel({ url, children }) {
  return (
    <div className="browser-bezel">
      <div className="brw-top">
        <div className="brw-dots"><span></span><span></span><span></span></div>
        <div className="brw-url"><span className="brw-lock">●</span> {url.replace('https://', '')}</div>
        <div className="brw-actions"><span>⤓</span><span>⋯</span></div>
      </div>
      <div className="brw-content" style={{ background: 'var(--paper)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: 720 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* =================== Public Identity Page =================== */

function IdentityPreview() {
  const [state] = useAppState();
  const id = state.identity;
  const u = state.user;
  const url = `https://qdenty.io/u/${id.slug}`;
  return (
    <PreviewWrapper kind="identity" url={url}>
      <PublicIdentityPage identity={id} user={u} />
    </PreviewWrapper>
  );
}

function PublicIdentityPage({ identity, user }) {
  const id = identity;
  const initials = id.name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');
  const url = `https://qdenty.io/u/${id.slug}`;

  const saveContact = () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${id.name}`,
      `TITLE:${id.title}`,
      `EMAIL:${id.email}`,
      `TEL:${id.phone}`,
      `ADR;TYPE=WORK:;;;${id.location};;;`,
      `URL:${url}`,
      `NOTE:${id.bio}`,
      'END:VCARD',
    ].join('\n');
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id.name.replace(/\s+/g, '-').toLowerCase()}.vcf`;
    a.click();
    showToast('Contact saved');
  };

  return (
    <div className="pub-id">
      {/* Cover */}
      <div className="pub-id-cover">
        <div className="pub-id-cover-mark">
          <svg viewBox="0 0 200 80" preserveAspectRatio="none">
            <path d="M0 60 Q40 30 80 50 T 160 40 T 200 60 L 200 80 L 0 80 Z" fill="rgba(243,239,231,0.12)"/>
            <path d="M0 50 Q40 20 80 40 T 160 30 T 200 50" fill="none" stroke="rgba(243,239,231,0.2)" strokeWidth="1"/>
          </svg>
        </div>
        <div className="pub-id-verified">✓ qdenty verified</div>
      </div>

      <div className="pub-id-body">
        <div className="pub-id-avatar">
          {initials}
        </div>

        <h1 className="pub-id-name">{id.name}</h1>
        <div className="pub-id-pronouns">{id.pronouns}</div>
        <div className="pub-id-title">{id.title}</div>
        <div className="pub-id-location">📍 {id.location}</div>

        <p className="pub-id-bio">{id.bio}</p>

        <button className="pub-id-cta" onClick={saveContact}>
          + Save to Contacts
        </button>

        <div className="pub-id-quick">
          <a className="pub-id-quick-i" onClick={() => { window.location.href = `mailto:${id.email}`; }}>
            <div className="qi-glyph">✉</div>
            <div className="qi-l">Email</div>
          </a>
          <a className="pub-id-quick-i" onClick={() => { window.location.href = `tel:${id.phone.replace(/[^+0-9]/g, '')}`; }}>
            <div className="qi-glyph">☏</div>
            <div className="qi-l">Call</div>
          </a>
          <a className="pub-id-quick-i" onClick={() => showToast('Opens WhatsApp · demo')}>
            <div className="qi-glyph">⌥</div>
            <div className="qi-l">Chat</div>
          </a>
          <a className="pub-id-quick-i" onClick={() => {
            if (navigator.share) navigator.share({ url, title: id.name });
            else { navigator.clipboard?.writeText(url); showToast('Link copied'); }
          }}>
            <div className="qi-glyph">↗</div>
            <div className="qi-l">Share</div>
          </a>
        </div>

        <div className="pub-id-sec">
          <div className="pub-id-sec-h">Contact</div>
          <div className="pub-id-row">
            <span className="lk">Email</span>
            <a href={`mailto:${id.email}`}>{id.email}</a>
          </div>
          <div className="pub-id-row">
            <span className="lk">Phone</span>
            <a href={`tel:${id.phone}`}>{id.phone}</a>
          </div>
          <div className="pub-id-row">
            <span className="lk">Where</span>
            <span>{id.location}</span>
          </div>
        </div>

        {id.links?.length > 0 && (
          <div className="pub-id-sec">
            <div className="pub-id-sec-h">Linked profiles</div>
            <div className="pub-id-links">
              {id.links.map((l, i) => (
                <a key={i} className="pub-id-link" onClick={() => showToast('Open · ' + l)}>
                  <span className="pl-glyph">{l[0]}</span>
                  <span>{l}</span>
                  <span className="pl-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pub-id-sec">
          <div className="pub-id-sec-h">Résumé</div>
          <a className="pub-id-resume" onClick={() => navigate('preview/cv')}>
            <div>
              <div className="pl-h">Open full CV</div>
              <div className="pl-p">Editorial · updated this week</div>
            </div>
            <span className="pl-arrow">→</span>
          </a>
        </div>

        <div className="pub-id-foot">
          <div className="foot-mark">qdenty</div>
          <div className="foot-sub">Your scan-friendly identity · made on qdenty.io</div>
          <div className="foot-meta">Powered by Mabous Innovations &amp; Engineering Ltd.</div>
        </div>
      </div>
    </div>
  );
}

/* =================== Public CV Page =================== */

function CVPreview() {
  const [state] = useAppState();
  const cv = state.cv;
  const url = `https://qdenty.io/cv/${state.identity.slug}`;
  return (
    <PreviewWrapper kind="CV" url={url}>
      <PublicCVPage cv={cv} url={url} identitySlug={state.identity.slug} />
    </PreviewWrapper>
  );
}

function PublicCVPage({ cv, url, identitySlug }) {
  const initials = cv.name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');

  const downloadPDF = () => showToast('PDF download · demo');
  const share = () => {
    if (navigator.share) navigator.share({ url, title: cv.name + ' · CV' });
    else { navigator.clipboard?.writeText(url); showToast('Link copied'); }
  };

  return (
    <div className="pub-cv">
      <div className="pub-cv-cover">
        <div className="pub-cv-cover-tag">
          <span className="dot"></span>
          Updated · this week
        </div>
      </div>

      <div className="pub-cv-body">
        <div className="pub-cv-head">
          <div className="pub-cv-avatar">{initials}</div>
          <div className="pub-cv-headh">
            <h1>{cv.name}</h1>
            <div className="pub-cv-title">{cv.title}</div>
            <div className="pub-cv-loc">{cv.location} · <a onClick={() => navigate('preview/identity')}>contact</a></div>
          </div>
        </div>

        <div className="pub-cv-actions">
          <button className="pub-cv-pri" onClick={downloadPDF}>
            <span>↓</span> Download PDF
          </button>
          <button className="pub-cv-sec" onClick={share}>
            <span>↗</span> Share
          </button>
        </div>

        {cv.summary && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">About</div>
            <p className="pub-cv-p">{cv.summary}</p>
          </div>
        )}

        {cv.experience?.length > 0 && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">Experience</div>
            {cv.experience.map((j, i) => (
              <div key={i} className="pub-cv-exp">
                <div className="pcx-yr">{j.years}</div>
                <div>
                  <div className="pcx-role">{j.role}</div>
                  <div className="pcx-co">{j.co}</div>
                  <ul className="pcx-bullets">
                    {j.bullets.filter(Boolean).map((b, k) => <li key={k}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {cv.education?.length > 0 && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">Education</div>
            {cv.education.map((e, i) => (
              <div key={i} className="pub-cv-edu">
                <div className="pce-deg">{e.degree}</div>
                <div className="pce-sch">{e.school}</div>
              </div>
            ))}
          </div>
        )}

        {cv.skills?.length > 0 && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">Skills</div>
            <div className="pub-cv-skills">
              {cv.skills.map((s, i) => (
                <span key={i} className={'pcv-tag' + (i === 0 ? ' pri' : '')}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {cv.languages?.length > 0 && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">Languages</div>
            {cv.languages.map((l, i) => (
              <div key={i} className="pub-cv-lang">
                <span>{l.name}</span>
                <span className="lvl">{l.level}</span>
              </div>
            ))}
          </div>
        )}

        {cv.projects?.length > 0 && (
          <div className="pub-cv-sec">
            <div className="pub-cv-sec-h">Selected Projects</div>
            {cv.projects.map((p, i) => (
              <div key={i} className="pub-cv-proj">
                <div className="pcp-n">{p.name}</div>
                <div className="pcp-d">{p.desc}</div>
              </div>
            ))}
          </div>
        )}

        <div className="pub-cv-contact">
          <div className="pub-cv-sec-h">Get in touch</div>
          <a className="pub-cv-c" href={`mailto:${cv.email}`}>
            <span>✉</span><span>{cv.email}</span>
          </a>
          <a className="pub-cv-c" href={`tel:${cv.phone.replace(/[^+0-9]/g, '')}`}>
            <span>☏</span><span>{cv.phone}</span>
          </a>
          <a className="pub-cv-c" onClick={() => navigate('preview/identity')}>
            <span>◈</span><span>Full identity page</span>
          </a>
        </div>

        <div className="pub-cv-foot">
          <div className="foot-mark">qdenty<span className="it">.</span></div>
          <div className="foot-sub">CV · always up to date · scan to revisit</div>
          <div className="foot-meta">qdenty.io/cv/{identitySlug} · Mabous Innovations &amp; Engineering Ltd.</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IdentityPreview, CVPreview, PublicIdentityPage, PublicCVPage });
