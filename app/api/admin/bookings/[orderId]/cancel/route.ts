import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBookingByPartnerOrderId, updateBookingStatus } from '@/lib/users-db'
import { ratehawkClient } from '@/lib/ratehawk-client'

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

  const nonCancellable = ['cancelled', 'failed', 'payment_failed']
  if (nonCancellable.includes(booking.status)) {
    return NextResponse.json({ success: false, error: `Kan ikke avbestille en bestilling med status: ${booking.status}` }, { status: 400 })
  }

  const result = await ratehawkClient.cancelBooking(booking.partnerOrderId)

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error ?? 'Avbestilling feilet mot RateHawk' }, { status: 500 })
  }

  await updateBookingStatus(booking.partnerOrderId, 'cancelled')

  return NextResponse.json({
    success: true,
    amountRefunded: result.amountRefunded,
    amountPayable: result.amountPayable,
  })
}
