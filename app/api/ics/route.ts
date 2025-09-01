import { NextResponse } from 'next/server'
import { buildIcsContent, getServeToScaleCalendarConfig } from '../_lib/calendar'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const originParam = url.searchParams.get('origin') || undefined
    const cfg = getServeToScaleCalendarConfig(originParam || undefined)
    const ics = buildIcsContent(cfg)
    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="serve-to-scale-2025.ics"',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('ICS generation failed', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}


