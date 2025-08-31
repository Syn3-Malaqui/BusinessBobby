import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import pg from 'pg'

const app = express()
const port = process.env.PORT || 8787

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RylV3CVXjNEcso7W9XVjT0LbhDqxTBRoGisqidn8AmXthc4eYUG1gcRvPLSyjHJPwEBz7nforD6qqhRexcinN7Z00QxqsUMvw'
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
})

app.use(cors({ origin: true }))
// Stripe webhook must receive the raw body for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    let event
    if (endpointSecret) {
      const sig = req.headers['stripe-signature']
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      } catch (err) {
        console.error('Webhook signature verification failed:', err?.message)
        return res.status(400).send('Webhook signature verification failed')
      }
    } else {
      // In dev, accept unsigned payload
      try {
        event = JSON.parse(req.body.toString())
      } catch {
        event = req.body
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

      // If email/name missing but customer exists, pull from Stripe customer
      if ((!email || !fullName) && customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && typeof customer === 'object') {
            if (!email && 'email' in customer && typeof customer.email === 'string') {
              email = customer.email
            }
            if (!fullName && 'name' in customer && typeof customer.name === 'string') {
              fullName = customer.name
            }
          }
        } catch {}
      }

      // Store final price: for upgrades, record the full target tier price, not delta. For add-ons, add to total.
      const finalAmountCents = (() => {
        if (isUpgrade && selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) {
          return PRICE_CENTS_BY_TIER[selectedTier]
        }
        return amountTotal
      })()

      try {
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
        // Do not fail webhook response to avoid retries storm; log instead
      }
    }

    return res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).send('Internal Server Error')
  }
})

// JSON parser for all other routes
app.use(express.json())

// --- Database (Supabase Postgres via session pooler) ---
const { Pool } = pg
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.fgtzsslxumdlmbmrrxrc:yM5Z5EtPgnwocXzw@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
const db = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS checkouts (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      customer_id TEXT,
      email TEXT,
      full_name TEXT,
      contact_number TEXT,
      selected_tier TEXT,
      from_tier TEXT,
      amount_cents INTEGER,
      is_upgrade BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `)
  // Deduplicate any existing rows by email, keeping the newest id
  await db.query(`
    DELETE FROM checkouts a
    USING checkouts b
    WHERE a.email IS NOT NULL AND b.email IS NOT NULL
      AND a.email = b.email
      AND a.id < b.id;
  `)
  try {
    await db.query(`ALTER TABLE checkouts DROP CONSTRAINT IF EXISTS checkouts_session_id_key;`)
    await db.query(`DROP INDEX IF EXISTS checkouts_email_key;`)
    await db.query(`DO $$ BEGIN
      BEGIN
        ALTER TABLE checkouts ADD CONSTRAINT checkouts_email_unique UNIQUE (email);
      EXCEPTION WHEN duplicate_object THEN
        -- constraint already exists
        NULL;
      END;
    END $$;`)
  } catch (e) {
    console.error('DB unique index creation failed (non-fatal):', e)
  }
  await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS full_name TEXT;`)
  await db.query(`ALTER TABLE checkouts ADD COLUMN IF NOT EXISTS contact_number TEXT;`)
}

