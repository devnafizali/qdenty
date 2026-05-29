'use client'

export interface BuilderData {
  name:          string
  title:         string
  email:         string
  phone:         string
  bio:           string
  company:       string
  url:           string
  ssid:          string
  wifiPass:      string
  wifiAuth:      string
  restaurant:    string
  menuUrl:       string
  payProvider:   string
  payHandle:     string
  eventName:     string
  eventDate:     string
  eventVenue:    string
  petName:       string
  ownerName:     string
  propertyAddr:  string
  propertyUrl:   string
  businessName:  string
  punchTotal:    number
  cvLink:        string
  links:         string[]
  geoRules:      { country: string; url: string }[]
}

export const DEFAULT_DATA: BuilderData = {
  name: '', title: '', email: '', phone: '', bio: '', company: '',
  url: 'https://', ssid: '', wifiPass: '', wifiAuth: 'WPA',
  restaurant: '', menuUrl: '', payProvider: 'paypal', payHandle: '',
  eventName: '', eventDate: '', eventVenue: '',
  petName: '', ownerName: '', propertyAddr: '', propertyUrl: '',
  businessName: '', punchTotal: 10, cvLink: '', links: [],
  geoRules: [{ country: '*', url: 'https://' }],
}

const COUNTRY_OPTS: [string, string][] = [
  ['BD','Bangladesh'], ['IN','India'], ['PK','Pakistan'], ['LK','Sri Lanka'],
  ['US','United States'], ['GB','United Kingdom'], ['DE','Germany'],
  ['FR','France'], ['IT','Italy'], ['ES','Spain'], ['PT','Portugal'],
  ['CA','Canada'], ['AU','Australia'], ['JP','Japan'], ['SG','Singapore'],
  ['AE','UAE'], ['SA','Saudi Arabia'], ['ZA','South Africa'],
  ['*','Everywhere else (fallback)'],
]

interface IdentityInfo {
  slug:  string | null
  name:  string
  email: string
  title: string
  bio:   string
  phone: string
  links: string[]
}

interface FieldsProps {
  fields:       string[]
  typeId:       string
  data:         BuilderData
  update:       (k: keyof BuilderData, v: unknown) => void
  userIdentity?: IdentityInfo | null
  identityUrl?:  string
}

