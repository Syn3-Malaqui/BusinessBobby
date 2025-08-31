import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export const PRODUCT_ID_BY_TIER: Record<string, string> = {
  general: 'prod_SyCwLr1cFrZDB4',
  vip: 'prod_SyCwEsCfVflbrW',
  platinum: 'prod_SyCwOGd1XTRugQ',
}

export const PRICE_CENTS_BY_TIER: Record<string, number> = {
  general: 19900,
  vip: 34900,
  platinum: 49900,
}

export async function resolveOrCreateOneTimePriceId(productId: string, tier: string): Promise<string> {
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

export const ADDON_AMOUNTS: Record<string, number> = {
  ai_cert: 19900,
  recordings_kit: 9700,
  team_cert: 50000,
  membership_399: 39900,
}


