'use client'
import { useState, useMemo, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QrPreview, { type QrPreviewHandle } from './qr-preview'
import BuilderFields, { type BuilderData, DEFAULT_DATA } from './builder-fields'
import StyleIcon from './style-icon'
import { createCode, updateCode, type CodeInput } from '@/app/actions/builder'
import { showToast } from '@/components/toast'
import { hasTier } from '@/lib/utils'
import { ChevronDown, Download, Save, X } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────
interface BuilderType {
  id:     string
  label:  string
  tier:   'free' | 'pro' | 'elite'
  fields: string[]
  desc:   string
}

const BUILDER_TYPES: BuilderType[] = [
  { id: 'identity', label: 'Identity Page',   tier: 'free',  fields: ['name','title','bio','email','phone','avatar','links'], desc: 'A hosted profile behind your code. Edit it any time without reprinting.' },
  { id: 'url',      label: 'Plain URL',        tier: 'free',  fields: ['url'],                                                desc: 'A simple link — fastest to set up.' },
  { id: 'vcard',    label: 'Personal vCard',   tier: 'free',  fields: ['name','title','email','phone'],                       desc: 'A vCard payload — scanners get a "Save Contact" prompt.' },
  { id: 'business', label: 'Business Card',    tier: 'free',  fields: ['name','title','company','email','phone'],             desc: 'A vCard payload — scanners get a "Save Contact" prompt.' },
  { id: 'cv',       label: 'Résumé / CV',      tier: 'free',  fields: ['name','cvLink'],                                      desc: 'The link on your printed résumé that always points to the latest version.' },
  { id: 'wifi',     label: 'WiFi',             tier: 'free',  fields: ['ssid','wifiPass','wifiAuth'],                         desc: 'Embed credentials directly. Phones auto-connect on scan.' },
  { id: 'pet',      label: 'Pet Tag',          tier: 'free',  fields: ['petName','ownerName','phone'],                        desc: "A page strangers see when they scan your pet's collar." },
  { id: 'menu',     label: 'Menu',             tier: 'pro',   fields: ['restaurant','menuUrl'],                               desc: 'A short link to your hosted menu page. Update prices anytime.' },
  { id: 'payment',  label: 'Payment',          tier: 'pro',   fields: ['payProvider','payHandle'],                            desc: 'Payment handle embedded for tap-to-pay.' },
  { id: 'event',    label: 'Event Ticket',     tier: 'pro',   fields: ['eventName','eventDate','eventVenue'],                 desc: 'A calendar invite payload. Adds straight to iOS/Google Calendar.' },
  { id: 'property', label: 'Property',         tier: 'pro',   fields: ['propertyAddr','propertyUrl'],                        desc: 'Property listing page — always points to the latest listing.' },
  { id: 'loyalty',  label: 'Loyalty',          tier: 'pro',   fields: ['businessName','punchTotal'],                         desc: 'Digital punch card — no app install required.' },
  { id: 'geo',      label: 'Geo / Multi',      tier: 'elite', fields: ['geoRules'],                                          desc: 'Same QR, different destinations per country. IP detected at scan.' },
  { id: 'bulk',     label: 'Bulk Codes',       tier: 'elite', fields: [],                                                    desc: 'Generate thousands of QR codes from a CSV. Bundled as ZIP.' },
]

const STYLES = [
  { id: 'square',  label: 'Square',  tier: 'free'  as const },
  { id: 'rounded', label: 'Rounded', tier: 'free'  as const },
  { id: 'dot',     label: 'Dots',    tier: 'free'  as const },
  { id: 'cross',   label: 'Cross',   tier: 'pro'   as const },
  { id: 'organic', label: 'Atelier', tier: 'elite' as const },
]

const COLORS = [
  { hex: '#0f0e0c', name: 'Ink'    },
  { hex: '#c2410c', name: 'Burnt'  },
  { hex: '#1e3a2b', name: 'Forest' },
  { hex: '#8a6d2c', name: 'Gold'   },
  { hex: '#1a3a8a', name: 'Indigo' },
]

const FORMATS = [
  { id: 'png', label: 'PNG', tier: 'free'  as const },
  { id: 'jpg', label: 'JPG', tier: 'free'  as const },
  { id: 'svg', label: 'SVG', tier: 'pro'   as const },
  { id: 'pdf', label: 'PDF', tier: 'pro'   as const },
  { id: 'eps', label: 'EPS', tier: 'elite' as const },
]

const TIER_LBL: Record<string, string> = { free: 'FREE', pro: 'STARTER+', elite: 'PRO+' }

// ── Payload builder ──────────────────────────────────────────────
function buildPayload(typeId: string, data: BuilderData, identitySlug?: string | null): string {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28)
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qdenty.io'
  switch (typeId) {
    case 'url':      return data.url || 'https://qdenty.io'
    case 'vcard':
    case 'business': return ['BEGIN:VCARD','VERSION:3.0',
      `FN:${data.name}`,
      data.company ? `ORG:${data.company}` : '',
      `TITLE:${data.title}`,
      data.email ? `EMAIL:${data.email}` : '',
      data.phone ? `TEL:${data.phone}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n')
    case 'identity': return identitySlug ? `${APP_URL}/u/${identitySlug}` : `${APP_URL}/identity`
    case 'cv':       return data.cvLink || `https://qdenty.io/cv/${slug(data.name || 'cv')}`
    case 'wifi':     return `WIFI:T:${data.wifiAuth};S:${data.ssid};P:${data.wifiPass};;`
    case 'menu':     return data.menuUrl || `https://qdenty.io/m/${slug(data.restaurant || 'menu')}`
    case 'payment':  return `${data.payProvider.toUpperCase()}:${data.payHandle}`
    case 'event':    return `BEGIN:VEVENT\nSUMMARY:${data.eventName}\nDTSTART:${data.eventDate}\nLOCATION:${data.eventVenue}\nEND:VEVENT`
    case 'pet':      return `https://qdenty.io/pet/${slug(data.petName || 'pet')}`
    case 'property': return data.propertyUrl || `https://qdenty.io/p/${slug(data.propertyAddr || 'home')}`
    case 'loyalty':  return `https://qdenty.io/l/${slug(data.businessName || 'shop')}`
    case 'geo':      return `https://qdenty.io/g/${Date.now().toString(36)}`
    case 'bulk':     return `https://qdenty.io/bulk/${Date.now().toString(36)}`
    default:         return 'https://qdenty.io'
  }
}

function codeLabel(typeId: string, data: BuilderData, typeMeta: BuilderType): string {
  return (data.name || data.restaurant || data.businessName || data.petName)
    ? `${data.name || data.restaurant || data.businessName || data.petName} · ${typeMeta.label}`
    : typeMeta.label
}

// ── Props ────────────────────────────────────────────────────────
interface UserIdentity {
  slug:  string | null
  name:  string
  email: string
  title: string
  bio:   string
  phone: string
  links: string[]
}

interface BuilderClientProps {
  planId:        string
  isGuest?:      boolean
  userIdentity?: UserIdentity | null
  editCode: null | {
    id:           string
    type:         string
    color:        string
    status:       string
    templateData: Record<string, unknown> | null
  }
}

// ── Component ────────────────────────────────────────────────────
export default function BuilderClient({ planId, editCode, isGuest, userIdentity }: BuilderClientProps) {
  const router     = useRouter()
  const previewRef = useRef<QrPreviewHandle>(null)
  const [pending, startTrans] = useTransition()

  const identityDefaults: Partial<BuilderData> = userIdentity ? {
    name:  userIdentity.name,
    email: userIdentity.email,
    title: userIdentity.title,
    bio:   userIdentity.bio,
    phone: userIdentity.phone,
    links: userIdentity.links,
  } : {}

  const initialType = editCode?.type ?? 'identity'
  const [typeId, setTypeId] = useState(initialType)
  const [style,  setStyle]  = useState<'square'|'rounded'|'dot'|'cross'|'organic'>('rounded')
  const [color,  setColor]  = useState(editCode?.color ?? '#0f0e0c')
  const [format, setFormat] = useState<'png'|'jpg'|'svg'|'pdf'|'eps'>('png')
  const [customHex, setCustomHex] = useState(false)

  const [data, setData] = useState<BuilderData>({
    ...DEFAULT_DATA,
    ...(initialType === 'identity' ? identityDefaults : {}),
    ...(editCode?.templateData as Partial<BuilderData> ?? {}),
  })

  // ── Mobile bottom-sheet state ──
  type Sheet = 'type' | 'format' | null
  const [sheet, setSheet] = useState<Sheet>(null)
  useEffect(() => {
    if (sheet) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [sheet])

  // ── Shrink the sticky mobile preview once it pins below the nav ──
  const stickySentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const el = stickySentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: '-66px 0px 0px 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const typeMeta  = BUILDER_TYPES.find(t => t.id === typeId)!
  const payload   = useMemo(() => buildPayload(typeId, data, userIdentity?.slug), [typeId, data, userIdentity?.slug])
  const canCustom = hasTier(planId, 'pro')

  const update = (k: keyof BuilderData, v: unknown) =>
    setData(d => ({ ...d, [k]: v }))

  const handleType = (t: BuilderType) => {
    if (!hasTier(planId, t.tier)) {
      showToast(`${TIER_LBL[t.tier]} plan required`)
      return
    }
    setTypeId(t.id)
    if (t.id === 'identity' && userIdentity) {
      setData(d => ({ ...d, ...identityDefaults }))
    }
  }

  const handleStyle = (s: typeof STYLES[0]) => {
    if (!hasTier(planId, s.tier)) {
      showToast(`${TIER_LBL[s.tier]} plan required`)
      return
    }
    setStyle(s.id as typeof style)
  }

  const handleFormat = (f: typeof FORMATS[0]) => {
    if (!hasTier(planId, f.tier)) {
      showToast(`${TIER_LBL[f.tier]} plan required`)
      return
    }
    setFormat(f.id as typeof format)
  }

  const handleDownload = () => {
    const filename   = `qdenty-${typeId}-${Date.now()}`
    const dlFormat   = (format === 'pdf' || format === 'eps') ? 'png' : format
    previewRef.current?.download(dlFormat as 'png' | 'jpg' | 'svg', filename)
  }

  const handleSave = () => {
    if (isGuest) {
      router.push('/sign-in?redirect=/builder')
      return
    }
    const input: CodeInput = {
      label:        codeLabel(typeId, data, typeMeta),
      type:         typeMeta.label,
      payload,
      color,
      status:       'live',
      templateData: data as unknown as Record<string, unknown>,
    }
    startTrans(async () => {
      try {
        if (editCode) {
          await updateCode(editCode.id, input)
          showToast('Code updated')
        } else {
          await createCode(input)
          showToast('Code saved')
          router.push(`/dashboard`)
        }
      } catch {
        showToast('Sign in to save your code')
        router.push('/sign-in?redirect=/builder')
      }
    })
  }

  const typeCategory = typeMeta.tier === 'free' ? 'Free' : typeMeta.tier === 'pro' ? 'Starter' : 'Atelier'

  return (
    <div className="builder">
      {/* ── Mobile sticky preview header ─────────────────── */}
      <div ref={stickySentinel} className="builder-m-sentinel" aria-hidden />
      <div className={'builder-m-prev' + (stuck ? ' stuck' : '')}>
        <div className="m-prev-qr">
          <QrPreview
            payload={payload || 'https://qdenty.io'}
            qrStyle={typeId === 'bulk' ? 'square' : style}
            color={color}
            bg="#f3efe7"
          />
        </div>
        <div className="m-prev-meta">
          <div className="m-prev-lbl">Live · {payload.length} chars</div>
          <button className="m-prev-type" onClick={() => setSheet('type')}>
            <span>{typeMeta.label}</span>
            <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Type rail ────────────────────────────────────── */}
      <aside className="builder-side">
        <div className="side-ttl">QR Type</div>
        <ul>
          {BUILDER_TYPES.map(t => {
            const locked = !hasTier(planId, t.tier)
            return (
              <li
                key={t.id}
                className={(typeId === t.id ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                onClick={() => handleType(t)}
              >
                {t.label}
                <span className="lock">{TIER_LBL[t.tier]}</span>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* ── Form ─────────────────────────────────────────── */}
      <div className="builder-main">
        <div className="crumb">Templates › {typeCategory} › {typeMeta.label}</div>
        <h2>
          {typeMeta.label.split(' ').slice(0, -1).join(' ') || typeMeta.label}{' '}
          <span className="it">{typeMeta.label.split(' ').slice(-1)[0]?.toLowerCase()}</span>
        </h2>
        <p className="sub">{typeMeta.desc}</p>

        <BuilderFields
          fields={typeMeta.fields}
          typeId={typeId}
          data={data}
          update={update}
          userIdentity={userIdentity}
          identityUrl={typeId === 'identity' ? payload : undefined}
        />

        {typeId !== 'bulk' && (
          <>
            {/* Style */}
            <div className="field" style={{ marginTop: 28 }}>
              <label>Code Style</label>
              <div className="style-row">
                {STYLES.map(s => {
                  const locked = !hasTier(planId, s.tier)
                  return (
                    <div
                      key={s.id}
                      className={'swatch' + (style === s.id ? ' on' : '') + (locked ? ' locked' : '')}
                      onClick={() => handleStyle(s)}
                      title={s.label + (locked ? ` · needs ${TIER_LBL[s.tier]}` : '')}
                    >
                      <StyleIcon id={s.id} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Color */}
            <div className="field" style={{ marginTop: 22 }}>
              <label>Foreground colour</label>
              <div className="color-row">
                {COLORS.map(c => (
                  <div
                    key={c.hex}
                    className={'c' + (color === c.hex && !customHex ? ' on' : '')}
                    style={{ background: c.hex }}
                    onClick={() => { setColor(c.hex); setCustomHex(false) }}
                    title={c.name}
                  />
                ))}
                <div
                  className={'c-custom' + (!canCustom ? ' locked' : '') + (customHex ? ' on' : '')}
                  title={canCustom ? 'Pick any colour' : 'Custom HEX requires Starter+'}
                  onClick={() => { if (!canCustom) { showToast('Custom HEX requires Starter+'); return } }}
                >
                  {canCustom ? (
                    <>
                      <input
                        type="color"
                        value={color}
                        onChange={e => { setColor(e.target.value); setCustomHex(true) }}
                      />
                      <span>{color.toUpperCase().slice(1, 4)}</span>
                    </>
                  ) : null}
                </div>
                {canCustom && <span className="note">✓ HEX unlocked</span>}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Preview ──────────────────────────────────────── */}
      <aside className="builder-prev">
        <div className="prev-ttl">
          <span>Live Output</span>
          <span className="live">Updating</span>
        </div>

        <QrPreview
          ref={previewRef}
          payload={payload || 'https://qdenty.io'}
          qrStyle={typeId === 'bulk' ? 'square' : style}
          color={color}
          bg="#f3efe7"
        />

        <div className="prev-info">
          <div><b>Type</b>    <span className="v">{typeMeta.label}</span></div>
          <div><b>Mode</b>    <span className="v">Dynamic</span></div>
          <div><b>Validity</b><span className="v">12 months</span></div>
          <div><b>Payload</b> <span className="v">{payload.length} chars</span></div>
        </div>

        <div className="prev-actions">
          <button className="a-pri" onClick={handleDownload} disabled={pending}>
            Download {format.toUpperCase()}
          </button>
          <button className="a-sec" onClick={handleSave} disabled={pending}>
            {pending ? 'Saving…' : isGuest ? 'Sign in to save' : editCode ? 'Update code' : 'Save to dashboard'}
          </button>
          <div className="fmt">
            {FORMATS.map(f => {
              const locked = !hasTier(planId, f.tier)
              return (
                <span
                  key={f.id}
                  className={(format === f.id ? 'on ' : '') + (locked ? 'locked' : '')}
                  onClick={() => handleFormat(f)}
                >
                  {f.label}{locked ? ' ★' : ''}
                </span>
              )
            })}
          </div>
        </div>
      </aside>

      {/* ── Mobile sticky action bar ─────────────────────── */}
      <div className="builder-m-actions">
        <button className="m-act-fmt" onClick={() => setSheet('format')}>
          <span className="lbl">{format.toUpperCase()}</span>
          <ChevronDown size={12} strokeWidth={2} />
        </button>
        <button className="m-act-dl" onClick={handleDownload} disabled={pending}>
          <Download size={15} strokeWidth={2} />
          <span>Download</span>
        </button>
        <button className="m-act-save" onClick={handleSave} disabled={pending}>
          <Save size={15} strokeWidth={2} />
          <span>{pending ? '...' : editCode ? 'Update' : 'Save'}</span>
        </button>
      </div>

      {/* ── Bottom sheets ────────────────────────────────── */}
      {sheet && (
        <div className="m-sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="m-sheet" onClick={e => e.stopPropagation()}>
            <div className="m-sheet-head">
              <div className="m-sheet-handle" />
              <div className="m-sheet-row">
                <h3>{sheet === 'type' ? 'Choose QR Type' : 'Export Format'}</h3>
                <button className="m-sheet-x" onClick={() => setSheet(null)} aria-label="Close">
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {sheet === 'type' && (
              <ul className="m-sheet-list">
                {BUILDER_TYPES.map(t => {
                  const locked = !hasTier(planId, t.tier)
                  return (
                    <li
                      key={t.id}
                      className={(typeId === t.id ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                      onClick={() => { handleType(t); if (hasTier(planId, t.tier)) setSheet(null) }}
                    >
                      <div className="m-sheet-li-l">
                        <span className="m-sheet-li-t">{t.label}</span>
                        <span className="m-sheet-li-d">{t.desc}</span>
                      </div>
                      <span className="m-sheet-li-tier">{TIER_LBL[t.tier]}</span>
                    </li>
                  )
                })}
              </ul>
            )}

            {sheet === 'format' && (
              <ul className="m-sheet-fmt">
                {FORMATS.map(f => {
                  const locked = !hasTier(planId, f.tier)
                  return (
                    <li
                      key={f.id}
                      className={(format === f.id ? 'on ' : '') + (locked ? 'tier-locked' : '')}
                      onClick={() => { handleFormat(f); if (hasTier(planId, f.tier)) setSheet(null) }}
                    >
                      <span className="m-sheet-fmt-t">{f.label}</span>
                      <span className="m-sheet-fmt-tier">{locked ? TIER_LBL[f.tier] : 'Free'}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
