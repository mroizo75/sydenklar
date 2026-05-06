import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM || 'kontakt@sydenklar.no'
const TO = 'post@sydenklar.no'

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; subject?: string; message?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Navn, e-post og melding er påkrevd' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: `Sydenklar Kontakt <${FROM}>`,
      to: TO,
      replyTo: email.trim(),
      subject: `Kontaktskjema: ${subject?.trim() || 'Henvendelse fra sydenklar.no'}`,
      html: `
        <p><strong>Fra:</strong> ${name.trim()} &lt;${email.trim()}&gt;</p>
        <p><strong>Emne:</strong> ${subject?.trim() || '—'}</p>
        <hr />
        <p style="white-space: pre-wrap">${message.trim()}</p>
      `,
    })

    return NextResponse.json({ message: 'Takk for din henvendelse! Vi svarer innen én virkedag.' })
  } catch {
    return NextResponse.json({ error: 'Kunne ikke sende melding. Prøv igjen eller send direkte til post@sydenklar.no.' }, { status: 500 })
  }
}
