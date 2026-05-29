'use client'
import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { saveCv }     from '@/app/actions/cv'
import { showToast }  from '@/components/toast'
import { hasTier }    from '@/lib/utils'
import CvDocLive      from './cv-doc-live'
import ScaledCvDoc    from './scaled-cv-doc'
import { ChevronDown, Eye, Send, Layers, X } from 'lucide-react'
import type { CvData } from '@/db/schema'

const TEMPLATE_LABEL: Record<CvData['template'], string> = {
  editorial: 'Editorial',
  modern:    'Modern',
  atelier:   'Atelier',
}

const CVB_SECTIONS = [
  { id: 'personal',   n: '01', label: 'Personal'   },
  { id: 'summary',    n: '02', label: 'Summary'     },
  { id: 'experience', n: '03', label: 'Experience'  },
  { id: 'education',  n: '04', label: 'Education'   },
  { id: 'skills',     n: '05', label: 'Skills'      },
  { id: 'languages',  n: '06', label: 'Languages'   },
  { id: 'projects',   n: '07', label: 'Projects'    },
] as const

const EMPTY_CV: CvData = {
  name: '', title: '', email: '', phone: '', location: '',
  summary: '', template: 'editorial',
  experience: [], education: [], skills: [], languages: [], projects: [],
}

interface Props {
  planId:   string
  slug:     string
  initial:  CvData | null
}

