import type { CvData } from '@/db/schema'
import MarketingQr from '@/components/marketing/marketing-qr'

interface Props {
  cv:       CvData
  cvUrl:    string
  template: 'editorial' | 'modern' | 'atelier'
}

export default function CvDocLive({ cv, cvUrl, template }: Props) {
  const parts     = cv.name.trim().split(/\s+/)
  const lastName  = parts.slice(-1)[0] ?? ''
  const firstNames = parts.slice(0, -1).join(' ')

  if (template === 'atelier') {
    return <AtelierDoc cv={cv} cvUrl={cvUrl} firstNames={firstNames} lastName={lastName} />
  }

  return (
    <div
      className={'cv-doc cv-doc-' + template}
      style={{ position: 'relative', ...(template === 'modern' ? { padding: '40px 36px 44px' } : {}) }}
    >
      <div className="cv-head">
        <div>
          <h3>{firstNames} <span className="it">{lastName}</span></h3>
          <div className="role">{cv.title}</div>
        </div>
        <div className="qr-mini-doc">
          <MarketingQr value={cvUrl} size={64} color="#0f0e0c" bg="transparent" />
        </div>
      </div>

      <div className="cv-body" style={template === 'modern' ? { gridTemplateColumns: '1fr' } : {}}>
        {/* Left column */}
        <div>
          <div className="cv-sec">
            <h4>Contact</h4>
            <p className="cv-paragraph">{cv.email}</p>
            <p className="cv-paragraph">{cv.phone}</p>
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

        {/* Right column */}
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
                  {j.bullets.filter(Boolean).map((b, k) => (
                    <div key={k} className="cv-bullet">{b}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {cv.projects?.length > 0 && (
            <div className="cv-sec" style={{ marginBottom: 0 }}>
              <h4>Selected Projects</h4>
              {cv.projects.map((p, i) => (
                <div key={i} className="cv-bullet">
                  <b style={{ color: 'var(--ink)' }}>{p.name}</b> — {p.desc}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="cv-watermark">scan to view live · {cvUrl.replace('https://', '')}</div>
    </div>
  )
}


function AtelierDoc({ cv, cvUrl, firstNames, lastName }: {
  cv: CvData; cvUrl: string; firstNames: string; lastName: string
}) {
  const summaryFull = (cv.summary ?? '').trim()
  const dropCap     = summaryFull[0] ?? '·'
  const summaryRest = summaryFull.slice(1)
  const year        = new Date().getFullYear()

  return (
    <div className="cv-doc cv-doc-atelier">
      <div className="atl-margin">
        <div className="atl-ord">N°<span>01</span></div>
        <div className="atl-stamp">— Atelier —</div>
        <div className="atl-year">{year}</div>
      </div>

      <header className="atl-head">
        <div className="atl-eyebrow">— Curriculum Vitæ · Limited folio</div>
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

      {summaryFull && (
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
              <span className="atl-proj-d"> — {p.desc}</span>
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
                <i>Tongues —</i>{' '}
                {cv.languages.map(l => `${l.name} (${l.level.split(' ·')[0]})`).join(' · ')}
              </p>
            )}
          </section>
        )}
      </div>

      <footer className="atl-foot">
        <div className="atl-foot-qr">
          <MarketingQr value={cvUrl} size={56} color="#8a6d2c" bg="transparent" />
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
  )
}

