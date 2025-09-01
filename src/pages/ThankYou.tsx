import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Receipt, Calendar as CalendarIcon, Home } from 'lucide-react'

const ThankYou: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tier = (searchParams.get('tier') || '').toLowerCase()
  const previousSessionId = searchParams.get('session_id') || ''
  const upgradedJustNow = searchParams.get('upgraded') === 'true'
  const doneOto = searchParams.get('doneOto') === '1'
  const addon = (searchParams.get('addon') || '').toLowerCase()
  const became = (searchParams.get('became') || '').toLowerCase()

  const PRICE_BY_TIER: Record<string, number> = {
    general: 19900,
    vip: 34900,
    platinum: 49900,
  }

  const HUMAN_TIER_NAME: Record<string, string> = {
    general: 'General Admission',
    vip: 'VIP Experience',
    platinum: 'Platinum Elite',
  }

  const ADDON_NAME: Record<string, string> = {
    ai_cert: 'AI Mastermind Certification',
    recordings_kit: 'Event Recordings + AI Starter Kit',
    team_cert: 'Team AI Certification Package',
    membership_399: 'Business Builder Membership (Monthly)',
  }

  const ADDON_PRICE: Record<string, number> = {
    ai_cert: 19900,
    recordings_kit: 9700,
    team_cert: 50000,
    membership_399: 39900,
  }

  const formatUsd = (cents: number) => (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })

  // Determine effective ticket tier: prefer "became" if present (post-upgrade), otherwise use tier
  const effectiveTierKey = became || tier
  const effectiveName = HUMAN_TIER_NAME[effectiveTierKey] || HUMAN_TIER_NAME[tier] || 'Ticket'
  const effectivePrice = PRICE_BY_TIER[effectiveTierKey] ?? PRICE_BY_TIER[tier] ?? 0

  const isAddonReceipt = addon in ADDON_PRICE
  const addonName = ADDON_NAME[addon] || 'Add-on'
  const addonPrice = ADDON_PRICE[addon] || 0
  const totalAmount = isAddonReceipt ? effectivePrice + addonPrice : effectivePrice

  React.useEffect(() => {
    if (!previousSessionId) return
    let didRun = false
    const persist = async () => {
      if (didRun) return
      didRun = true
      try {
        await fetch(`/api/checkout-complete?session_id=${encodeURIComponent(previousSessionId)}`)
        // @ts-ignore
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          // @ts-ignore
          window.gtag('event', 'purchase', {
            value: totalAmount / 100,
            currency: 'USD',
            tier: effectiveTierKey || tier,
            session_id: previousSessionId,
          })
        }
      } catch {}
    }
    persist()
  }, [previousSessionId, totalAmount, effectiveTierKey, tier])

  React.useEffect(() => {
    if (!doneOto && previousSessionId && tier) {
      const origin = window.location.origin
      const url = new URL('/oto', origin)
      url.searchParams.set('step', '1')
      url.searchParams.set('base', tier)
      url.searchParams.set('session_id', previousSessionId)
      window.location.replace(url.toString())
    }
  }, [doneOto, previousSessionId, tier])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden p-0 transition-all">
        <div className="flex flex-col md:flex-row">
          {/* Left: Confirmation summary */}
          <div className="md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4" /> Payment confirmed
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Thank you!</h1>
            <p className="text-gray-600 mb-6">Your order has been received.</p>

            <div className="rounded-xl border border-gray-200 p-5 bg-gradient-to-b from-white to-gray-50 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-5 h-5 text-gray-700" />
                <div className="text-sm text-gray-500">Order Summary</div>
              </div>
              {isAddonReceipt ? (
                <>
                  <div className="flex items-center justify-between text-gray-800 mb-1">
                    <div className="font-medium">{effectiveName} (Ticket)</div>
                    <div className="font-semibold">{formatUsd(effectivePrice)}</div>
                  </div>
                  <div className="flex items-center justify-between text-gray-800">
                    <div className="font-medium">{addonName} (Add-on)</div>
                    <div className="font-semibold">{formatUsd(addonPrice)}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-gray-900">
                    <div className="font-semibold">Total</div>
                    <div className="font-extrabold">{formatUsd(totalAmount)}</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-gray-800">
                  <div className="font-medium">{effectiveName}</div>
                  <div className="font-semibold">{formatUsd(effectivePrice)}</div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-left">
              <Button variant="outline" onClick={() => router.push('/')} className="justify-center">
                <Home className="w-4 h-4 mr-2" /> Return Home
              </Button>
            </div>
          </div>

          {/* Right: Event details */}
          <div className="md:w-1/2 p-8 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-600">Event Details</div>
            </div>
            <ul className="space-y-2 text-left text-gray-800">
              <li><span className="font-medium">Dates:</span> October 23–24, 2025</li>
              <li><span className="font-medium">Location:</span> Hilton Garden Inn, 2271 S Washington Blvd, Ogden, UT</li>
              <li><span className="font-medium">Day 1:</span> Registration 9:00 AM | Sessions 9:30 AM – 5:00 PM</li>
              <li><span className="font-medium">Day 2:</span> Half-Day 9:00 AM – 12:00 PM</li>
            </ul>

            <div className="mt-6 text-sm text-gray-600">
              We’ve emailed your receipt and calendar links. We’ll send reminders as the event gets closer.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThankYou


