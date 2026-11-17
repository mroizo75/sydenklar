import { NextRequest, NextResponse } from 'next/server'
import { createTripInquiry, parseInquiryBody } from '@/lib/inquiries'
import { sendInquiryEmails } from '@/lib/inquiry-mail'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = parseInquiryBody(body)
  if (!parsed.ok) {
    return NextResponse.json(parsed.error, { status: 400 })
  }

  const { inquiry, error } = await createTripInquiry(parsed.data)
  if (!inquiry) {
    const publicError = error?.code === 'missing_table'
      ? { code: 'missing_table', message: 'Vi klarte ikke å ta imot forespørselen nå. Send den til post@sydenklar.no, så tar vi den der.' }
      : (error ?? { code: 'db_error', message: 'Kunne ikke lagre forespørselen' })
    return NextResponse.json(publicError, { status: 500 })
  }

  try {
    await sendInquiryEmails(inquiry)
  } catch {
    return NextResponse.json({
      code: 'saved',
      message: 'Forespørselen er lagret. Vi tar kontakt, men bekreftelsen på e-post kom ikke frem. Skriv til post@sydenklar.no om du ikke hører fra oss.',
    })
  }

  return NextResponse.json({
    code: 'ok',
    message: 'Takk. Vi sender et tilbud med tjenestene hver for seg, vanligvis innen én virkedag.',
  })
}
