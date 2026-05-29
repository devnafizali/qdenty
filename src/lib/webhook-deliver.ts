import { createHmac } from 'crypto'
import { db } from '@/db'
import { webhookEndpoint, qrCode } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export interface ScanPayload {
  event:      'scan'
  codeId:     string
  codeLabel:  string
  scannedAt:  string
  country:    string | null
  deviceType: string | null
  browser:    string | null
  referrer:   string | null
}

export async function deliverScanWebhooks(
  userId: string,
  payload: ScanPayload
): Promise<void> {
  const endpoints = await db
    .select({ id: webhookEndpoint.id, url: webhookEndpoint.url, secretHash: webhookEndpoint.secretHash })
    .from(webhookEndpoint)
    .where(and(eq(webhookEndpoint.userId, userId), eq(webhookEndpoint.active, true)))

  if (endpoints.length === 0) return

  const body = JSON.stringify(payload)
  const ts   = Math.floor(Date.now() / 1000).toString()

  await Promise.allSettled(
    endpoints.map(ep => deliverOne(ep.url, ep.secretHash, body, ts))
  )
}

async function deliverOne(
  url: string,
  secretHash: string,
  body: string,
  ts: string,
  attempt = 1
): Promise<void> {
  const sig = sign(secretHash, ts, body)

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':        'application/json',
        'X-Qdenty-Signature':  `t=${ts},v1=${sig}`,
        'X-Qdenty-Event':      'scan',
        'User-Agent':          'qdenty-webhook/1.0',
      },
      body,
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok && attempt < 3) {
      // Exponential backoff: 2s, 4s
      await new Promise(r => setTimeout(r, 2000 * attempt))
      return deliverOne(url, secretHash, body, ts, attempt + 1)
    }
  } catch {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 2000 * attempt))
      return deliverOne(url, secretHash, body, ts, attempt + 1)
    }
  }
}

// HMAC-SHA256 over "timestamp.body"
function sign(secretHash: string, ts: string, body: string): string {
  return createHmac('sha256', secretHash)
    .update(`${ts}.${body}`)
    .digest('hex')
}

// Generate a webhook signing secret — store hash, return raw to user once
export function generateWebhookSecret(): { raw: string; hash: string } {
  const { randomBytes, createHash } = require('crypto') as typeof import('crypto')
  const raw  = 'whsec_' + randomBytes(24).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}
