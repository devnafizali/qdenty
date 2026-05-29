/* ============ Screen 10 — CV Builder (functional editor) ============ */

const CVB_SECTIONS = [
  { id: 'personal', n: '01', label: 'Personal' },
  { id: 'summary', n: '02', label: 'Summary' },
  { id: 'experience', n: '03', label: 'Experience' },
  { id: 'education', n: '04', label: 'Education' },
  { id: 'skills', n: '05', label: 'Skills' },
  { id: 'languages', n: '06', label: 'Languages' },
  { id: 'projects', n: '07', label: 'Projects' },
];

function CVBuilder() {
  const [state] = useAppState();
  const [section, setSection] = useState('personal');
  const cv = state.cv;
  const cvUrl = `https://qdenty.io/cv/${state.identity.slug}`;

  // Auth gate — CV editor is private. Bounce to sign-in if not logged in.
  useEffect(() => {
    if (!state.authed) {
      showToast('Sign in to edit your CV');
      document.dispatchEvent(new CustomEvent('qd:openSignIn'));
      navigate('cv');
    }
  }, [state.authed]);

  if (!state.authed) {
    return (
      <>
        <PageLabel screen={5} left="SCREEN 10 — CV BUILDER · LOCKED" right="LOGIN REQUIRED" />
        <section className="screen" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <div className="cvb-gate">
            <div className="cvb-gate-glyph">◉</div>
            <h2>The <span className="it">editor</span> is private.</h2>
            <p>Sign in to save drafts, host your CV at a stable URL, and keep the QR on your printed copy pointing to the latest version.</p>
            <div className="cvb-gate-row">
              <a className="btn-pri" onClick={() => document.dispatchEvent(new CustomEvent('qd:openSignIn'))}>Sign in to continue</a>
              <a className="btn-sec" onClick={() => navigate('cv')}>← Back to CV Studio</a>
            </div>
            <div className="cvb-gate-foot">Free account · no credit card · one click to undo</div>
          </div>
        </section>
      </>
    );
  }

  const updateCv = (patch) => {
    setAppState(s => ({ ...s, cv: { ...s.cv, ...patch } }));
  };

  const exportPDF = () => {
    if (!hasTier(state, 'free')) {
      showToast('Sign up to export'); document.dispatchEvent(new CustomEvent('qd:openSignIn')); return;
    }
    showToast('Exporting PDF · demo');
  };
  const publishCV = () => {
    if (!hasTier(state, 'free')) {
      showToast('Sign up to publish'); document.dispatchEvent(new CustomEvent('qd:openSignIn')); return;
    }
    showToast('CV published · ' + cvUrl);
  };

  return (
    <>
      <PageLabel screen={5} left="SCREEN 10 — CV BUILDER · LIVE EDITOR" right={`PUBLIC URL · qdenty.io/cv/${state.identity.slug}`} />
      <section className="screen" id="cv-builder">
        <div className="screen-tag"><b>§ 10</b>CV Builder</div>

        <div className="uc-head" style={{ marginBottom: 32 }}>
          <h2>Edit. Preview. <span className="it">Publish.</span></h2>
          <div className="uc-intro">
            <span className="lbl">Live builder · changes apply to the QR instantly</span>
            Type into any section on the left, see the document update on the right. The QR code on your printed CV always points to the latest version — your scanners always see what's here today.
          </div>
        </div>

        <div className="cvb-frame">
          <aside className="cvb-rail">
            <div className="rail-ttl">Sections</div>
            <ul>
              {CVB_SECTIONS.map(s => (
                <li key={s.id}
                    className={section === s.id ? 'on' : ''}
                    onClick={() => setSection(s.id)}>
                  <span>{s.label}</span>
                  <span className="n">{s.n}</span>
                </li>
              ))}
            </ul>
            <div style={{ padding: '16px 22px', borderTop: '1px dashed var(--rule)', marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>Template</div>
              <select value={cv.template || 'editorial'} onChange={e => updateCv({ template: e.target.value })}
                      style={{ width: '100%', padding: '8px 0', fontFamily: 'var(--serif)', fontSize: 15, background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--ink)', outline: 'none' }}>
                <option value="editorial">Editorial · default</option>
                <option value="modern">Modern · free</option>
                <option value="atelier" disabled={!hasTier(state, 'pro')}>Atelier · Starter+</option>
              </select>
            </div>
          </aside>

          <div className="cvb-form">
            {section === 'personal' && <CVBPersonal cv={cv} updateCv={updateCv} />}
            {section === 'summary' && <CVBSummary cv={cv} updateCv={updateCv} />}
            {section === 'experience' && <CVBExperience cv={cv} updateCv={updateCv} />}
            {section === 'education' && <CVBEducation cv={cv} updateCv={updateCv} />}
            {section === 'skills' && <CVBSkills cv={cv} updateCv={updateCv} />}
            {section === 'languages' && <CVBLanguages cv={cv} updateCv={updateCv} />}
            {section === 'projects' && <CVBProjects cv={cv} updateCv={updateCv} />}
          </div>

          <aside className="cvb-preview">
            <div className="prev-ttl">
              <span>Live Preview</span>
              <span className="live">Synced</span>
            </div>

            <CVDocLive cv={cv} cvUrl={cvUrl} template={cv.template || 'editorial'} />

            <div className="cvb-actions">
              <a className="a-pri" onClick={publishCV}>Publish &amp; copy link</a>
              <a className="a-sec" onClick={exportPDF}>Export PDF · DOCX</a>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--ink-mute)', marginTop: 6 }}>
                <span style={{ padding: '4px 8px', border: '1px solid var(--ink)', color: 'var(--ink)' }}>PDF</span>
                <span style={{ padding: '4px 8px', border: '1px solid var(--rule)' }}>DOCX</span>
                <span style={{ padding: '4px 8px', border: '1px solid var(--rule)' }}>WEB</span>
                <span style={{ padding: '4px 8px', border: '1px solid var(--rule)', color: hasTier(state, 'pro') ? 'var(--ink)' : 'var(--ink-mute)' }}>
                  ATS{!hasTier(state, 'pro') ? ' ★' : ''}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ---------- Section editors ---------- */

function CVBPersonal({ cv, updateCv }) {
  return (
    <>
      <div className="crumb">Section 01 · Personal</div>
      <h3>The <span className="it">basics.</span></h3>
      <div className="sub">Name and title get the most weight — they're the first thing a recruiter sees.</div>

      <div className="form-stack">
        <div className="field-row">
          <div className="field">
            <label>Full Name</label>
            <input value={cv.name} onChange={e => updateCv({ name: e.target.value })} />
          </div>
          <div className="field">
            <label>Title / Role</label>
            <input value={cv.title} onChange={e => updateCv({ title: e.target.value })} placeholder="e.g. Editorial Designer · Type / Brand" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input type="email" value={cv.email} onChange={e => updateCv({ email: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={cv.phone} onChange={e => updateCv({ phone: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={cv.location} onChange={e => updateCv({ location: e.target.value })} placeholder="City, Country · Region" />
        </div>
      </div>
    </>
  );
}

function CVBSummary({ cv, updateCv }) {
  return (
    <>
      <div className="crumb">Section 02 · Summary</div>
      <h3>Why <span className="it">you,</span> in 4 lines.</h3>
      <div className="sub">A short professional summary. Keep it to 3–4 sentences. Recruiters read this first.</div>
      <div className="field">
        <label>Summary · 400 chars max</label>
        <textarea
          rows={6}
          maxLength={400}
          value={cv.summary}
          onChange={e => updateCv({ summary: e.target.value })}
          style={{ fontSize: 16, lineHeight: 1.55 }}
        />
        <div className="field-hint">{cv.summary.length} / 400 characters</div>
      </div>
      <div style={{ marginTop: 18, padding: 16, background: 'var(--paper-2)', border: '1px dashed var(--rule)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 24, color: 'var(--accent)' }}>✦</span>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>AI assistant · Starter+</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Let qdenty draft a summary from your experience entries.</div>
        </div>
        <button className="btn-pri" style={{ marginLeft: 'auto', padding: '10px 16px', fontSize: 10 }} onClick={() => showToast('AI summary · Starter+ only')}>Draft</button>
      </div>
    </>
  );
}

function CVBExperience({ cv, updateCv }) {
  const items = cv.experience || [];
  const setItems = (next) => updateCv({ experience: next });
  const updateItem = (i, patch) => setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { role: 'New role', years: 'YYYY — YYYY', co: 'Company · City', bullets: ['What you did here.'] }]);
  const rmItem = (i) => setItems(items.filter((_, j) => j !== i));
  const setBullet = (i, k, v) => updateItem(i, { bullets: items[i].bullets.map((b, m) => m === k ? v : b) });
  const addBullet = (i) => updateItem(i, { bullets: [...items[i].bullets, ''] });
  const rmBullet = (i, k) => updateItem(i, { bullets: items[i].bullets.filter((_, m) => m !== k) });

  return (
    <>
      <div className="crumb">Section 03 · Experience</div>
      <h3>Where you've <span className="it">been.</span></h3>
      <div className="sub">Most recent first. Use bullets to call out concrete outcomes — numbers help.</div>

      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field-row">
              <div className="field">
                <label>Role</label>
                <input value={it.role} onChange={e => updateItem(i, { role: e.target.value })} />
              </div>
              <div className="field">
                <label>Years</label>
                <input value={it.years} onChange={e => updateItem(i, { years: e.target.value })} placeholder="2022 — Now" />
              </div>
            </div>
            <div className="field">
              <label>Company · Location</label>
              <input value={it.co} onChange={e => updateItem(i, { co: e.target.value })} />
            </div>
            <div className="field">
              <label>Bullets</label>
              <div className="cvb-bullets">
                {it.bullets.map((b, k) => (
                  <div key={k} className="bul-row">
                    <input value={b} onChange={e => setBullet(i, k, e.target.value)} />
                    <span className="rmb" onClick={() => rmBullet(i, k)}>✕</span>
                  </div>
                ))}
                <button className="add-row-btn" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: 9 }} onClick={() => addBullet(i)}>+ Add bullet</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add experience</button>
    </>
  );
}

function CVBEducation({ cv, updateCv }) {
  const items = cv.education || [];
  const setItems = (next) => updateCv({ education: next });
  const updateItem = (i, patch) => setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { degree: 'Degree', school: 'School · City · Year' }]);
  const rmItem = (i) => setItems(items.filter((_, j) => j !== i));

  return (
    <>
      <div className="crumb">Section 04 · Education</div>
      <h3>What you <span className="it">studied.</span></h3>
      <div className="sub">Schools, degrees, dates. Most recent first.</div>

      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field">
              <label>Degree</label>
              <input value={it.degree} onChange={e => updateItem(i, { degree: e.target.value })} />
            </div>
            <div className="field">
              <label>School · Location · Year</label>
              <input value={it.school} onChange={e => updateItem(i, { school: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add education</button>
    </>
  );
}

function CVBSkills({ cv, updateCv }) {
  const items = cv.skills || [];
  const [input, setInput] = useState('');
  const add = () => {
    if (!input.trim()) return;
    updateCv({ skills: [...items, input.trim()] });
    setInput('');
  };
  const rm = (i) => updateCv({ skills: items.filter((_, j) => j !== i) });

  return (
    <>
      <div className="crumb">Section 05 · Skills</div>
      <h3>What you're <span className="it">good</span> at.</h3>
      <div className="sub">Comma-separated tags. First one renders as the primary pill in your CV.</div>

      <div className="field">
        <label>Add a skill</label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="e.g. Figma · then press Enter"
        />
      </div>

      <div className="chip-row" style={{ marginTop: 14 }}>
        {items.map((t, i) => (
          <span key={i} className="chip">
            {t}<span className="x" onClick={() => rm(i)}>✕</span>
          </span>
        ))}
        <span className="chip add" onClick={add}>+ Add</span>
      </div>
    </>
  );
}

function CVBLanguages({ cv, updateCv }) {
  const items = cv.languages || [];
  const setItems = (next) => updateCv({ languages: next });
  const updateItem = (i, patch) => setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { name: 'Language', level: 'Working · B2' }]);
  const rmItem = (i) => setItems(items.filter((_, j) => j !== i));

  return (
    <>
      <div className="crumb">Section 06 · Languages</div>
      <h3>What you <span className="it">speak.</span></h3>
      <div className="sub">Most fluent first. Use CEFR (A1–C2) or simple words like Native / Fluent / Working.</div>

      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field-row">
              <div className="field">
                <label>Language</label>
                <input value={it.name} onChange={e => updateItem(i, { name: e.target.value })} />
              </div>
              <div className="field">
                <label>Level</label>
                <input value={it.level} onChange={e => updateItem(i, { level: e.target.value })} placeholder="Native · Fluent · C2 · B2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add language</button>
    </>
  );
}

function CVBProjects({ cv, updateCv }) {
  const items = cv.projects || [];
  const setItems = (next) => updateCv({ projects: next });
  const updateItem = (i, patch) => setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { name: 'Project name', desc: 'One sentence about what & why.' }]);
  const rmItem = (i) => setItems(items.filter((_, j) => j !== i));

  return (
    <>
      <div className="crumb">Section 07 · Selected Projects</div>
      <h3>What you've <span className="it">made.</span></h3>
      <div className="sub">2–4 highlights. Name + one-line description. Link them in the bullet if you like.</div>

      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field">
              <label>Project name</label>
              <input value={it.name} onChange={e => updateItem(i, { name: e.target.value })} />
            </div>
            <div className="field">
              <label>One-line description</label>
              <input value={it.desc} onChange={e => updateItem(i, { desc: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add project</button>
    </>
  );
}

/* ---------- Reusable live CV document ---------- */

function CVDocLive({ cv, cvUrl, template = 'editorial' }) {
  const splitName = cv.name.trim().split(/\s+/);
  const lastName = splitName.slice(-1)[0];
  const firstNames = splitName.slice(0, -1).join(' ');

  if (template === 'atelier') {
    return <AtelierCVDoc cv={cv} cvUrl={cvUrl} firstNames={firstNames} lastName={lastName} />;
  }

  return (
    <div className={'cv-doc cv-doc-' + template} style={template === 'modern' ? { padding: '40px 36px 44px' } : {}}>
      <div className="cv-head">
        <div>
          <h3>{firstNames} <span className="it">{lastName}</span></h3>
          <div className="role">{cv.title}</div>
        </div>
        <div className="qr-mini-doc">
          <QRCode value={cvUrl} size={52} fg="#0f0e0c" bg="#f3efe7" style={template === 'modern' ? 'square' : 'rounded'} />
        </div>
      </div>

      <div className="cv-body" style={template === 'modern' ? { gridTemplateColumns: '1fr' } : {}}>
        <div>
          <div className="cv-sec">
            <h4>Contact</h4>
            <p className="cv-paragraph" style={{ marginBottom: 2 }}>{cv.email}</p>
            <p className="cv-paragraph" style={{ marginBottom: 2 }}>{cv.phone}</p>
            <p className="cv-paragraph">{cv.location}</p>
          </div>

          {cv.skills?.length > 0 && (
            <div className="cv-sec">
              <h4>Skills</h4>
              <div>
                {cv.skills.map((s, i) => (
                  <span key={i} className={'cv-tag' + (i === 0 ? ' pri' : '')}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {cv.education?.length > 0 && (
            <div className="cv-sec">
              <h4>Education</h4>
              {cv.education.map((e, i) => (
                <div key={i} style={{ marginBottom: i < cv.education.length - 1 ? 8 : 0 }}>
                  <p className="cv-paragraph" style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{e.degree}</p>
                  <p className="cv-paragraph" style={{ fontStyle: 'italic' }}>{e.school}</p>
                </div>
              ))}
            </div>
          )}

          {cv.languages?.length > 0 && (
            <div className="cv-sec">
              <h4>Languages</h4>
              {cv.languages.map((l, i) => (
                <div key={i} className="cv-lang">
                  <span>{l.name}</span><span>{l.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {cv.summary && (
            <div className="cv-sec">
              <h4>Summary</h4>
              <p className="cv-paragraph">{cv.summary}</p>
            </div>
          )}

          {cv.experience?.length > 0 && (
            <div className="cv-sec">
              <h4>Experience</h4>
              {cv.experience.map((j, i) => (
                <div className="cv-job" key={i}>
                  <div className="j-h"><span>{j.role}</span><span className="yr">{j.years}</span></div>
                  <div className="j-c">{j.co}</div>
                  {j.bullets.filter(Boolean).map((b, k) => <div key={k} className="cv-bullet">{b}</div>)}
                </div>
              ))}
            </div>
          )}

          {cv.projects?.length > 0 && (
            <div className="cv-sec" style={{ marginBottom: 0 }}>
              <h4>Selected Projects</h4>
              {cv.projects.map((p, i) => (
                <div key={i} className="cv-bullet"><b style={{ color: 'var(--ink)' }}>{p.name}</b> — {p.desc}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="cv-watermark">scan to view live · {cvUrl.replace('https://', '')}</div>
    </div>
  );
}

/* ----- Atelier: premium one-column editorial layout ----- */
function AtelierCVDoc({ cv, cvUrl, firstNames, lastName }) {
  const summaryFirst = (cv.summary || '').trim();
  const dropCap = summaryFirst[0] || '·';
  const summaryRest = summaryFirst.slice(1);

  return (
    <div className="cv-doc cv-doc-atelier">
      <div className="atl-margin">
        <div className="atl-ord">N°<span>01</span></div>
        <div className="atl-stamp">— Atelier — </div>
        <div className="atl-year">{new Date().getFullYear()}</div>
      </div>

      <header className="atl-head">
        <div className="atl-eyebrow">— Curriculum Vitæ ·  Limited folio</div>
        <h1 className="atl-name">
          <span className="fn">{firstNames}</span>
          <span className="ln">{lastName}</span>
        </h1>
        <div className="atl-rule">
          <span></span>
          <span className="dot">◆</span>
          <span></span>
        </div>
        <div className="atl-title">{cv.title}</div>
        <div className="atl-loc">
          <span>{cv.location}</span>
          <span className="atl-sep">·</span>
          <span>{cv.email}</span>
          <span className="atl-sep">·</span>
          <span>{cv.phone}</span>
        </div>
      </header>

      {summaryFirst && (
        <section className="atl-sec atl-prelude">
          <p className="atl-summary">
            <span className="atl-drop">{dropCap}</span>{summaryRest}
          </p>
        </section>
      )}

      {cv.experience?.length > 0 && (
        <section className="atl-sec">
          <div className="atl-sec-h">
            <span className="atl-sec-no">I.</span>
            <span className="atl-sec-t">Practice</span>
            <span className="atl-sec-rule"></span>
          </div>
          {cv.experience.map((j, i) => (
            <article className="atl-exp" key={i}>
              <div className="atl-exp-y">{j.years}</div>
              <div className="atl-exp-b">
                <div className="atl-exp-role">{j.role}</div>
                <div className="atl-exp-co">{j.co}</div>
                {j.bullets.filter(Boolean).map((b, k) => (
                  <p key={k} className="atl-bullet">{b}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {cv.projects?.length > 0 && (
        <section className="atl-sec">
          <div className="atl-sec-h">
            <span className="atl-sec-no">II.</span>
            <span className="atl-sec-t">Selected Works</span>
            <span className="atl-sec-rule"></span>
          </div>
          {cv.projects.map((p, i) => (
            <div key={i} className="atl-proj">
              <span className="atl-proj-n">{p.name}</span>
              <span className="atl-proj-d">— {p.desc}</span>
            </div>
          ))}
        </section>
      )}

      <div className="atl-twocol">
        {cv.education?.length > 0 && (
          <section className="atl-sec atl-tight">
            <div className="atl-sec-h">
              <span className="atl-sec-no">III.</span>
              <span className="atl-sec-t">Education</span>
            </div>
            {cv.education.map((e, i) => (
              <div key={i} className="atl-edu">
                <div className="atl-edu-d">{e.degree}</div>
                <div className="atl-edu-s">{e.school}</div>
              </div>
            ))}
          </section>
        )}

        {(cv.skills?.length > 0 || cv.languages?.length > 0) && (
          <section className="atl-sec atl-tight">
            <div className="atl-sec-h">
              <span className="atl-sec-no">IV.</span>
              <span className="atl-sec-t">Atelier Notes</span>
            </div>
            {cv.skills?.length > 0 && (
              <p className="atl-skills">
                <i>Practices —</i> {cv.skills.join(' · ')}
              </p>
            )}
            {cv.languages?.length > 0 && (
              <p className="atl-skills">
                <i>Tongues —</i> {cv.languages.map(l => `${l.name} (${l.level.split(' ·')[0]})`).join(' · ')}
              </p>
            )}
          </section>
        )}
      </div>

      <footer className="atl-foot">
        <div className="atl-foot-qr">
          <QRCode value={cvUrl} size={56} fg="#0f0e0c" bg="#f3efe7" style="dot" />
        </div>
        <div className="atl-foot-t">
          <div className="atl-foot-h">Scan, or read at</div>
          <div className="atl-foot-u">{cvUrl.replace('https://', '')}</div>
        </div>
        <div className="atl-seal">
          <span>Atelier</span>
          <span className="ax">★</span>
          <span>Folio</span>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { CVBuilder, CVDocLive });
