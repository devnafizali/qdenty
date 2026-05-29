import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes }   from 'crypto'
import { db }                        from '@/db'
import { qrCode, scanEvent }         from '@/db/schema'
import { eq, sql }                   from 'drizzle-orm'
import { deliverScanWebhooks }       from '@/lib/webhook-deliver'

function generateId() {
  return randomBytes(12).toString('hex')
}

function detectDevice(ua: string): string {
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

function detectOS(ua: string): string {
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

function detectBrowser(ua: string): string {
  if (/Chrome\/[0-9]/.test(ua) && !/Chromium|Edge|OPR/.test(ua)) return 'Chrome'
  if (/Firefox\/[0-9]/.test(ua)) return 'Firefox'
  if (/Safari\/[0-9]/.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  if (/Edg\//.test(ua)) return 'Edge'
  return 'Other'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codeId: string }> }
) {
  const { codeId } = await params

  const [code] = await db
    .select({ id: qrCode.id, payload: qrCode.payload, status: qrCode.status, userId: qrCode.userId, label: qrCode.label })
    .from(qrCode)
    .where(eq(qrCode.id, codeId))
    .limit(1)

  if (!code) {
    return NextResponse.redirect(new URL('/not-found', req.url))
  }

  if (code.status === 'exp') {
    return NextResponse.redirect(new URL('/expired', req.url))
  }

  // Record scan event asynchronously — don't block the redirect
  const ip       = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const ua       = req.headers.get('user-agent') ?? ''
  const country  = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? null
  const city     = req.headers.get('x-vercel-ip-city') ?? null
  const referrer = req.headers.get('referer') ?? null
  const ipHash   = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 32) : null

  const device  = detectDevice(ua)
  const browser = detectBrowser(ua)
  const scanTs  = new Date()

  void db.insert(scanEvent).values({
    id:         generateId(),
    codeId:     code.id,
    scannedAt:  scanTs,
    ipHash,
    country,
    city,
    deviceType: device,
    os:         detectOS(ua),
    browser,
    referrer,
  }).then(() =>
    db.update(qrCode)
      .set({ scans: sql`${qrCode.scans} + 1`, updatedAt: new Date() })
      .where(eq(qrCode.id, codeId))
  ).then(() =>
    deliverScanWebhooks(code.userId, {
      event:      'scan',
      codeId:     code.id,
      codeLabel:  code.label ?? '',
      scannedAt:  scanTs.toISOString(),
      country,
      deviceType: device,
      browser,
      referrer,
    })
  ).catch(() => {})

  const payload = code.payload
  const target  = payload.startsWith('http') ? payload : `https://${payload}`
  return NextResponse.redirect(target, { status: 302 })
}
