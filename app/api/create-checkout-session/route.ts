import { NextResponse } from 'next/server'
import { stripe, PRODUCT_ID_BY_TIER, resolveOrCreateOneTimePriceId } from '../_lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { tier, fullName, contactNumber, email, origin } = await req.json().catch(() => ({} as any))
    if (!origin || !tier || !PRODUCT_ID_BY_TIER[tier]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const productId = PRODUCT_ID_BY_TIER[tier]
    const priceId = await resolveOrCreateOneTimePriceId(productId, tier)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      customer_creation: 'always',
      metadata: {
        selectedTier: tier,
        fullName: fullName || '',
        contactNumber: contactNumber || '',
        isUpgrade: 'false',
      },
      allow_promotion_codes: true,
      success_url: `${origin}/oto?step=1&base=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


