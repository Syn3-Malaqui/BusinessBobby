import { NextResponse } from 'next/server'
import { stripe, PRICE_CENTS_BY_TIER } from '../_lib/stripe'
import { initDb, recordCheckout } from '../_lib/db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sessionId = String(url.searchParams.get('session_id') || '')
    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid' }, { status: 400 })
    }
    const customerId = typeof session.customer === 'string' ? session.customer : null
    let email = (session.customer_details && session.customer_details.email) || null
    const selectedTier = (session.metadata && (session.metadata as any).selectedTier) || null
    const fromTier = (session.metadata && ((session.metadata as any).previousTier || (session.metadata as any).fromTier)) || null
    const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : null
    const isUpgrade = (((session.metadata as any) && (session.metadata as any).isUpgrade) || 'false') === 'true'
    let fullName = (session.metadata && (session.metadata as any).fullName) || null
    const contactNumber = (session.metadata && (session.metadata as any).contactNumber) || null

    if ((!email || !fullName) && customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId)
        if (customer && typeof customer === 'object') {
          if (!email && 'email' in customer && typeof (customer as any).email === 'string') {
            email = (customer as any).email
          }
          if (!fullName && 'name' in customer && typeof (customer as any).name === 'string') {
            fullName = (customer as any).name
          }
        }
      } catch {}
    }

    const finalAmountCents = (() => {
      if (isUpgrade && selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) {
        return PRICE_CENTS_BY_TIER[selectedTier]
      }
      if (((session.metadata as any) && (session.metadata as any).isAddon) === 'true') {
        return amountTotal
      }
      return amountTotal
    })()

    try {
      await initDb()
      await recordCheckout({
        sessionId,
        customerId,
        email,
        fullName,
        contactNumber,
        selectedTier,
        fromTier,
        amountCents: finalAmountCents,
        isUpgrade,
        isAddon: ((session.metadata as any) && (session.metadata as any).isAddon) === 'true',
      })
    } catch (dbErr) {
      console.error('Failed to record checkout:', dbErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


