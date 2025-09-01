import { NextResponse } from 'next/server'
import { stripe, PRODUCT_ID_BY_TIER, resolveOrCreateOneTimePriceId } from '../_lib/stripe'

export const runtime = 'nodejs'

// Add GET method for preflight requests
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}

export async function POST(req: Request) {
  try {
    console.log('Creating checkout session...')
    
    const body = await req.json().catch(() => ({} as any))
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { tier, fullName, contactNumber, email, origin } = body
    
    if (!origin || !tier || !PRODUCT_ID_BY_TIER[tier]) {
      console.error('Invalid request:', { origin, tier, hasProduct: !!PRODUCT_ID_BY_TIER[tier] })
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    console.log('Stripe configuration check:', {
      hasStripe: !!stripe,
      productId: PRODUCT_ID_BY_TIER[tier],
      tier
    })
    
    const productId = PRODUCT_ID_BY_TIER[tier]
    const priceId = await resolveOrCreateOneTimePriceId(productId, tier)
    
    console.log('Created price ID:', priceId)

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

    console.log('Stripe session created:', { sessionId: session.id, url: session.url })
    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 })
  }
}


