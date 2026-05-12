import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { updateBookingStatus, getBookingByPartnerOrderId } from '@/lib/users-db'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { verifyCancelToken } from '@/lib/cancel-token'
import { sendCancellationConfirmationEmail } from '@/lib/email'

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif','clp','djf','gnf','jpy','kmf','krw','mga','pyg','rwf','ugx','vnd','vuv','xaf','xof','xpf',
])

/**
 * Beregner refusjonsbeløp til kunden basert på RateHawks cancel-svar.
 * RateHawk returnerer beløp i EUR. Vi bruker prosentandelen av gebyr mot totalpris
 * slik at vi kan beregne riktig refusjon i kundens valuta (NOK).
 *
 * amount_payable = gebyr RateHawk trekker fra vår saldo
 * amount_sell    = totalprisen på bookingen (basis for prosentberegning)
 *
 * Eksempel: gebyr 42.73 EUR, totalpris 92.73 EUR → 46% gebyr
 * Kunden betalte NOK 7 402 → refunder NOK 3 997 (54%)
 */
function calcRefundAmount(
  amountPayable: { amount: string; currency_code: string } | null,
  amountSell: { amount: string; currency_code: string } | null,
  customerPaid: number,
): number {
  if (!amountPayable) return customerPaid // gratis → full refund
  const payable = parseFloat(amountPayable.amount ?? '0')
  if (payable <= 0) return customerPaid  // ingen gebyr → full refund
  if (!amountSell) return 0              // mangler grunnlag, ikke refunder automatisk
  const sell = parseFloat(amountSell.amount ?? '0')
  if (sell <= 0) return 0
  const penaltyRatio = Math.min(payable / sell, 1)
  return Math.max(0, Math.round(customerPaid * (1 - penaltyRatio) * 100) / 100)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const { partnerOrderId, cancelToken } = body

    if (!partnerOrderId) {
      return NextResponse.json({ success: false, error: 'Mangler bestillingsnummer' }, { status: 400 })
    }

    const booking = await getBookingByPartnerOrderId(partnerOrderId)
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking ikke funnet' }, { status: 404 })
    }

    const userId = (session?.user as { id?: string })?.id ?? null
    const isOwner = userId && booking.userId === userId
    const isValidToken = !session?.user && cancelToken && verifyCancelToken(partnerOrderId, cancelToken)

    if (!isOwner && !isValidToken) {
      return NextResponse.json({ success: false, error: 'Ikke autorisert' }, { status: 403 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'Booking er allerede kansellert' }, { status: 400 })
    }

    const result = await ratehawkClient.cancelBooking(partnerOrderId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Kansellering feilet' }, { status: 500 })
    }

    // Stripe-refundering
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
          // Full refund
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentId,
          })
          refundId = refund.id
        } else if (refundAmount > 0) {
          // Delvis refund
          const amountUnits = ZERO_DECIMAL_CURRENCIES.has(currency)
            ? Math.round(refundAmount)
            : Math.round(refundAmount * 100)
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentId,
            amount: amountUnits,
          })
          refundId = refund.id
        }
        // refundAmount === 0 → ingen refundering (100% gebyr)
      } catch (err: any) {
        refundError = err.message ?? 'Stripe-refundering feilet'
      }
    }

    await updateBookingStatus(
      partnerOrderId,
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
      partnerOrderId,
      paidAmount: booking.amount ?? 0,
      refundedAmount: refundId ? refundAmount : 0,
      currency: booking.currency ?? 'NOK',
    })

    return NextResponse.json({
      success: true,
      amountPayable: result.amountPayable ?? null,
      refundId,
      refundError,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Kansellering feilet' }, { status: 500 })
  }
}
