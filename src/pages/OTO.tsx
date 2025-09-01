import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles } from 'lucide-react'

const OTO: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const step = searchParams.get('step') || '1'
  const base = (searchParams.get('base') || '').toLowerCase()
  const became = (searchParams.get('became') || '').toLowerCase()
  const effectiveBase = (became || base).toLowerCase()
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
    url.searchParams.set('tier', effectiveBase)
    url.searchParams.set('base', effectiveBase)
    url.searchParams.set('origin', origin)
    // Pass which OTO step we are on
    const step = (document.querySelector('[data-oto-step]') as HTMLElement)?.dataset?.otoStep || ''
    if (step) url.searchParams.set('oto_step', step)
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
    url.searchParams.set('tier', effectiveBase)
    if (became) url.searchParams.set('became', became)
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
        {effectiveBase.includes('general') && step === '1' && (
          <>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Popular Upgrade
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Upgrade to VIP for only $150 more!
            </h1>
            <p className="text-gray-700 mb-6">
              Get VIP seating, professional photo shoot, and priority networking.
              You’ve already paid $199 — upgrade today for just $150 more (total $349).
            </p>

            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">VIP seating at all sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Professional photo shoot</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Priority networking</span>
                </li>
              </ul>
            </div>

            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goUpgrade('vip')}>Yes, Upgrade Me to VIP ($349 Total)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks, keep me at GA</button>
            </div>
          </>
        )}

        {effectiveBase.includes('general') && step === '2' && (
          <>
            <div data-oto-step="2" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Recommended Add-On
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add AI Mastermind Certification – $199
            </h1>
            <p className="text-gray-700 mb-6">Solo certification to help you implement faster.</p>
            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Hands-on certification curriculum</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Practical templates and prompts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Immediate implementation support</span>
                </li>
              </ul>
            </div>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('ai_cert')}>Yes, Add Certification</Button>
              <button className="text-sm text-gray-500 underline" onClick={decline}>No thanks</button>
            </div>
          </>
        )}

        {effectiveBase.includes('vip') && step === '1' && (
          <>
            <div data-oto-step="1" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Limited-Time Upgrade
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Go Platinum Elite for only $150 more!
            </h1>
            <p className="text-gray-700 mb-6">
              Unlock Platinum perks and elevate your event experience.
            </p>

            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">2 months Business Builder Membership</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">AI Mastermind Certification Ticket</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">SEO Nationwide Membership</span>
                </li>
              </ul>
              <div className="mt-4 text-sm text-gray-600">
                You’ve already paid $349 — upgrade today for just $150 more (total $499).
              </div>
            </div>

            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goUpgrade('platinum')}>Yes, Upgrade Me to Platinum ($499 Total)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks</button>
            </div>
          </>
        )}

        {effectiveBase.includes('vip') && step === '2' && (
          <>
            <div data-oto-step="2" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Best for Rewatching
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add Event Recordings + AI Starter Kit – $97
            </h1>
            <p className="text-gray-700 mb-6">Lifetime access to all sessions + done-for-you AI prompts/templates.</p>
            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Lifetime access to recordings</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">AI prompts and templates included</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Replay key moments anytime</span>
                </li>
              </ul>
            </div>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('recordings_kit')}>Yes, Add Recordings & Toolkit</Button>
              <button className="text-sm text-gray-500 underline" onClick={decline}>No thanks</button>
            </div>
          </>
        )}

        {effectiveBase.includes('platinum') && step === '1' && (
          <>
            <div data-oto-step="1" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Team Upgrade
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Team AI Certification Package – $500
            </h1>
            <p className="text-gray-700 mb-6">Certify up to 5 of your staff/team members.</p>
            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Up to 5 certifications included</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Team training resources</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Accelerate organization-wide adoption</span>
                </li>
              </ul>
            </div>
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => goAddon('team_cert')}>Yes, Certify My Team ($500)</Button>
              <button className="text-sm text-gray-500 underline" onClick={() => navigateToStep('2')}>No thanks</button>
            </div>
          </>
        )}

        {effectiveBase.includes('platinum') && step === '2' && (
          <>
            <div data-oto-step="2" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Member Exclusive
            </div>
            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Extend Business Builder Membership – $399/mo
            </h1>
            <p className="text-gray-700 mb-6">
              Continue at a discounted rate to scale with weekly coaching, AI tools, and NCPC nationwide support.
            </p>
            <div className="text-left rounded-xl border border-gray-200 p-5 mb-6 bg-gradient-to-b from-white to-gray-50">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">Weekly coaching and accountability</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">AI tools and templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-gray-800">NCPC nationwide support</span>
                </li>
              </ul>
            </div>
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


