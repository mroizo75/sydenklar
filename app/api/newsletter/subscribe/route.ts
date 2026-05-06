import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'
const FROM = process.env.RESEND_FROM || 'booking@sydenklar.no'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(req: NextRequest) {
  let body: { email?: string; firstName?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const firstName = body.firstName?.trim() || null

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
  }

  // Check for existing subscriber
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    if (!existing.unsubscribed_at) {
      // Already active subscriber
      return NextResponse.json({ message: 'Du er allerede påmeldt nyhetsbrevet.' })
    }
    // Re-subscribe: clear unsubscribed_at
    await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: null, first_name: firstName, subscribed_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, first_name: firstName, source: 'website' })

    if (error) {
      return NextResponse.json({ error: 'Kunne ikke registrere deg. Prøv igjen.' }, { status: 500 })
    }
  }

  // Fetch the unsubscribe token
  const { data: subscriber } = await supabase
    .from('newsletter_subscribers')
    .select('unsubscribe_token')
    .eq('email', email)
    .single()

  // Send welcome email
  try {
    const greeting = firstName ? `Hei ${firstName}` : 'Hei'
    const unsubscribeUrl = subscriber?.unsubscribe_token
      ? `${BASE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`
      : `${BASE_URL}/hoteller`

    await resend.emails.send({
      from: `Sydenklar <${FROM}>`,
      to: email,
      subject: 'Velkommen til Sydenklar-nyhetsbrevet!',
      html: `<!DOCTYPE html>
<html lang="nb">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6EF;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6EF;padding:32px 16px">
<tbody><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tbody>
<tr><td style="background:#0F1923;border-radius:14px 14px 0 0;padding:32px 40px;text-align:center">
  <p style="margin:0 0 6px;color:#C9A84C;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600">Sydenklar.no</p>
  <h1 style="margin:0;color:#fff;font-size:26px;font-weight:300">Velkommen!</h1>
</td></tr>
<tr><td style="background:#fff;padding:36px 40px">
  <p style="margin:0 0 16px;color:#0F1923;font-size:16px">${greeting},</p>
  <p style="margin:0 0 20px;color:#8A8F99;font-size:15px;line-height:1.65">
    Takk for at du meldte deg på Sydenklar-nyhetsbrevet! Hver uke sender vi deg utvalgte hoteller,
    inspirerende destinasjoner og eksklusive reisetilbud rett i innboksen din.
  </p>
  <a href="${BASE_URL}/hoteller" style="display:inline-block;background:#E5623E;color:#fff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:32px;text-decoration:none">
    Utforsk hoteller nå
  </a>
</td></tr>
<tr><td style="background:#0F1923;border-radius:0 0 14px 14px;padding:20px 40px;text-align:center">
  <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px">
    Sydenklar AS · <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.4);text-decoration:underline">Meld deg av</a>
  </p>
</td></tr>
</tbody></table>
</td></tr></tbody></table>
</body></html>`,
    })
  } catch {
    // Non-fatal: subscriber was saved, welcome email failed
  }

  return NextResponse.json({ message: 'Du er nå påmeldt nyhetsbrevet!' })
}
