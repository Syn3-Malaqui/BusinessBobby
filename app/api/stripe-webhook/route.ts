import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_CENTS_BY_TIER } from '../_lib/stripe'
import { initDb, recordCheckout } from '../_lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    let event: any
    if (endpointSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err?.message)
        return new NextResponse('Webhook signature verification failed', { status: 400 })
      }
    } else {
      try {
        event = JSON.parse(rawBody)
      } catch {
        event = rawBody
      }
    }

    if (event && event.type === 'checkout.session.completed') {
      const session = event.data && event.data.object ? event.data.object : {}
      const sessionId = session.id || null
      const customerId = typeof session.customer === 'string' ? session.customer : null
      let email = (session.customer_details && session.customer_details.email) || null
      const selectedTier = (session.metadata && session.metadata.selectedTier) || null
      const fromTier = (session.metadata && (session.metadata.previousTier || session.metadata.fromTier)) || null
      const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : null
      const isUpgrade = ((session.metadata && session.metadata.isUpgrade) || 'false') === 'true'
      let fullName = (session.metadata && session.metadata.fullName) || null
      const contactNumber = (session.metadata && session.metadata.contactNumber) || null

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
          isAddon: (session.metadata && session.metadata.isAddon) === 'true',
        })
      } catch (dbErr) {
        console.error('Failed to record checkout from webhook:', dbErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


