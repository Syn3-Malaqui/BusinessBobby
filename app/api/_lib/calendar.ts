// Calendar utilities for generating ICS content and Google Calendar links

export type CalendarEventConfig = {
  title: string
  description: string
  location: string
  startUtc: string // YYYYMMDDTHHMMSSZ
  endUtc: string // YYYYMMDDTHHMMSSZ
  url?: string
}

export function buildGoogleCalendarUrl(cfg: CalendarEventConfig): string {
  const base = 'https://calendar.google.com/calendar/render'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: cfg.title,
    details: cfg.description,
    location: cfg.location,
    dates: `${cfg.startUtc}/${cfg.endUtc}`,
  })
  if (cfg.url) params.append('sprop', cfg.url)
  return `${base}?${params.toString()}`
}

export function buildIcsContent(cfg: CalendarEventConfig): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Serve to Scale//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:serve-to-scale-2025-${cfg.startUtc}@servetoscale`,
    `DTSTAMP:${cfg.startUtc}`,
    `DTSTART:${cfg.startUtc}`,
    `DTEND:${cfg.endUtc}`,
    `SUMMARY:${escapeIcs(cfg.title)}`,
    `DESCRIPTION:${escapeIcs(cfg.description)}`,
    `LOCATION:${escapeIcs(cfg.location)}`,
  ]
  if (cfg.url) {
    lines.push(`URL:${escapeIcs(cfg.url)}`)
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function escapeIcs(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function getServeToScaleCalendarConfig(origin?: string): CalendarEventConfig {
  const eventUrl = origin ? `${origin}` : undefined
  return {
    title: 'Serve to Scale 2025',
    description:
      'Dates: Oct 23–24, 2025\nDay 1: Registration 9:00 AM | Sessions 9:30 AM – 5:00 PM\nDay 2: Half-Day 9:00 AM – 12:00 PM. \nHilton Garden Inn, 2271 S Washington Blvd, Ogden, UT',
    location: 'Hilton Garden Inn, 2271 S Washington Blvd, Ogden, UT',
    // 9:00 AM Mountain Daylight Time (UTC-6) => 15:00Z
    startUtc: '20251023T150000Z',
    // 12:00 PM Mountain Daylight Time next day => 18:00Z
    endUtc: '20251024T180000Z',
    url: eventUrl,
  }
}


