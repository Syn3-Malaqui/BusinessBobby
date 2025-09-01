import { NextResponse } from 'next/server'
import { sendThankYouEmail } from '../../_lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const to = String(body.to || '')
    const tier = (body.tier as 'general' | 'vip' | 'platinum') || 'general'
    const fullName = String(body.fullName || 'Test User')
    const origin = String(body.origin || '')

    if (!to) return NextResponse.json({ error: 'Missing to' }, { status: 400 })

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
    }

    await sendThankYouEmail({ toEmail: to, fullName, tier, origin })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Send test email failed', err)
    return NextResponse.json({ error: err?.message || 'Internal Error' }, { status: 500 })
  }
}


