import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getTripInquiry, parseOfferBody, saveTripOffer } from '@/lib/inquiries'
import { sendOfferEmail } from '@/lib/inquiry-mail'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminUser()
  const { id } = await params
  const inquiry = await getTripInquiry(id)
  if (!inquiry) {
    return NextResponse.json({ code: 'not_found', message: 'Forespørselen finnes ikke' }, { status: 404 })
  }

  const parsed = parseOfferBody(await req.json().catch(() => null))
  if (!parsed.ok) {
    return NextResponse.json(parsed.error, { status: 400 })
  }

  try {
    await sendOfferEmail(inquiry, parsed.data)
  } catch {
    return NextResponse.json({ code: 'mail_failed', message: 'E-posten ble ikke sendt. Tilbudet er ikke lagret.' }, { status: 502 })
  }

  const saved = await saveTripOffer(id, parsed.data)
  if (!saved) {
    return NextResponse.json({
      code: 'saved_mail_only',
      message: 'Tilbudet er sendt, men status ble ikke oppdatert i databasen.',
    })
  }

  return NextResponse.json({ code: 'ok', message: 'Tilbudet er sendt.' })
}
