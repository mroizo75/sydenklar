import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { updateBookingStatus, getBookingByPartnerOrderId } from '@/lib/users-db'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Mangler stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = verifyWebhookSignature(body, signature)
  } catch {
    return NextResponse.json({ error: 'Ugyldig webhook-signatur' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const partnerOrderId = pi.metadata?.partner_order_id
      if (partnerOrderId) {
        const booking = await getBookingByPartnerOrderId(partnerOrderId)
        // Ikke overskriv confirmed/cancelled — RateHawk-flyten har allerede satt riktig status
        const protectedStatuses = new Set(['confirmed', 'cancelled', 'failed'])
        if (booking && !protectedStatuses.has(booking.status)) {
          await updateBookingStatus(partnerOrderId, 'paid', undefined, pi.id)
        } else if (!booking) {
          await updateBookingStatus(partnerOrderId, 'paid', undefined, pi.id)
        }
      }
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const partnerOrderId = pi.metadata?.partner_order_id
      if (partnerOrderId) {
        const booking = await getBookingByPartnerOrderId(partnerOrderId)
        const protectedStatuses = new Set(['confirmed', 'cancelled'])
        if (booking && !protectedStatuses.has(booking.status)) {
          await updateBookingStatus(partnerOrderId, 'payment_failed', undefined, pi.id)
        } else if (!booking) {
          await updateBookingStatus(partnerOrderId, 'payment_failed', undefined, pi.id)
        }
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
