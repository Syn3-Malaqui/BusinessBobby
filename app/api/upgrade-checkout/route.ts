import { NextResponse } from 'next/server'
import { stripe, PRODUCT_ID_BY_TIER, PRICE_CENTS_BY_TIER, resolveOrCreateOneTimePriceId } from '../_lib/stripe'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const tier = String(url.searchParams.get('tier') || '')
    const fromTier = String(url.searchParams.get('from') || '')
    const fromSessionId = String(url.searchParams.get('from_session_id') || '')
    const baseTier = String(url.searchParams.get('base') || fromTier || '')
    const origin = String(url.searchParams.get('origin') || '')
    if (!origin || !tier || !PRODUCT_ID_BY_TIER[tier]) {
      return new NextResponse('Invalid request', { status: 400 })
    }
    const targetProductId = PRODUCT_ID_BY_TIER[tier]

    const fromCents = PRICE_CENTS_BY_TIER[fromTier] || 0
    const toCents = PRICE_CENTS_BY_TIER[tier] || 0
    const deltaCents = Math.max(0, toCents - fromCents)

    let lineItems: Array<{ price: string; quantity: number }>
    if (deltaCents > 0) {
      const deltaPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: deltaCents,
        product: targetProductId,
        nickname: `Upgrade ${fromTier}->${tier}`,
      })
      lineItems = [{ price: deltaPrice.id, quantity: 1 }]
    } else {
      const priceId = await resolveOrCreateOneTimePriceId(targetProductId, tier)
      lineItems = [{ price: priceId, quantity: 1 }]
    }

    let customerId: string | undefined
    let priorMetadata: Record<string, string> = {}
    if (fromSessionId) {
      try {
        const prev = await stripe.checkout.sessions.retrieve(fromSessionId)
        if (prev && typeof prev.customer === 'string') {
          customerId = prev.customer
        }
        if (prev && prev.metadata) {
          priorMetadata = prev.metadata as Record<string, string>
        }
      } catch {}
    }

    const mergedMetadata = {
      selectedTier: tier,
      previousTier: priorMetadata.selectedTier || fromTier || '',
      fullName: priorMetadata.fullName || '',
      contactNumber: priorMetadata.contactNumber || '',
      fromSessionId: fromSessionId || '',
      isUpgrade: 'true',
      origin,
      otoStep: '1',
      otoKind: 'upgrade',
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer: customerId || undefined,
      metadata: mergedMetadata,
      allow_promotion_codes: true,
      success_url: `${origin}/oto?step=2&base=${baseTier}&became=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.servetoscale.ai/?canceled=true`,
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (err) {
    console.error(err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


