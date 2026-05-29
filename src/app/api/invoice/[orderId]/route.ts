import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { order, user as userTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

const CURRENCY_SYM: Record<string, string> = {
  USD:'$', CAD:'C$', GBP:'£', JPY:'¥', INR:'₹', BRL:'R$', MXN:'MX$',
  SGD:'S$', ZAR:'R', AUD:'A$', AED:'د.إ', BDT:'৳', EUR:'€',
}

function fmt(cents: number, currency: string) {
  const sym = CURRENCY_SYM[currency] ?? currency + ' '
  return sym + (cents / 100).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  const [row] = await db
    .select({
      order:    order,
      userName: userTable.name,
      email:    userTable.email,
    })
    .from(order)
    .innerJoin(userTable, eq(userTable.id, order.userId))
    .where(and(eq(order.id, orderId), eq(order.userId, userId)))
    .limit(1)

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const o       = row.order
  const invDate = new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const inv     = o.invoiceNumber ?? o.id.slice(0, 8).toUpperCase()
  const amount  = fmt(o.amount, o.currency)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${inv} · qdenty</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px;
    color: #0f0e0c;
    background: #f3efe7;
    padding: 64px;
    max-width: 760px;
    margin: 0 auto;
  }
  .inv-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 64px; }
  .inv-logo { font-size: 28px; font-weight: 500; letter-spacing: -0.02em; }
  .inv-logo sup { font-size: 10px; letter-spacing: 0.1em; }
  .inv-no { font-family: monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #7a7570; text-align: right; }
  .inv-no .big { font-family: 'EB Garamond', serif; font-size: 22px; color: #0f0e0c; display: block; margin-bottom: 4px; }
  .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .inv-party-lbl { font-family: monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #7a7570; margin-bottom: 8px; }
  .inv-party-name { font-size: 18px; font-weight: 500; margin-bottom: 4px; }
  .inv-party-detail { font-size: 13px; color: #4a4742; }
  hr { border: none; border-top: 1px solid #d4cfc8; margin: 32px 0; }
  .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .inv-table th {
    font-family: monospace; font-size: 9px; letter-spacing: 0.2em;
    text-transform: uppercase; color: #7a7570; font-weight: 400;
    text-align: left; padding: 0 0 12px; border-bottom: 1px solid #d4cfc8;
  }
  .inv-table th:last-child, .inv-table td:last-child { text-align: right; }
  .inv-table td { padding: 16px 0; border-bottom: 1px solid #e8e4dc; font-size: 15px; }
  .inv-totals { width: 260px; margin-left: auto; }
  .inv-totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
  .inv-totals .row.total { font-size: 18px; font-weight: 500; border-top: 1.5px solid #0f0e0c; padding-top: 12px; margin-top: 4px; }
  .inv-foot { margin-top: 64px; font-family: monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #7a7570; display: flex; justify-content: space-between; }
  .inv-status { display: inline-block; background: #0f0e0c; color: #f3efe7; font-family: monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; padding: 3px 8px; }
  @media print {
    body { background: white; padding: 32px; }
    @page { margin: 20mm; }
  }
</style>
</head>
<body>
  <div class="inv-top">
    <div class="inv-logo">qdenty<sup>™</sup></div>
    <div class="inv-no">
      <span class="big">${inv}</span>
      Invoice date: ${invDate}<br/>
      Status: <span class="inv-status">Paid</span>
    </div>
  </div>

  <div class="inv-parties">
    <div>
      <div class="inv-party-lbl">Billed by</div>
      <div class="inv-party-name">Mabous Innovations &amp; Engineering Ltd.</div>
      <div class="inv-party-detail">qdenty.io<br/>Lisbon, Portugal</div>
    </div>
    <div>
      <div class="inv-party-lbl">Billed to</div>
      <div class="inv-party-name">${row.userName}</div>
      <div class="inv-party-detail">${row.email}${o.country ? '<br/>' + o.country : ''}</div>
    </div>
  </div>

  <hr />

  <table class="inv-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>qdenty ${o.planName} Plan</td>
        <td>${o.annual ? 'Annual subscription' : 'Monthly subscription'}</td>
        <td>${amount}</td>
      </tr>
    </tbody>
  </table>

  <div class="inv-totals">
    <div class="row"><span>Subtotal</span><span>${amount}</span></div>
    <div class="row total"><span>Total</span><span>${amount}</span></div>
  </div>

  <hr />

  <div class="inv-foot">
    <span>qdenty.io · Mabous Innovations &amp; Engineering Ltd.</span>
    <span>Thank you.</span>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type':        'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="invoice-${inv}.html"`,
    },
  })
}
