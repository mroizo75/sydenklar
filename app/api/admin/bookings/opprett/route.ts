import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { stripe } from '@/lib/stripe'
import { createBooking } from '@/lib/users-db'
import { sendPaymentLinkEmail } from '@/lib/email'
import { applyMarkup } from '@/lib/pricing'
import { randomUUID } from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
])

export async function POST(req: NextRequest) {
  await requireAdminUser()

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }

  const {
    // Prebook-parametere
    bookHash,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    currency,
    // Hotellinfo
    hotelId,
    hotelName,
    hotelAddress,
    roomName,
    cancellationPolicy,
    // Kundeinformasjon
    guestFirstName,
    guestLastName,
    guestEmail,
    guestPhone,
    // Valgfritt: merknad
    remarks,
  } = body

  if (!bookHash || !checkIn || !checkOut || !guestFirstName || !guestLastName || !guestEmail) {
    return NextResponse.json({ error: 'Mangler påkrevde felter' }, { status: 400 })
  }

  // 1. Pre-book med RateHawk
  const prebook = await ratehawkClient.prebookRate({
    bookHash,
    checkIn,
    checkOut,
    adults: adults ?? 2,
    children: Array.isArray(children) ? children.length : (children ?? 0),
    rooms: rooms ?? 1,
    currency: currency ?? 'NOK',
  })

  if (!prebook.success || !prebook.data) {
    return NextResponse.json({ error: prebook.error ?? 'Klarte ikke forhåndsbooking hos hotell' }, { status: 500 })
  }

  const prebookData = prebook.data
  const partnerOrderId: string = prebookData.partner_order_id ?? `SKL-${randomUUID().slice(0, 8).toUpperCase()}`

  // Velg nettopris fra prebook
  const paymentType = Array.isArray(prebookData.payment_types)
    ? prebookData.payment_types.find((p: Record<string, unknown>) => p.type === 'now') ?? prebookData.payment_types[0]
    : null

  if (!paymentType) {
    return NextResponse.json({ error: 'Ingen tilgjengelig betalingstype fra hotellet' }, { status: 500 })
  }

  const netAmount = parseFloat(String(paymentType.amount || '0'))
  const customerAmount = applyMarkup(netAmount)
  const bookingCurrency = (paymentType.currency_code ?? currency ?? 'NOK') as string

  // 2. Opprett Stripe PaymentIntent
  const currencyLower = bookingCurrency.toLowerCase()
  const amountInSmallestUnit = ZERO_DECIMAL_CURRENCIES.has(currencyLower)
    ? Math.round(customerAmount)
    : Math.round(customerAmount * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: currencyLower,
    metadata: {
      partner_order_id: partnerOrderId,
      hotel_name: hotelName ?? '',
      guest_email: guestEmail,
      source: 'sydenklar_admin',
    },
    description: `Hotellbooking: ${hotelName ?? partnerOrderId}`,
    receipt_email: guestEmail,
    automatic_payment_methods: { enabled: true },
  })

  // 3. Lagre booking i DB med status pending_payment
  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ))

  await createBooking({
    id: randomUUID(),
    partnerOrderId,
    userId: null,
    guestEmail,
    guestFirstName,
    guestLastName,
    guestPhone: guestPhone ?? null,
    hotelId: hotelId ?? null,
    hotelName: hotelName ?? null,
    hotelAddress: hotelAddress ?? null,
    roomName: roomName ?? null,
    checkIn,
    checkOut,
    adults: adults ?? null,
    children: Array.isArray(children) ? children.length : (children ?? 0),
    rooms: rooms ?? 1,
    amount: customerAmount,
    currency: bookingCurrency,
    stripePaymentId: paymentIntent.id,
    ratehawkOrderId: null,
    status: 'pending_payment',
    cancellationInfo: null,
    cancellationPolicy: cancellationPolicy ?? null,
    prebookData: {
      bookHash: prebookData.book_hash ?? bookHash,
      paymentType,
      partnerOrderId,
      remarks: remarks ?? '',
      childGuests: [],
      additionalRoomGuests: [],
      roomConfigs: [],
      guestInfo: { firstName: guestFirstName, lastName: guestLastName, email: guestEmail, phone: guestPhone ?? '' },
      hotelName: hotelName ?? '',
      hotelAddress: hotelAddress ?? '',
      roomName: roomName ?? '',
      checkIn,
      checkOut,
      adults: adults ?? 2,
      children: Array.isArray(children) ? children.length : (children ?? 0),
      amount: customerAmount,
      currency: bookingCurrency,
      cancellationPolicy: cancellationPolicy ?? '',
    },
  })

  // 4. Send betalingslink til kunde
  const paymentUrl = `${BASE_URL}/betal/${partnerOrderId}`

  await sendPaymentLinkEmail({
    to: guestEmail,
    guestName: `${guestFirstName} ${guestLastName}`,
    hotelName: hotelName ?? 'Hotell',
    roomName: roomName ?? 'Rom',
    checkIn,
    checkOut,
    nights,
    adults: adults ?? 2,
    amount: customerAmount,
    currency: bookingCurrency,
    paymentUrl,
    partnerOrderId,
  })

  return NextResponse.json({ ok: true, partnerOrderId, paymentUrl })
}