export default function CvBuilderClient({ planId, slug, initial }: Props) {
  const [section,  setSection]  = useState<string>('personal')
  const [cv,       setCv]       = useState<CvData>(initial ?? EMPTY_CV)
  const [pending,  start]       = useTransition()
  const canAtelier = hasTier(planId, 'pro')
  const cvUrl = `https://qdenty.io/cv/${slug}`

  // ── Mobile bottom-sheet state ──
  type Sheet = 'sections' | 'template' | 'preview' | null
  const [sheet, setSheet] = useState<Sheet>(null)
  // Separate flag: template picker opened from *inside* the preview sheet
  const [prevTmplOpen, setPrevTmplOpen] = useState(false)
  useEffect(() => {
    if (sheet) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [sheet])

  // ── Swipe-down-to-dismiss for the full-screen preview sheet ──
  const prevSheetRef = useRef<HTMLDivElement>(null)
  const dragStartY   = useRef<number | null>(null)
  const onPrevTouchStart = (e: React.TouchEvent) => { dragStartY.current = e.touches[0].clientY }
  const onPrevTouchMove  = (e: React.TouchEvent) => {
    if (dragStartY.current == null || !prevSheetRef.current) return
    const dy = e.touches[0].clientY - dragStartY.current
    if (dy > 0) {
      prevSheetRef.current.style.transition = 'none'
      prevSheetRef.current.style.transform  = `translateY(${dy}px)`
    }
  }
  const onPrevTouchEnd = (e: React.TouchEvent) => {
    const start = dragStartY.current
    dragStartY.current = null
    const el = prevSheetRef.current
    if (start == null || !el) return
    const dy = e.changedTouches[0].clientY - start
    el.style.transition = ''
    el.style.transform  = ''
    if (dy > 120) setSheet(null)
  }

  const update = useCallback((patch: Partial<CvData>) => {
    setCv(prev => ({ ...prev, ...patch }))
  }, [])

  const handlePublish = () => {
    start(async () => {
      await saveCv(cv)
      showToast('CV published · ' + cvUrl)
    })
  }

  const activeSection = CVB_SECTIONS.find(s => s.id === section) ?? CVB_SECTIONS[0]

  return (
    <div className="cvb-frame">
      {/* ── Mobile sticky section tabs (horizontal scroll) ── */}
      <div className="cvb-m-tabs">
        {CVB_SECTIONS.map(s => (
          <button
            key={s.id}
            className={`cvb-m-tab${section === s.id ? ' on' : ''}`}
            onClick={() => setSection(s.id)}
          >
            <span className="n">{s.n}</span>
            <span className="lbl">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Section rail */}
      <aside className="cvb-rail">
        <div className="rail-ttl">Sections</div>
        <ul>
          {CVB_SECTIONS.map(s => (
            <li
              key={s.id}
              className={section === s.id ? 'on' : ''}
              onClick={() => setSection(s.id)}
            >
              <span>{s.label}</span>
              <span className="n">{s.n}</span>
            </li>
          ))}
        </ul>
        <div style={{ padding: '16px 22px', borderTop: '1px dashed var(--rule)', marginTop: 14 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8,
          }}>Template</div>
          <select
            value={cv.template}
            onChange={e => update({ template: e.target.value as CvData['template'] })}
            style={{
              width: '100%', padding: '8px 0',
              fontFamily: 'var(--serif)', fontSize: 15,
              background: 'transparent', border: 'none',
              borderBottom: '1.5px solid var(--ink)', outline: 'none',
            }}
          >
            <option value="editorial">Editorial · default</option>
            <option value="modern">Modern · free</option>
            <option value="atelier" disabled={!canAtelier}>
              {canAtelier ? 'Atelier · Premium' : 'Atelier · Pro+'}
            </option>
          </select>
        </div>
      </aside>

      {/* Form pane */}
      <div className="cvb-form">
        {section === 'personal'   && <SectionPersonal   cv={cv} update={update} />}
        {section === 'summary'    && <SectionSummary    cv={cv} update={update} />}
        {section === 'experience' && <SectionExperience cv={cv} update={update} />}
        {section === 'education'  && <SectionEducation  cv={cv} update={update} />}
        {section === 'skills'     && <SectionSkills     cv={cv} update={update} />}
        {section === 'languages'  && <SectionLanguages  cv={cv} update={update} />}
        {section === 'projects'   && <SectionProjects   cv={cv} update={update} />}
      </div>

      {/* Preview pane */}
      <aside className="cvb-preview">
        <div className="prev-ttl">
          <span>Live Preview</span>
          <span className="live">Synced</span>
        </div>

        <CvDocLive cv={cv} cvUrl={cvUrl} template={cv.template} />

        <div className="cvb-actions">
          <button className="a-pri" onClick={handlePublish} disabled={pending}>
            {pending ? 'Saving…' : 'Publish & copy link'}
          </button>
          <button className="a-sec" onClick={() => showToast('PDF export coming soon')}>
            Export PDF · DOCX
          </button>
          <div style={{
            display: 'flex', gap: 6, justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.15em',
            color: 'var(--ink-mute)', marginTop: 6,
          }}>
            <span style={{ padding: '4px 8px', border: '1px solid var(--ink)', color: 'var(--ink)' }}>PDF</span>
            <span style={{ padding: '4px 8px', border: '1px solid var(--rule)' }}>DOCX</span>
            <span style={{ padding: '4px 8px', border: '1px solid var(--rule)' }}>WEB</span>
            <span style={{
              padding: '4px 8px', border: '1px solid var(--rule)',
              color: canAtelier ? 'var(--ink)' : 'var(--ink-mute)',
            }}>
              ATS{!canAtelier ? ' ★' : ''}
            </span>
          </div>
        </div>
      </aside>

      {/* ── Mobile sticky action bar ─────────────────────── */}
      <div className="cvb-m-actions">
        <button className="cvb-m-tmpl" onClick={() => setSheet('template')}>
          <Layers size={13} strokeWidth={2} />
          <span>{TEMPLATE_LABEL[cv.template]}</span>
          <ChevronDown size={11} strokeWidth={2} />
        </button>
        <button className="cvb-m-prev-btn" onClick={() => setSheet('preview')}>
          <Eye size={14} strokeWidth={2} />
          <span>Preview</span>
        </button>
        <button className="cvb-m-pub" onClick={handlePublish} disabled={pending}>
          <Send size={14} strokeWidth={2} />
          <span>{pending ? '...' : 'Publish'}</span>
        </button>
      </div>

      {/* ── Template picker bottom sheet ─────────────────── */}
      {sheet === 'template' && (
        <div className="m-sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="m-sheet" onClick={e => e.stopPropagation()}>
            <div className="m-sheet-head">
              <div className="m-sheet-handle" />
              <div className="m-sheet-row">
                <h3>Choose Template</h3>
                <button className="m-sheet-x" onClick={() => setSheet(null)} aria-label="Close">
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
            <ul className="m-sheet-list">
              {(['editorial', 'modern', 'atelier'] as const).map(t => {
                const locked = t === 'atelier' && !canAtelier
                const desc =
                  t === 'editorial' ? 'Classic two-column layout. Best for most roles.' :
                  t === 'modern'    ? 'Clean single-column. Great for ATS scanners.' :
                                      'Premium hand-bound folio aesthetic.'
                return (
                  <li
                    key={t}
                    className={(cv.template === t ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                    onClick={() => {
                      if (locked) { showToast('Atelier requires Pro+'); return }
                      update({ template: t }); setSheet(null)
                    }}
                  >
                    <div className="m-sheet-li-l">
                      <span className="m-sheet-li-t">{TEMPLATE_LABEL[t]}</span>
                      <span className="m-sheet-li-d">{desc}</span>
                    </div>
                    <span className="m-sheet-li-tier">{locked ? 'PRO' : 'FREE'}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* ── Full-screen preview sheet ───────────────────── */}
      {sheet === 'preview' && (
        <div className="cvb-m-prev-sheet" ref={prevSheetRef}>
          <div
            className="cvb-m-prev-head"
            onTouchStart={onPrevTouchStart}
            onTouchMove={onPrevTouchMove}
            onTouchEnd={onPrevTouchEnd}
          >
            <div className="cvb-m-prev-grip" />
            <div className="cvb-m-prev-head-row">
              <div className="lbl">Live Preview · {TEMPLATE_LABEL[cv.template]}</div>
              <div className="cvb-m-prev-hint">↕ drag to dismiss</div>
            </div>
          </div>
          <div className="cvb-m-prev-body">
            <ScaledCvDoc cv={cv} cvUrl={cvUrl} />
          </div>

          {/* Template picker overlay — same sheet as the editing interface */}
          {prevTmplOpen && (
            <div className="m-sheet-backdrop cvb-pv-tmpl-backdrop" onClick={() => setPrevTmplOpen(false)}>
              <div className="m-sheet" onClick={e => e.stopPropagation()}>
                <div className="m-sheet-head">
                  <div className="m-sheet-handle" />
                  <div className="m-sheet-row">
                    <h3>Choose Template</h3>
                    <button className="m-sheet-x" onClick={() => setPrevTmplOpen(false)} aria-label="Close">
                      <X size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                <ul className="m-sheet-list">
                  {(['editorial', 'modern', 'atelier'] as const).map(t => {
                    const locked = t === 'atelier' && !canAtelier
                    const desc =
                      t === 'editorial' ? 'Classic two-column layout. Best for most roles.' :
                      t === 'modern'    ? 'Clean single-column. Great for ATS scanners.' :
                                          'Premium hand-bound folio aesthetic.'
                    return (
                      <li
                        key={t}
                        className={(cv.template === t ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                        onClick={() => {
                          if (locked) { showToast('Atelier requires Pro+'); return }
                          update({ template: t })
                          setPrevTmplOpen(false)
                        }}
                      >
                        <div className="m-sheet-li-l">
                          <span className="m-sheet-li-t">{TEMPLATE_LABEL[t]}</span>
                          <span className="m-sheet-li-d">{desc}</span>
                        </div>
                        <span className="m-sheet-li-tier">{locked ? 'PRO' : 'FREE'}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
          <div className="cvb-m-prev-foot">
            {/* Template button — opens picker on top of preview */}
            <button
              className="cvb-pv-tmpl"
              onClick={() => setPrevTmplOpen(true)}
              title="Change template"
              style={{ touchAction: 'manipulation' }}
            >
              <Layers size={13} strokeWidth={2} />
              <span className="cvb-pv-tmpl-name">{TEMPLATE_LABEL[cv.template]}</span>
              <ChevronDown size={11} strokeWidth={2} />
            </button>

            <button className="cvb-pv-pub" onClick={handlePublish} disabled={pending}>
              <Send size={14} strokeWidth={2} />
              {pending ? 'Publishing…' : 'Publish'}
            </button>

            <button
              className="cvb-pv-close"
              onClick={() => setSheet(null)}
              aria-label="Close preview"
              style={{ touchAction: 'manipulation' }}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Section: Personal ─── */
function SectionPersonal({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  return (
    <>
      <div className="crumb">Section 01 · Personal</div>
      <h3>The <span className="it">basics.</span></h3>
      <div className="sub">Name and title get the most weight — they're the first thing a recruiter sees.</div>
      <div className="form-stack">
        <div className="field-row">
          <div className="field">
            <label>Full Name</label>
            <input value={cv.name} onChange={e => update({ name: e.target.value })} />
          </div>
          <div className="field">
            <label>Title / Role</label>
            <input value={cv.title} onChange={e => update({ title: e.target.value })} placeholder="e.g. Editorial Designer · Type / Brand" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input type="email" value={cv.email} onChange={e => update({ email: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={cv.phone} onChange={e => update({ phone: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input value={cv.location} onChange={e => update({ location: e.target.value })} placeholder="City, Country · Region" />
        </div>
      </div>
    </>
  )
}

/* ─── Section: Summary ─── */
function SectionSummary({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  return (
    <>
      <div className="crumb">Section 02 · Summary</div>
      <h3>Why <span className="it">you,</span> in 4 lines.</h3>
      <div className="sub">Keep it to 3–4 sentences. Recruiters read this first.</div>
      <div className="field">
        <label>Summary · 400 chars max</label>
        <textarea
          rows={6}
          maxLength={400}
          value={cv.summary}
          onChange={e => update({ summary: e.target.value })}
          style={{ fontSize: 16, lineHeight: 1.55 }}
        />
        <div className="field-hint">{cv.summary.length} / 400 characters</div>
      </div>
    </>
  )
}

/* ─── Section: Experience ─── */
function SectionExperience({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  const items    = cv.experience ?? []
  const setItems = (next: CvData['experience']) => update({ experience: next })
  const upd      = (i: number, patch: Partial<CvData['experience'][0]>) =>
    setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it))
  const addItem  = () => setItems([...items, { role: 'New role', years: 'YYYY — YYYY', co: 'Company · City', bullets: [''] }])
  const rmItem   = (i: number) => setItems(items.filter((_, j) => j !== i))
  const setBul   = (i: number, k: number, v: string) =>
    upd(i, { bullets: items[i].bullets.map((b, m) => m === k ? v : b) })
  const addBul   = (i: number) => upd(i, { bullets: [...items[i].bullets, ''] })
  const rmBul    = (i: number, k: number) =>
    upd(i, { bullets: items[i].bullets.filter((_, m) => m !== k) })

  return (
    <>
      <div className="crumb">Section 03 · Experience</div>
      <h3>Where you've <span className="it">been.</span></h3>
      <div className="sub">Most recent first. Use bullets to call out concrete outcomes.</div>
      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field-row">
              <div className="field">
                <label>Role</label>
                <input value={it.role} onChange={e => upd(i, { role: e.target.value })} />
              </div>
              <div className="field">
                <label>Years</label>
                <input value={it.years} onChange={e => upd(i, { years: e.target.value })} placeholder="2022 — Now" />
              </div>
            </div>
            <div className="field">
              <label>Company · Location</label>
              <input value={it.co} onChange={e => upd(i, { co: e.target.value })} />
            </div>
            <div className="field">
              <label>Bullets</label>
              <div className="cvb-bullets">
                {it.bullets.map((b, k) => (
                  <div key={k} className="bul-row">
                    <input value={b} onChange={e => setBul(i, k, e.target.value)} />
                    <span className="rmb" onClick={() => rmBul(i, k)}>✕</span>
                  </div>
                ))}
                <button
                  className="add-row-btn"
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: 9 }}
                  onClick={() => addBul(i)}
                >
                  + Add bullet
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add experience</button>
    </>
  )
}

/* ─── Section: Education ─── */
function SectionEducation({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  const items    = cv.education ?? []
  const setItems = (next: CvData['education']) => update({ education: next })
  const upd      = (i: number, patch: Partial<CvData['education'][0]>) =>
    setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it))
  const addItem  = () => setItems([...items, { degree: 'Degree', school: 'School · City · Year' }])
  const rmItem   = (i: number) => setItems(items.filter((_, j) => j !== i))

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
              <input value={it.degree} onChange={e => upd(i, { degree: e.target.value })} />
            </div>
            <div className="field">
              <label>School · Location · Year</label>
              <input value={it.school} onChange={e => upd(i, { school: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add education</button>
    </>
  )
}

/* ─── Section: Skills ─── */
function SectionSkills({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  const [input, setInput] = useState('')
  const items = cv.skills ?? []
  const add = () => {
    if (!input.trim()) return
    update({ skills: [...items, input.trim()] })
    setInput('')
  }
  const rm = (i: number) => update({ skills: items.filter((_, j) => j !== i) })

  return (
    <>
      <div className="crumb">Section 05 · Skills</div>
      <h3>What you're <span className="it">good</span> at.</h3>
      <div className="sub">First one renders as the primary pill. Press Enter to add.</div>
      <div className="field">
        <label>Add a skill</label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
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
  )
}

/* ─── Section: Languages ─── */
function SectionLanguages({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  const items    = cv.languages ?? []
  const setItems = (next: CvData['languages']) => update({ languages: next })
  const upd      = (i: number, patch: Partial<CvData['languages'][0]>) =>
    setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it))
  const addItem  = () => setItems([...items, { name: 'Language', level: 'Working · B2' }])
  const rmItem   = (i: number) => setItems(items.filter((_, j) => j !== i))

  return (
    <>
      <div className="crumb">Section 06 · Languages</div>
      <h3>What you <span className="it">speak.</span></h3>
      <div className="sub">Most fluent first. Use CEFR (A1–C2) or Native / Fluent / Working.</div>
      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field-row">
              <div className="field">
                <label>Language</label>
                <input value={it.name} onChange={e => upd(i, { name: e.target.value })} />
              </div>
              <div className="field">
                <label>Level</label>
                <input value={it.level} onChange={e => upd(i, { level: e.target.value })} placeholder="Native · C2 · B2" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add language</button>
    </>
  )
}

/* ─── Section: Projects ─── */
function SectionProjects({ cv, update }: { cv: CvData; update: (p: Partial<CvData>) => void }) {
  const items    = cv.projects ?? []
  const setItems = (next: CvData['projects']) => update({ projects: next })
  const upd      = (i: number, patch: Partial<CvData['projects'][0]>) =>
    setItems(items.map((it, j) => j === i ? { ...it, ...patch } : it))
  const addItem  = () => setItems([...items, { name: 'Project name', desc: 'One sentence about what & why.' }])
  const rmItem   = (i: number) => setItems(items.filter((_, j) => j !== i))

  return (
    <>
      <div className="crumb">Section 07 · Selected Projects</div>
      <h3>What you've <span className="it">made.</span></h3>
      <div className="sub">2–4 highlights. Name + one-line description.</div>
      <div className="cvb-list">
        {items.map((it, i) => (
          <div key={i} className="cvb-item">
            <span className="rm-x" onClick={() => rmItem(i)}>✕</span>
            <div className="field">
              <label>Project name</label>
              <input value={it.name} onChange={e => upd(i, { name: e.target.value })} />
            </div>
            <div className="field">
              <label>One-line description</label>
              <input value={it.desc} onChange={e => upd(i, { desc: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" style={{ marginTop: 14 }} onClick={addItem}>+ Add project</button>
    </>
  )
}
