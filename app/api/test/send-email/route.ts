import { NextResponse } from 'next/server'
import { sendThankYouEmail } from '../../_lib/email'
import { stripe } from '../../_lib/stripe'
import { claimThankYouSendBySession } from '../../_lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const to = String(body.to || '')
    const tier = (body.tier as 'general' | 'vip' | 'platinum') || 'general'
    const fullName = String(body.fullName || '')
    const origin = String(body.origin || '')
    const sessionId = String(body.sessionId || '')

    let emailTo = to
    let fullNameFinal = fullName
    if (!emailTo && sessionId) {
      try {
        const s = await stripe.checkout.sessions.retrieve(sessionId)
        emailTo = (s.customer_details && s.customer_details.email) || ''
        fullNameFinal = (s.metadata && (s.metadata as any).fullName) || fullName || ''
      } catch {}
    }

    if (!emailTo) return NextResponse.json({ error: 'Missing to' }, { status: 400 })

    // Acquire send-lock via DB to avoid race duplicates
    if (sessionId) {
      const claimed = await claimThankYouSendBySession(sessionId)
      if (!claimed) return NextResponse.json({ ok: true, skipped: true })
    }
    await sendThankYouEmail({ toEmail: emailTo, fullName: fullNameFinal, tier, origin })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Send test email failed', err)
    return NextResponse.json({ error: err?.message || 'Internal Error' }, { status: 500 })
  }
}