async function recordCheckout({ sessionId, customerId, email, fullName, contactNumber, selectedTier, fromTier, amountCents, isUpgrade, isAddon }) {
  if (email) {
    if (isAddon) {
      // For add-ons: increment total amount for the existing user row
      await db.query(
        `UPDATE checkouts
         SET amount_cents = COALESCE(amount_cents, 0) + COALESCE($1, 0)
         WHERE email = $2;`,
        [amountCents || 0, email],
      )
      return
    }
    // Upsert by email: one row per user/email; upgrades overwrite tier and set final amount
    await db.query(
      `INSERT INTO checkouts (session_id, customer_id, email, full_name, contact_number, selected_tier, from_tier, amount_cents, is_upgrade, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (email) DO UPDATE SET
         session_id = EXCLUDED.session_id,
         customer_id = COALESCE(EXCLUDED.customer_id, checkouts.customer_id),
         full_name = COALESCE(EXCLUDED.full_name, checkouts.full_name),
         contact_number = COALESCE(EXCLUDED.contact_number, checkouts.contact_number),
         selected_tier = COALESCE(EXCLUDED.selected_tier, checkouts.selected_tier),
         from_tier = COALESCE(EXCLUDED.from_tier, checkouts.from_tier),
         amount_cents = COALESCE(EXCLUDED.amount_cents, checkouts.amount_cents),
         is_upgrade = COALESCE(EXCLUDED.is_upgrade, checkouts.is_upgrade),
         created_at = checkouts.created_at;`,
      [sessionId, customerId || null, email, fullName || null, contactNumber || null, selectedTier || null, fromTier || null, amountCents || null, !!isUpgrade],
    )
  } else {
    // Fallback: insert by session if no email
    await db.query(
      `INSERT INTO checkouts (session_id, customer_id, email, full_name, contact_number, selected_tier, from_tier, amount_cents, is_upgrade, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT DO NOTHING;`,
      [sessionId, customerId || null, null, fullName || null, contactNumber || null, selectedTier || null, fromTier || null, amountCents || null, !!isUpgrade],
    )
  }
}

const PRODUCT_ID_BY_TIER = {
  general: 'prod_SyCwLr1cFrZDB4',
  vip: 'prod_SyCwEsCfVflbrW',
  platinum: 'prod_SyCwOGd1XTRugQ',
}

const PRICE_CENTS_BY_TIER = {
  general: 19900,
  vip: 34900,
  platinum: 49900,
}

async function resolveOrCreateOneTimePriceId(productId, tier) {
  const product = await stripe.products.retrieve(productId)
  const expectedAmount = PRICE_CENTS_BY_TIER[tier]
  if (!expectedAmount) throw new Error('No price mapping for tier ' + tier)

  const defaultPrice = product.default_price
  if (typeof defaultPrice === 'string' && defaultPrice.length > 0) {
    const price = await stripe.prices.retrieve(defaultPrice)
    if (
      price.active &&
      price.type === 'one_time' &&
      typeof price.unit_amount === 'number' &&
      price.unit_amount === expectedAmount
    ) {
      return price.id
    }
  }

  const list = await stripe.prices.list({ product: productId, active: true, type: 'one_time', limit: 10 })
  const matching = list.data.find(p => typeof p.unit_amount === 'number' && p.unit_amount === expectedAmount)
  if (matching) {
    return matching.id
  }

  const created = await stripe.prices.create({
    currency: 'usd',
    unit_amount: expectedAmount,
    product: productId,
    nickname: `One-time ${tier}`,
  })
  try {
    await stripe.products.update(productId, { default_price: created.id })
  } catch {}
  return created.id
}

