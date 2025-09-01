import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_CENTS_BY_TIER } from '../_lib/stripe'
import { sendThankYouEmail } from '../_lib/email'
import { initDb, recordCheckout, hasSession } from '../_lib/db'

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
      const isAddon = ((session.metadata && session.metadata.isAddon) || 'false') === 'true'
      const origin = (session.metadata && session.metadata.origin) || undefined
      const otoStepRaw = (session.metadata && (session.metadata.otoStep || session.metadata.oto_step)) || undefined
      const otoStep = otoStepRaw ? parseInt(String(otoStepRaw), 10) : undefined
      const otoKind = (session.metadata && (session.metadata.otoKind || session.metadata.oto_kind)) || undefined

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

      const isPlatinum = selectedTier === 'platinum'
      const baseAmountCents = (() => {
        // Only treat as a base ticket when not an addon; and if it's an upgrade, base becomes target tier price
        if (isAddon) return 0
        if (isUpgrade && selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) return PRICE_CENTS_BY_TIER[selectedTier]
        if (selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) return PRICE_CENTS_BY_TIER[selectedTier]
        return 0
      })()

      const addonsAmountCents = isAddon ? (amountTotal || 0) : 0
      const finalAmountCents = Math.max(baseAmountCents, 0) + Math.max(addonsAmountCents, 0)

      try {
        await initDb()
        if (sessionId && (await hasSession(sessionId))) {
          return NextResponse.json({ received: true, skipped: true })
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
          baseAmountCents: baseAmountCents,
          addonsAmountCents: addonsAmountCents,
          // An addon alone is not an upgrade. Only OTO1 upgrades.
          isUpgrade: isUpgrade || (typeof otoStep === 'number' && otoStep === 1),
          isAddon,
          otoStep,
          otoKind,
        })
      } catch (dbErr) {
        console.error('Failed to record checkout from webhook:', dbErr)
      }

      try {
        if (!isAddon && email && selectedTier) {
          const tierNormalized = ['general', 'vip', 'platinum'].includes(selectedTier)
            ? (selectedTier as 'general' | 'vip' | 'platinum')
            : (selectedTier === 'platinum_elite' ? 'platinum' : 'general')
          await sendThankYouEmail({
            toEmail: email,
            fullName,
            tier: tierNormalized,
            origin,
          })
        }
      } catch (mailErr) {
        console.error('Failed to send thank-you email:', mailErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


