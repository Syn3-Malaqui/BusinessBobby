import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  })
}
