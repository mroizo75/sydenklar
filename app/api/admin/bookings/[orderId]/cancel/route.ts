import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBookingByPartnerOrderId, updateBookingStatus } from '@/lib/users-db'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { stripe } from '@/lib/stripe'
import { sendCancellationConfirmationEmail } from '@/lib/email'

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','ugx','vnd','vuv','xaf','xof','xpf',
])

function calcRefundAmount(
  amountPayable: { amount: string; currency_code: string } | null,
  amountSell: { amount: string; currency_code: string } | null,
  customerPaid: number,
): number {
  if (!amountPayable) return customerPaid
  const payable = parseFloat(amountPayable.amount ?? '0')
  if (payable <= 0) return customerPaid
  if (!amountSell) return 0
  const sell = parseFloat(amountSell.amount ?? '0')
  if (sell <= 0) return 0
  const penaltyRatio = Math.min(payable / sell, 1)
  return Math.max(0, Math.round(customerPaid * (1 - penaltyRatio) * 100) / 100)
}

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

  let refundId: string | null = null
  let refundAmount = 0
  let refundError: string | null = null

  if (booking.stripePaymentId && booking.amount) {
    try {
      refundAmount = calcRefundAmount(
        result.amountPayable ?? null,
        result.amountSell ?? null,
        booking.amount,
      )
      const currency = (booking.currency ?? 'nok').toLowerCase()

      if (refundAmount >= booking.amount) {
        const refund = await stripe.refunds.create({ payment_intent: booking.stripePaymentId })
        refundId = refund.id
      } else if (refundAmount > 0) {
        const amountUnits = ZERO_DECIMAL_CURRENCIES.has(currency)
          ? Math.round(refundAmount)
          : Math.round(refundAmount * 100)
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentId,
          amount: amountUnits,
        })
        refundId = refund.id
      }
    } catch (err: any) {
      refundError = err.message ?? 'Stripe-refundering feilet'
    }
  }

  await updateBookingStatus(
    booking.partnerOrderId,
    'cancelled',
    undefined,
    undefined,
    refundId ? { stripeRefundId: refundId, refundedAmount: refundAmount } : undefined,
  )

  sendCancellationConfirmationEmail({
    to: booking.guestEmail,
    guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
    hotelName: booking.hotelName ?? 'Hotell',
    checkIn: booking.checkIn ?? '',
    checkOut: booking.checkOut ?? '',
    partnerOrderId: booking.partnerOrderId,
    paidAmount: booking.amount ?? 0,
    refundedAmount: refundId ? refundAmount : 0,
    currency: booking.currency ?? 'NOK',
  })

  return NextResponse.json({
    success: true,
    refundId,
    refundError,
    amountPayable: result.amountPayable,
  })
}