export default function BuilderFields({ fields, typeId, data, update, userIdentity, identityUrl }: FieldsProps) {
  const has = (k: string) => fields.includes(k)

  if (typeId === 'identity') {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qdenty.io'
    const url = identityUrl || (userIdentity?.slug ? `${APP_URL}/u/${userIdentity.slug}` : null)
    return (
      <div className="form-stack">
        <div className="identity-builder-card">
          <div className="ibc-head">
            <div className="ibc-avatar">{(userIdentity?.name || 'U').slice(0,2).toUpperCase()}</div>
            <div>
              <div className="ibc-name">{userIdentity?.name || '—'}</div>
              <div className="ibc-title">{userIdentity?.title || 'No title set'}</div>
            </div>
          </div>
          {userIdentity?.bio && <p className="ibc-bio">{userIdentity.bio}</p>}
          <div className="ibc-row">
            {userIdentity?.email && <span className="ibc-tag">{userIdentity.email}</span>}
            {userIdentity?.phone && <span className="ibc-tag">{userIdentity.phone}</span>}
          </div>
          {url ? (
            <div className="ibc-url-row">
              <span className="ibc-url-label">QR links to</span>
              <span className="ibc-url">{url}</span>
              <a href={url} target="_blank" rel="noopener" className="ibc-url-btn">↗ Preview</a>
            </div>
          ) : (
            <div className="ibc-no-slug">
              <span>⚠ No public slug set.</span>
              <a href="/account/profile">Set your slug in Profile settings →</a>
            </div>
          )}
          <a href="/account/profile" className="ibc-edit-link">Edit identity page details →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="form-stack">

      {has('url') && (
        <div className="field">
          <label>Destination URL</label>
          <input
            type="url"
            value={data.url}
            onChange={e => update('url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      )}

      {(has('name') || has('title')) && (
        <div className="field-row">
          {has('name') && (
            <div className="field">
              <label>Full Name</label>
              <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Adelaide Marlow"/>
            </div>
          )}
          {has('title') && (
            <div className="field">
              <label>Display Title</label>
              <input value={data.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Editorial Designer"/>
            </div>
          )}
        </div>
      )}

      {has('company') && (
        <div className="field">
          <label>Company / Studio</label>
          <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Casa Editorial"/>
        </div>
      )}

      {has('bio') && (
        <div className="field">
          <label>Short Bio · 240 chars</label>
          <textarea rows={2} maxLength={240} value={data.bio} onChange={e => update('bio', e.target.value)} placeholder="The story behind the scan."/>
        </div>
      )}

      {(has('email') || has('phone')) && (
        <div className="field-row">
          {has('email') && (
            <div className="field">
              <label>Email</label>
              <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="hello@example.com"/>
            </div>
          )}
          {has('phone') && (
            <div className="field">
              <label>Phone</label>
              <input value={data.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 555 0184"/>
            </div>
          )}
        </div>
      )}

      {has('avatar') && (
        <div className="field">
          <label>Avatar / Photo</label>
          <label className="upload-zone">
            <div className="uz-l">
              Drop or upload
              <span>PNG, JPG · max 5 MB · square recommended</span>
            </div>
            <div className="uz-btn">Browse</div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => update('name', reader.result as string)
                reader.readAsDataURL(f)
              }}
            />
          </label>
        </div>
      )}

      {has('links') && (
        <div className="field">
          <label>Linked Profiles · up to 8</label>
          <div className="chip-row">
            {data.links.map((l, i) => (
              <span key={i} className="chip">
                {l}
                <span className="x" onClick={() => update('links', data.links.filter((_, j) => j !== i))}>✕</span>
              </span>
            ))}
            {data.links.length < 8 && (
              <span className="chip add" onClick={() => {
                const v = window.prompt('Profile name (e.g. Behance)')
                if (v?.trim()) update('links', [...data.links, v.trim()])
              }}>+ Add</span>
            )}
          </div>
        </div>
      )}

      {has('ssid') && (
        <div className="field-row">
          <div className="field">
            <label>Network (SSID)</label>
            <input value={data.ssid} onChange={e => update('ssid', e.target.value)} placeholder="MyWiFi"/>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={data.wifiPass} onChange={e => update('wifiPass', e.target.value)} placeholder="••••••"/>
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
          <input value={data.restaurant} onChange={e => update('restaurant', e.target.value)} placeholder="Casa Editorial"/>
        </div>
      )}

      {has('menuUrl') && (
        <div className="field">
          <label>Menu URL (optional)</label>
          <input value={data.menuUrl} onChange={e => update('menuUrl', e.target.value)} placeholder="https://your-menu.com"/>
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
            <input value={data.payHandle} onChange={e => update('payHandle', e.target.value)} placeholder="@username"/>
          </div>
        </div>
      )}

      {has('eventName') && (
        <>
          <div className="field">
            <label>Event name</label>
            <input value={data.eventName} onChange={e => update('eventName', e.target.value)} placeholder="Spring Launch"/>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Date · ISO 8601</label>
              <input value={data.eventDate} onChange={e => update('eventDate', e.target.value)} placeholder="20260520T180000"/>
            </div>
            <div className="field">
              <label>Venue</label>
              <input value={data.eventVenue} onChange={e => update('eventVenue', e.target.value)} placeholder="Casa Editorial"/>
            </div>
          </div>
        </>
      )}

      {has('petName') && (
        <>
          <div className="field">
            <label>Pet name</label>
            <input value={data.petName} onChange={e => update('petName', e.target.value)} placeholder="Tinta"/>
          </div>
          <div className="field">
            <label>Owner name</label>
            <input value={data.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Adelaide Marlow"/>
          </div>
        </>
      )}

      {has('propertyAddr') && (
        <div className="field">
          <label>Property address</label>
          <input value={data.propertyAddr} onChange={e => update('propertyAddr', e.target.value)} placeholder="12 Rua das Flores, Lisbon"/>
        </div>
      )}

      {has('propertyUrl') && (
        <div className="field">
          <label>Listing URL</label>
          <input value={data.propertyUrl} onChange={e => update('propertyUrl', e.target.value)} placeholder="https://listing.com (optional)"/>
        </div>
      )}

      {has('businessName') && (
        <div className="field-row">
          <div className="field">
            <label>Business name</label>
            <input value={data.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Café Marlow"/>
          </div>
          <div className="field">
            <label>Punches to reward</label>
            <input type="number" min={2} max={50} value={data.punchTotal} onChange={e => update('punchTotal', parseInt(e.target.value) || 10)}/>
          </div>
        </div>
      )}

      {has('cvLink') && (
        <div className="field">
          <label>CV link (leave blank to auto-host)</label>
          <input value={data.cvLink} onChange={e => update('cvLink', e.target.value)} placeholder="https://qdenty.io/cv/…"/>
        </div>
      )}

      {typeId === 'geo' && (
        <div className="geo-pane">
          <h4>Geo <span className="it">routing</span></h4>
          <p className="p">Same QR, different destinations. Always set a fallback (★ Everywhere else).</p>
          <div className="geo-rows">
            {data.geoRules.map((r, i) => (
              <div key={i} className="geo-row">
                <select value={r.country} onChange={e => {
                  const next = data.geoRules.map((row, j) => j === i ? { ...row, country: e.target.value } : row)
                  update('geoRules', next)
                }}>
                  {COUNTRY_OPTS.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}
                </select>
                <input
                  value={r.url}
                  onChange={e => {
                    const next = data.geoRules.map((row, j) => j === i ? { ...row, url: e.target.value } : row)
                    update('geoRules', next)
                  }}
                  placeholder="https://your-page.com"
                />
                <button className="rm" onClick={() => update('geoRules', data.geoRules.filter((_, j) => j !== i))} title="Remove">✕</button>
              </div>
            ))}
          </div>
          <button className="add-row-btn" onClick={() => update('geoRules', [...data.geoRules, { country: 'GB', url: 'https://' }])}>
            + Add destination
          </button>
          <div className="geo-count">{data.geoRules.length} routes configured</div>
        </div>
      )}

    </div>
  )
}
