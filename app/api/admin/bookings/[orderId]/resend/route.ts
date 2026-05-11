import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBookingByPartnerOrderId } from '@/lib/users-db'
import { sendBookingConfirmationEmail } from '@/lib/email'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

async function authorize(): Promise<boolean> {
  const session = await auth()
  if (!session?.user?.email) return false
  return ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(session.user.email.toLowerCase())
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await authorize())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await params
  const booking = await getBookingByPartnerOrderId(orderId)

  if (!booking) {
    return NextResponse.json({ success: false, error: 'Bestilling ikke funnet' }, { status: 404 })
  }

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
    : 1

  try {
    await sendBookingConfirmationEmail({
      to: booking.guestEmail,
      guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      hotelName: booking.hotelName ?? 'Hotell',
      roomName: booking.roomName ?? 'Rom',
      checkIn: booking.checkIn ?? '',
      checkOut: booking.checkOut ?? '',
      nights,
      adults: booking.adults ?? 0,
      children: booking.children ?? 0,
      partnerOrderId: booking.partnerOrderId,
      amount: booking.amount ?? 0,
      currency: booking.currency ?? 'NOK',
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const e = err as { message?: string }
    return NextResponse.json({ success: false, error: e.message ?? 'Feil' }, { status: 500 })
  }
}
