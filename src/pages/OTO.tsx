import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const OTO: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const step = searchParams.get('step') || '1'
  const base = (searchParams.get('base') || '').toLowerCase()
  const sessionId = searchParams.get('session_id') || ''

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  // Persist completed checkout session if present (fallback when webhook doesn't reach local server)
  React.useEffect(() => {
    if (!sessionId) return
    let ran = false
    const persist = async () => {
      if (ran) return
      ran = true
      try {
        await fetch(`/api/checkout-complete?session_id=${encodeURIComponent(sessionId)}`)
      } catch {}
    }
    persist()
  }, [sessionId])

  const goUpgrade = (target: 'vip' | 'platinum') => {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'begin_checkout', { item_category: 'upgrade', from_tier: base, to_tier: target })
    }
    const url = new URL('/api/upgrade-checkout', origin)
    url.searchParams.set('tier', target)
    url.searchParams.set('from', base)
    url.searchParams.set('base', base)
    url.searchParams.set('origin', origin)
    if (sessionId) url.searchParams.set('from_session_id', sessionId)
    window.location.href = url.toString()
  }

  const goAddon = (code: 'ai_cert' | 'recordings_kit' | 'team_cert' | 'membership_399') => {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'begin_checkout', { item_category: 'addon', addon_code: code, base_tier: base })
    }
    const url = new URL('/api/addon-checkout', origin)
    url.searchParams.set('addon', code)
    url.searchParams.set('tier', base)
    url.searchParams.set('base', base)
    url.searchParams.set('origin', origin)
    if (sessionId) url.searchParams.set('from_session_id', sessionId)
    window.location.href = url.toString()
  }

  const decline = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'select_promotion', { promotion_name: 'OTO Decline', base_tier: base, step })
    }
    const url = new URL('/thank-you', origin)
    url.searchParams.set('tier', base)
    if (sessionId) url.searchParams.set('session_id', sessionId)
    url.searchParams.set('doneOto', '1')
    window.location.replace(url.toString())
  }

  const navigateToStep = (newStep: string) => {
    const params = new URLSearchParams()
    params.set('step', newStep)
    params.set('base', base)
    if (sessionId) params.set('session_id', sessionId)
    router.push(`/oto?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden text-center p-10">
        {base.includes('general') && step === '1' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Upgrade to VIP for only $150 more!</h1>
            <p className="text-gray-600 mb-6">Get VIP seating, professional photo shoot, and priority networking. You've already paid $199 — upgrade today for just $150 more.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goUpgrade('vip')}>Yes, Upgrade Me to VIP ($349 Total)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks, keep me at GA</button>
            </div>
          </>
        )}

        {base.includes('general') && step === '2' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Add AI Mastermind Certification – $199</h1>
            <p className="text-gray-600 mb-6">Solo certification to help you implement faster.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('ai_cert')}>Yes, Add Certification</Button>
              <button className="text-sm text-gray-500 underline" onClick={decline}>No thanks</button>
            </div>
          </>
        )}

        {base.includes('vip') && step === '1' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Go Platinum Elite for only $150 more!</h1>
            <p className="text-gray-600 mb-6">Unlock Platinum perks: 2 months Business Builder Membership, AI Mastermind Certification Ticket, SEO Nationwide Membership.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goUpgrade('platinum')}>Yes, Upgrade Me to Platinum ($499 Total)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks</button>
            </div>
          </>
        )}

        {base.includes('vip') && step === '2' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Add Event Recordings + AI Starter Kit – $97</h1>
            <p className="text-gray-600 mb-6">Lifetime access to all sessions + done-for-you AI prompts/templates.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('recordings_kit')}>Yes, Add Recordings & Toolkit</Button>
              <button className="text-sm text-gray-500 underline" onClick={decline}>No thanks</button>
            </div>
          </>
        )}

        {base.includes('platinum') && step === '1' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Team AI Certification Package – $500</h1>
            <p className="text-gray-600 mb-6">Certify up to 5 of your staff/team members.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('team_cert')}>Yes, Certify My Team ($500)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks</button>
            </div>
          </>
        )}

        {base.includes('platinum') && step === '2' && (
          <>
            <h1 className="text-3xl font-bold mb-4">Extend Business Builder Membership – $399/mo</h1>
            <p className="text-gray-600 mb-6">Continue at a discounted rate to scale with weekly coaching, AI tools, and NCPC nationwide support.</p>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('membership_399')}>Yes, Continue My Membership</Button>
              <button className="text-sm text-gray-500 underline" onClick={decline}>No thanks</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OTO


