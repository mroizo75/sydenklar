import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, partnerOrderId, hotelName, guestEmail } = body

    if (!amount || !currency || !partnerOrderId) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felter: amount, currency, partnerOrderId' },
        { status: 400 },
      )
    }

    const amountNum = parseFloat(String(amount))
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Ugyldig beløp' }, { status: 400 })
    }

    // Stripe krever beløp i minste enhet (øre for NOK)
    const amountInSmallestUnit = Math.round(amountNum * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      metadata: {
        partner_order_id: partnerOrderId,
        hotel_name: hotelName || '',
        guest_email: guestEmail || '',
        source: 'sydenklar',
      },
      description: `Hotellbooking: ${hotelName || partnerOrderId}`,
      receipt_email: guestEmail || undefined,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json(
      { error: err.message || 'Kunne ikke opprette betaling' },
      { status: 500 },
    )
  }
}