function getUpsellMessageForTier(tier, origin) {
  if (tier === 'general') {
    const url = new URL('/api/upgrade-checkout', origin)
    url.searchParams.set('tier', 'vip')
    url.searchParams.set('origin', origin)
    return `Want VIP Experience? Upgrade here: ${url.toString()}`
  }
  if (tier === 'vip') {
    const url = new URL('/api/upgrade-checkout', origin)
    url.searchParams.set('tier', 'platinum')
    url.searchParams.set('origin', origin)
    return `Go Platinum Elite for the ultimate experience: ${url.toString()}`
  }
  return 'Thank you for your purchase!'
}

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { tier, fullName, contactNumber, email, origin } = req.body || {}
    if (!origin || !tier || !PRODUCT_ID_BY_TIER[tier]) {
      return res.status(400).json({ error: 'Invalid request' })
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

    return res.json({ id: session.id, url: session.url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/api/upgrade-checkout', async (req, res) => {
  try {
    const tier = String(req.query.tier || '')
    const fromTier = String(req.query.from || '')
    const fromSessionId = String(req.query.from_session_id || '')
    const baseTier = String(req.query.base || fromTier || '')
    const origin = String(req.query.origin || '')
    if (!origin || !tier || !PRODUCT_ID_BY_TIER[tier]) {
      return res.status(400).send('Invalid request')
    }
    const targetProductId = PRODUCT_ID_BY_TIER[tier]

    const fromCents = PRICE_CENTS_BY_TIER[fromTier] || 0
    const toCents = PRICE_CENTS_BY_TIER[tier] || 0
    const deltaCents = Math.max(0, toCents - fromCents)

    let lineItems
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

    // Attempt to reuse previous customer and metadata to retain user info
    let customerId
    let priorMetadata = {}
    let priorEmail = null
    if (fromSessionId) {
      try {
        const prev = await stripe.checkout.sessions.retrieve(fromSessionId)
        if (prev && typeof prev.customer === 'string') {
          customerId = prev.customer
        }
        if (prev && prev.metadata) {
          priorMetadata = prev.metadata
        }
        if (prev && prev.customer_details && prev.customer_details.email) {
          priorEmail = prev.customer_details.email
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
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer: customerId || undefined,
      metadata: mergedMetadata,
      allow_promotion_codes: true,
      success_url: `${origin}/oto?step=2&base=${baseTier}&became=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return res.redirect(303, session.url)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
})

// OTO Add-on checkout (one-time add-ons)
app.get('/api/addon-checkout', async (req, res) => {
  try {
    const addon = String(req.query.addon || '') // e.g. ai_cert, recordings_kit, team_cert, membership_399
    const currentTier = String(req.query.tier || '')
    const origin = String(req.query.origin || '')
    const fromSessionId = String(req.query.from_session_id || '')
    const baseTier = String(req.query.base || currentTier || '')
    if (!origin || !addon) return res.status(400).send('Invalid request')

    // Map add-ons to amounts
    const ADDON_AMOUNTS = {
      ai_cert: 19900,
      recordings_kit: 9700,
      team_cert: 50000,
      membership_399: 39900,
    }
    const amountCents = ADDON_AMOUNTS[addon]
    if (!amountCents) return res.status(400).send('Unknown addon')

    // Try to reuse prior session's customer and metadata
    let customerId
    let priorMetadata = {}
    let priorEmail = null
    if (fromSessionId) {
      try {
        const prev = await stripe.checkout.sessions.retrieve(fromSessionId)
        if (prev && typeof prev.customer === 'string') customerId = prev.customer
        if (prev && prev.metadata) priorMetadata = prev.metadata
        if (prev && prev.customer_details && prev.customer_details.email) priorEmail = prev.customer_details.email
      } catch {}
    }

    const metadata = {
      isAddon: 'true',
      addonCode: addon,
      selectedTier: currentTier || priorMetadata.selectedTier || baseTier || '',
      fullName: priorMetadata.fullName || '',
      contactNumber: priorMetadata.contactNumber || '',
      fromSessionId: fromSessionId || '',
    }

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
      success_url: `${origin}/thank-you?tier=${currentTier || baseTier}&session_id={CHECKOUT_SESSION_ID}&addon=${addon}&doneOto=1`,
      cancel_url: `${origin}/?canceled=true`,
    })
    return res.redirect(303, session.url)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Internal Server Error')
  }
})

// Fallback completion endpoint to persist after paid if webhook is not received
app.get('/api/checkout-complete', async (req, res) => {
  try {
    const sessionId = String(req.query.session_id || '')
    if (!sessionId) return res.status(400).json({ error: 'Missing session_id' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Session not paid' })
    }
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
          if (!email && 'email' in customer && typeof customer.email === 'string') {
            email = customer.email
          }
          if (!fullName && 'name' in customer && typeof customer.name === 'string') {
            fullName = customer.name
          }
        }
      } catch {}
    }

    const finalAmountCents = (() => {
      if (isUpgrade && selectedTier && PRICE_CENTS_BY_TIER[selectedTier]) {
        return PRICE_CENTS_BY_TIER[selectedTier]
      }
      if ((session.metadata && session.metadata.isAddon) === 'true') {
        return amountTotal
      }
      return amountTotal
    })()

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
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

await initDb().catch(err => console.error('DB init failed', err))
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})


