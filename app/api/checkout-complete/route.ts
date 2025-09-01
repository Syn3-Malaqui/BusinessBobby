import { NextResponse } from 'next/server'
import { stripe, PRICE_CENTS_BY_TIER } from '../_lib/stripe'
import { initDb, recordCheckout, hasSession } from '../_lib/db'

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
    const isUpgradeMeta = (((session.metadata as any) && (session.metadata as any).isUpgrade) || 'false') === 'true'
    const isAddon = (((session.metadata as any) && (session.metadata as any).isAddon) || 'false') === 'true'
    const otoStepRaw = (session.metadata && ((session.metadata as any).otoStep || (session.metadata as any).oto_step)) || undefined
    const otoStep = otoStepRaw ? parseInt(String(otoStepRaw), 10) : undefined
    const otoKind = (session.metadata && ((session.metadata as any).otoKind || (session.metadata as any).oto_kind)) || undefined
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

    const baseAmountCents = (isUpgradeMeta && selectedTier && PRICE_CENTS_BY_TIER[selectedTier])
      ? PRICE_CENTS_BY_TIER[selectedTier]
      : (selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) ? PRICE_CENTS_BY_TIER[selectedTier] : 0
    const addonsAmountCents = isAddon ? (amountTotal || 0) : 0
    const finalAmountCents = Math.max(baseAmountCents, 0) + Math.max(addonsAmountCents, 0)

    try {
      await initDb()
      // Avoid double-inserting same session
      if (await hasSession(sessionId)) {
        return NextResponse.json({ ok: true, skipped: true })
      }
      await recordCheckout({
        sessionId,
        customerId,
        email,
        fullName,
        contactNumber,
        selectedTier,
        fromTier,
        amountCents: finalAmountCents,
        baseAmountCents,
        addonsAmountCents,
        // Addon alone is not an upgrade; only OTO1 upgrades
        isUpgrade: isUpgradeMeta || (typeof otoStep === 'number' && otoStep === 1),
        isAddon,
        otoStep,
        otoKind,
      })
    } catch (dbErr) {
      console.error('Failed to record checkout:', dbErr)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    const addonCode = (session.metadata && (session.metadata as any).addonCode) || null
    return NextResponse.json({
      ok: true,
      sessionId,
      selectedTier,
      fromTier,
      isUpgrade: isUpgradeMeta || isAddon || (typeof otoStep === 'number' && otoStep >= 1),
      isAddon,
      addonCode,
      otoStep: typeof otoStep === 'number' ? otoStep : null,
      otoKind: otoKind || null,
      amountCents: finalAmountCents,
      baseAmountCents,
      addonsAmountCents,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


