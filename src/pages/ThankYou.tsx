import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const ThankYou: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tier = (searchParams.get('tier') || '').toLowerCase()
  const previousSessionId = searchParams.get('session_id') || ''
  const upgradedJustNow = searchParams.get('upgraded') === 'true'
  const doneOto = searchParams.get('doneOto') === '1'

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

  const UPGRADE_FEATURES_BY_TARGET: Record<string, string[]> = {
    vip: [
      'Preferred seating in VIP section',
      'Evening networking mixer invitation',
      'Professional headshot (1 edited photo)',
      'NCPC SEO Statewide listing (Value $300)',
    ],
    platinum: [
      'AI Mastermind Certification ticket',
      'Professional photo shoot (3 edited headshots)',
      '2 months Mastermind Business Builder membership',
      'NCPC SEO Nationwide listing (Value $700)',
      'VIP lunch with founders & business coaches',
    ],
  }

  const getUpgradeTarget = () => {
    if (tier.includes('general')) return 'vip'
    if (tier.includes('vip')) return 'platinum'
    return null
  }

  const upgradeTarget = upgradedJustNow ? null : getUpgradeTarget()

  const computeUpgradeDeltaCents = () => {
    if (!upgradeTarget) return 0
    const current = tier.includes('general') ? 'general' : tier.includes('vip') ? 'vip' : 'platinum'
    const currentPrice = PRICE_BY_TIER[current] || 0
    const targetPrice = PRICE_BY_TIER[upgradeTarget] || 0
    const delta = Math.max(0, targetPrice - currentPrice)
    return delta
  }

  const formatUsd = (cents: number) => (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })

  const deltaCents = computeUpgradeDeltaCents()
  const currentKey = tier.includes('general') ? 'general' : tier.includes('vip') ? 'vip' : 'platinum'
  const currentName = HUMAN_TIER_NAME[currentKey]
  const currentPaid = PRICE_BY_TIER[currentKey] || 0

  const handleUpgrade = () => {
    const origin = window.location.origin
    const url = new URL('/api/upgrade-checkout', origin)
    url.searchParams.set('tier', upgradeTarget || '')
    url.searchParams.set('from', tier.includes('general') ? 'general' : tier.includes('vip') ? 'vip' : 'platinum')
    url.searchParams.set('origin', origin)
    if (previousSessionId) {
      url.searchParams.set('from_session_id', previousSessionId)
    }
    window.location.href = url.toString()
  }

  // Persist completed checkout on thank-you load (fallback if webhook didn't reach server)
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
            value: currentPaid / 100,
            currency: 'USD',
            tier: currentKey,
            session_id: previousSessionId,
          })
        }
      } catch {}
    }
    persist()
    // no cleanup needed
  }, [previousSessionId])

  React.useEffect(() => {
    // Redirect to OTO if not completed and we have session
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
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden text-center p-10 transition-all">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-base text-gray-600 mb-2">Your order has been received.</p>
        <p className="text-sm text-gray-500 mb-8">You purchased: <span className="font-semibold text-gray-900">{currentName}</span> for <span className="font-semibold text-gray-900">{formatUsd(currentPaid)}</span></p>

        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>Return Home</Button>
        </div>
      </div>
    </div>
  )
}

export default ThankYou


