import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import { buildIcsContent, buildGoogleCalendarUrl, getServeToScaleCalendarConfig } from './calendar'

type TicketTier = 'general' | 'vip' | 'platinum'

const GMAIL_USER = process.env.SMTP_USER || 'Servetoscale@gmail.com'
const GMAIL_PASS = process.env.SMTP_PASS || 'October2324'

export function createGmailTransport() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  })
  return transporter
}

function firstNameFromFullName(fullName?: string | null): string {
  if (!fullName) return 'there'
  const parts = String(fullName).trim().split(/\s+/)
  return parts[0] || 'there'
}

function buildEmailSubject(tier: TicketTier): string {
  switch (tier) {
    case 'general':
      return '🎉 You’re confirmed for Serve to Scale 2025!'
    case 'vip':
      return '🌟 Your VIP Experience is booked for Serve to Scale 2025!'
    case 'platinum':
      return '💎 Platinum Elite: You’re All Set for Serve to Scale 2025!'
  }
}

function buildEmailBodyHtml(tier: TicketTier, firstName: string, origin?: string): string {
  const calCfg = getServeToScaleCalendarConfig(origin)
  const googleUrl = buildGoogleCalendarUrl(calCfg)
  const ticketCopy = tier === 'general' ? 'General Admission – $199' : tier === 'vip' ? 'VIP Experience – $349' : 'Platinum Elite – $499'
  const perksCopy = tier === 'general'
    ? 'Included Perk: (we will email separately)'
    : tier === 'vip'
      ? 'Your VIP Perks: (we will email separately)'
      : 'Your Platinum Perks: (we will email you to verify details)'
  const extraPs = tier === 'general'
    ? 'P.S. Want more? At checkout, you’ll have a chance to upgrade for VIP perks or grab your AI Mastermind Certification.'
    : tier === 'vip'
      ? 'P.S. Watch for an exclusive offer to add your AI Mastermind Certification at a one-time discount.'
      : 'P.S. As a Platinum Elite, you’ll be first to hear about post-event opportunities. Stay tuned!'
  const day2Note = tier === 'platinum' ? 'Day 2: Half-Day 9:00 AM – 12:00 PM | Professional photo shoot 1–3 PM' : 'Day 2: Half-Day 9:00 AM – 12:00 PM'

  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111; line-height: 1.5;">
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>${tier === 'platinum' ? 'Welcome, Platinum Elite Member — you’ve secured the highest tier for Serve to Scale 2025!' : tier === 'vip' ? 'You’re officially locked in as a VIP guest for Serve to Scale 2025!' : 'Your General Admission ticket is confirmed for Serve to Scale 2025!'}</p>
    <h3>📍 Event Info</h3>
    <p>
      <strong>Dates:</strong> October 23–24, 2025<br/>
      <strong>Location:</strong> Hilton Garden Inn, 2271 S Washington Blvd, Ogden, UT<br/>
      <strong>Day 1:</strong> Registration 9:00 AM | Sessions 9:30 AM – 5:00 PM<br/>
      <strong>Day 2:</strong> ${day2Note}
    </p>
    <p>🌟 ${escapeHtml(perksCopy)}</p>
    <p>🎟 <strong>Your Ticket:</strong> ${escapeHtml(ticketCopy)}</p>
    <p>📅 Add to your calendar now:<br/>
      👉 <a href="${googleUrl}" target="_blank" rel="noreferrer">Google Calendar</a> | <a href="${origin ? origin : ''}/api/ics" target="_blank" rel="noreferrer">Download .ICS</a>
    </p>
    <p>We’ll send reminders as the event gets closer.</p>
    <p>With Heart & Impact,<br/>Lady Michelle Servillas & the Serve to Scale Team</p>
    <p style="color:#666;margin-top:16px;">${escapeHtml(extraPs)}</p>
  </div>
  `
}

function buildEmailBodyText(tier: TicketTier, firstName: string, origin?: string): string {
  const calCfg = getServeToScaleCalendarConfig(origin)
  const googleUrl = buildGoogleCalendarUrl(calCfg)
  const ticketCopy = tier === 'general' ? 'General Admission – $199' : tier === 'vip' ? 'VIP Experience – $349' : 'Platinum Elite – $499'
  const perksCopy = tier === 'general'
    ? 'Included Perk: (we will email separately)'
    : tier === 'vip'
      ? 'Your VIP Perks: (we will email separately)'
      : 'Your Platinum Perks: (we will email you to verify details)'
  const extraPs = tier === 'general'
    ? 'P.S. Want more? At checkout, you’ll have a chance to upgrade for VIP perks or grab your AI Mastermind Certification.'
    : tier === 'vip'
      ? 'P.S. Watch for an exclusive offer to add your AI Mastermind Certification at a one-time discount.'
      : 'P.S. As a Platinum Elite, you’ll be first to hear about post-event opportunities. Stay tuned!'
  const day2Note = tier === 'platinum' ? 'Day 2: Half-Day 9:00 AM – 12:00 PM | Professional photo shoot 1–3 PM' : 'Day 2: Half-Day 9:00 AM – 12:00 PM'

  return [
    `Hi ${firstName},`,
    '',
    tier === 'platinum' ? 'Welcome, Platinum Elite Member — you’ve secured the highest tier for Serve to Scale 2025!' : tier === 'vip' ? 'You’re officially locked in as a VIP guest for Serve to Scale 2025!' : 'Your General Admission ticket is confirmed for Serve to Scale 2025!',
    '',
    '📍 Event Info',
    'Dates: October 23–24, 2025',
    'Location: Hilton Garden Inn, 2271 S Washington Blvd, Ogden, UT',
    'Day 1: Registration 9:00 AM | Sessions 9:30 AM – 5:00 PM',
    day2Note,
    '',
    `🌟 ${perksCopy}`,
    `🎟 Your Ticket: ${ticketCopy}`,
    '',
    '📅 Add to your calendar now:',
    `👉 Google Calendar: ${googleUrl}`,
    `👉 Download .ICS: ${origin ? origin : ''}/api/ics`,
    '',
    'We’ll send reminders as the event gets closer.',
    '',
    'With Heart & Impact,',
    'Lady Michelle Servillas & the Serve to Scale Team',
    '',
    extraPs,
  ].join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendThankYouEmail(params: {
  toEmail: string
  fullName?: string | null
  tier: TicketTier
  origin?: string
}): Promise<void> {
  const { toEmail, fullName, tier, origin } = params
  if (!toEmail) return
  const transporter = createGmailTransport()

  const firstName = firstNameFromFullName(fullName)
  const subject = buildEmailSubject(tier)
  const html = buildEmailBodyHtml(tier, firstName, origin)
  const text = buildEmailBodyText(tier, firstName, origin)

  const calCfg = getServeToScaleCalendarConfig(origin)
  const icsContent = buildIcsContent(calCfg)

  const mailOptions: Mail.Options = {
    from: `Serve to Scale <${GMAIL_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
    attachments: [
      {
        filename: 'serve-to-scale-2025.ics',
        content: icsContent,
        contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
      },
    ],
  }

  await transporter.sendMail(mailOptions)
}


