import { NextResponse } from 'next/server'
import { stripe, ADDON_AMOUNTS } from '../_lib/stripe'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const addon = String(url.searchParams.get('addon') || '')
    const currentTier = String(url.searchParams.get('tier') || '')
    const origin = String(url.searchParams.get('origin') || '')
    const fromSessionId = String(url.searchParams.get('from_session_id') || '')
    const baseTier = String(url.searchParams.get('base') || currentTier || '')
    const otoStep = String(url.searchParams.get('oto_step') || '')
    if (!origin || !addon) return new NextResponse('Invalid request', { status: 400 })

    const amountCents = ADDON_AMOUNTS[addon]
    if (!amountCents) return new NextResponse('Unknown addon', { status: 400 })

    let customerId: string | undefined
    let priorMetadata: Record<string, string> = {}
    if (fromSessionId) {
      try {
        const prev = await stripe.checkout.sessions.retrieve(fromSessionId)
        if (prev && typeof prev.customer === 'string') customerId = prev.customer
        if (prev && prev.metadata) priorMetadata = prev.metadata as Record<string, string>
      } catch {}
    }

    const metadata = {
      isAddon: 'true',
      addonCode: addon,
      // Prefer prior selected tier if we came from an upgrade, then current/base
      selectedTier: (priorMetadata.selectedTier as string) || currentTier || baseTier || '',
      fullName: (priorMetadata.fullName as string) || '',
      contactNumber: (priorMetadata.contactNumber as string) || '',
      fromSessionId: fromSessionId || '',
      origin,
      // OTO2 is an add-on, not an upgrade
      isUpgrade: 'false',
      otoStep: otoStep || '2',
      otoKind: 'addon',
    }

    const tierForThankYou = (metadata.selectedTier as string) || currentTier || baseTier

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: { name: `Addon: ${addon}` },
          },
        },
      ],
      customer: customerId || undefined,
      metadata,
      allow_promotion_codes: true,
      success_url: `${origin}/thank-you?tier=${tierForThankYou}&session_id={CHECKOUT_SESSION_ID}&addon=${addon}&doneOto=1`,
      cancel_url: `${origin}/?canceled=true`,
    })
    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error(err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


