/**
 * Seed script — creates demo user + realistic prototype data.
 * Run: npm run db:seed
 * Demo login: demo@qdenty.io / Demo1234!
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './index'
import * as s from './schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { generateId, hashValue } from '@/lib/utils'
import { randomBytes } from 'crypto'

const DEMO_EMAIL    = 'demo@qdenty.io'
const DEMO_PASSWORD = 'Demo1234!'
const DEMO_NAME     = 'Adelaide Marlow'

function uid() { return randomBytes(12).toString('hex') }

async function seed() {
  console.log('\n🌱  Seeding qdenty database…\n')

  // ── Wipe any existing demo data ──────────────────────────────────────────
  const existing = await db.select({ id: s.user.id })
    .from(s.user)
    .where(eq(s.user.email, DEMO_EMAIL))

  if (existing.length > 0) {
    await db.delete(s.user).where(eq(s.user.email, DEMO_EMAIL))
    console.log('  ✓  Removed existing demo user')
  }

  // ── User ─────────────────────────────────────────────────────────────────
  const userId    = uid()
  const accountId = uid()

  await db.insert(s.user).values({
    id:            userId,
    name:          DEMO_NAME,
    email:         DEMO_EMAIL,
    emailVerified: true,
    planId:        'pro',
    slug:          'adelaide',
    createdAt:     new Date(),
    updatedAt:     new Date(),
  })

  const hashedPw = await hash(DEMO_PASSWORD, 12)
  await db.insert(s.account).values({
    id:         accountId,
    accountId:  userId,       // better-auth credential convention
    providerId: 'credential',
    userId,
    password:   hashedPw,
    createdAt:  new Date(),
    updatedAt:  new Date(),
  })

  console.log(`  ✓  User created: ${DEMO_EMAIL} (id: ${userId})`)

  // ── Profile ───────────────────────────────────────────────────────────────
  const cvData: s.CvData = {
    name:     'Adelaide Marlow',
    title:    'Editorial Designer · Type',
    email:    'demo@qdenty.io',
    phone:    '+351 · 21 · 0188',
    location: 'Lisbon · Portugal',
    summary:  'Designer working at the seam between editorial type and digital identity. Currently building a small studio for printed objects that talk to phones. Previously at Monocle, currently independent.',
    template: 'editorial',
    experience: [
      {
        role:    'Senior Editorial Designer',
        years:   '2023 — Now',
        co:      'Independent Studio · Lisbon',
        bullets: [
          'Brand identities and type systems for cultural and hospitality clients.',
          'QR-linked print collateral for 3 restaurant groups.',
        ],
      },
      {
        role:    'Art Director',
        years:   '2019 — 2023',
        co:      'Monocle Magazine · London',
        bullets: [
          "Led redesign of Monocle's travel supplements across 4 issues.",
          'Directed a team of 6 across print and digital formats.',
        ],
      },
    ],
    education: [
      { degree: 'BA Graphic Design', school: 'Escola Superior de Artes e Design · 2018' },
      { degree: 'Type@Cooper Extended', school: 'Cooper Union · New York · 2021' },
    ],
    skills:    ['Figma', 'InDesign', 'Type Design', 'Brand Identity', 'Editorial Layout'],
    languages: [
      { name: 'Portuguese', level: 'Native' },
      { name: 'English',    level: 'Fluent · C2' },
      { name: 'French',     level: 'Working · B2' },
    ],
    projects: [
      { name: 'Carta Branca Typeface', desc: 'A low-contrast editorial serif for magazine use, 4 weights.' },
      { name: 'Casa Marlow Menu System', desc: 'QR-linked seasonal menu for a Lisbon restaurant group.' },
    ],
  }

  await db.insert(s.userProfile).values({
    userId,
    pronouns:  'she / her',
    phone:     '+351 · 21 · 0188',
    title:     'Editorial Designer · Type',
    bio:       'Designer working at the seam between editorial type and digital identity. Currently building a small studio for printed objects that talk to phones.',
    location:  'Lisbon · Portugal',
    links:     ['linkedin.com/in/adelaidemarlow', 'behance.net/adelaidemarlow', 'dribbble.com/adelaidemarlow'],
    cvData,
    updatedAt: new Date(),
  })
  console.log('  ✓  Profile created (with CV data)')

  // ── QR codes ──────────────────────────────────────────────────────────────
  const codes = [
    { label: 'My Identity Card',    type: 'Identity', payload: 'https://qdenty.io/u/adelaide',          status: 'live',  scans: 3128, ago: 2   },
    { label: 'Studio Menu — Spring',type: 'Menu',     payload: 'https://qdenty.io/m/casa-spring',        status: 'live',  scans: 2041, ago: 7   },
    { label: 'Résumé · 2026 v3',    type: 'CV',       payload: 'https://qdenty.io/cv/adelaide-2026',     status: 'live',  scans: 412,  ago: 21  },
    { label: 'WiFi · Studio Guest', type: 'WiFi',     payload: 'WIFI:T:WPA;S:CasaEditorial;P:welcome2026;;', status: 'live', scans: 1892, ago: 60 },
    { label: 'Café Loyalty · Punch',type: 'Loyalty',  payload: 'https://qdenty.io/l/cafe-marlow',        status: 'live',  scans: 734,  ago: 60  },
    { label: 'Event · Spring Launch',type: 'Event',   payload: 'https://qdenty.io/e/spring-launch',      status: 'exp',   scans: 205,  ago: 120 },
    { label: 'Portfolio · Draft',   type: 'Gallery',  payload: 'https://qdenty.io/p/adelaide-portfolio', status: 'draft', scans: 0,    ago: 5   },
  ]

  const codeRows = codes.map(c => ({
    id:        uid(),
    userId,
    label:     c.label,
    type:      c.type,
    payload:   c.payload,
    color:     '#0f0e0c',
    status:    c.status,
    scans:     c.scans,
    createdAt: new Date(Date.now() - c.ago * 86400_000),
    updatedAt: new Date(),
  }))

  await db.insert(s.qrCode).values(codeRows)
  console.log(`  ✓  ${codes.length} QR codes created`)

  // ── Sample scan events (for analytics preview) ────────────────────────────
  const liveCodeIds = codeRows.filter(c => c.status === 'live').map(c => c.id)
  const countries   = ['US', 'PT', 'GB', 'DE', 'FR', 'BD', 'JP', 'BR']
  const devices     = ['mobile', 'desktop', 'tablet']
  const browsers    = ['Safari', 'Chrome', 'Firefox']
  const scanRows: typeof s.scanEvent.$inferInsert[] = []

  for (const codeId of liveCodeIds) {
    const count = Math.floor(Math.random() * 30) + 10
    for (let i = 0; i < count; i++) {
      scanRows.push({
        id:         uid(),
        codeId,
        scannedAt:  new Date(Date.now() - Math.random() * 30 * 86400_000),
        country:    countries[Math.floor(Math.random() * countries.length)],
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        browser:    browsers[Math.floor(Math.random() * browsers.length)],
      })
    }
  }

  await db.insert(s.scanEvent).values(scanRows)
  console.log(`  ✓  ${scanRows.length} scan events created`)

  // ── API key ───────────────────────────────────────────────────────────────
  const rawToken = 'qd_live_8f3a4b2c1d9e5f6a7b8c9d0e'
  await db.insert(s.apiKey).values({
    id:         uid(),
    userId,
    label:      'Production',
    keyHash:    hashValue(rawToken),
    keyPrefix:  rawToken.slice(0, 12),
    createdAt:  new Date('2026-04-12'),
    lastUsedAt: new Date(Date.now() - 2 * 86400_000),
  })
  console.log('  ✓  API key created (store raw token: ' + rawToken + ')')

  // ── Notification preferences ──────────────────────────────────────────────
  await db.insert(s.notificationPref).values({
    userId,
    scanAlerts:    true,
    weeklyDigest:  true,
    productNews:   true,
    securityAlerts: true,
    updatedAt:     new Date(),
  })

  // ── Sample order ──────────────────────────────────────────────────────────
  await db.insert(s.order).values({
    id:            uid(),
    userId,
    planId:        'pro',
    planName:      'Professional',
    amount:        2400,
    currency:      'USD',
    country:       'US',
    annual:        false,
    status:        'paid',
    invoiceNumber: 'QD-2026-0042',
    createdAt:     new Date('2026-04-15'),
  })

  console.log(`
✅  Seed complete!
───────────────────────────────
Email:    ${DEMO_EMAIL}
Password: ${DEMO_PASSWORD}
Plan:     Professional (pro)
───────────────────────────────
`)
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err)
  process.exit(1)
})
