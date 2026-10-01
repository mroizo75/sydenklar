import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { createBooking, updateBookingStatus } from '@/lib/users-db'
import { getCurrentUserId } from '@/lib/auth'
import { randomUUID } from 'crypto'
import { applyMarkup } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      partnerOrderId,
      bookHash,
      childGuests,
      additionalRoomGuests,
      roomConfigs,
      guestInfo,
      paymentType,
      remarks,
      roomCount,
      stripePaymentIntentId,
      hotelId,
      hotelName,
      hotelAddress,
      roomName,
      checkIn,
      checkOut,
      adults,
      children,
      amount,
      currency,
      cancellationPolicy,
      upsellData,
      nonFreeAmenities,
      keysPickupInstructions,
    } = body

    if (!partnerOrderId || !guestInfo || !paymentType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: partnerOrderId, guestInfo, paymentType'
      }, { status: 400 })
    }

    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      return NextResponse.json({ success: false, error: 'Missing guest information' }, { status: 400 })
    }

    // Lagre booking i SQLite (status: pending inntil RateHawk bekrefter)
    const userId = await getCurrentUserId()
    const bookingId = randomUUID()

    const createdBooking = await createBooking({
      id: bookingId,
      partnerOrderId,
      userId: userId ?? null,
      guestEmail: guestInfo.email,
      guestFirstName: guestInfo.firstName,
      guestLastName: guestInfo.lastName,
      guestPhone: guestInfo.phone ?? null,
      hotelId: hotelId ?? null,
      hotelName: hotelName ?? null,
      roomName: roomName ?? null,
      checkIn: checkIn ?? null,
      checkOut: checkOut ?? null,
      adults: adults ?? null,
      children: children ?? 0,
      rooms: typeof roomCount === 'number' ? roomCount : 1,
      amount: amount != null ? parseFloat(String(amount)) : null,
      currency: currency ?? null,
      stripePaymentId: stripePaymentIntentId ?? null,
      ratehawkOrderId: null,
      status: 'pending',
      cancellationInfo: null,
      cancellationPolicy: cancellationPolicy ?? null,
      hotelAddress: hotelAddress ?? null,
      prebookData: {
        bookHash: bookHash ?? '',
        guestInfo,
        paymentType,
        remarks: remarks ?? '',
        rooms: typeof roomCount === 'number' ? roomCount : 1,
        ...(upsellData ? { upsellData } : {}),
        ...(nonFreeAmenities?.length ? { nonFreeAmenities } : {}),
        ...(keysPickupInstructions ? { keysPickupInstructions } : {}),
      },
    })

    if (!createdBooking) {
      return NextResponse.json(
        { success: false, error: 'Kunne ikke opprette bookingøkt. Kontakt support.' },
        { status: 500 },
      )
    }

    // RateHawk finishBooking — paymentType.amount er nettopris (trekkes fra deposit)
    // amount er kundepris (inkl. bestillingsgebyr) lagret i DB
    const netAmount = parseFloat(String(paymentType.amount || '0'))
    const customerAmount = amount != null ? parseFloat(String(amount)) : applyMarkup(netAmount)

    const bookingResult = await ratehawkClient.finishBooking({
      bookHash: bookHash || '',
      partnerOrderId,
      userEmail: guestInfo.email,
      userPhone: guestInfo.phone,
      firstName: guestInfo.firstName,
      lastName: guestInfo.lastName,
      childGuests: Array.isArray(childGuests) ? childGuests : [],
      additionalRoomGuests: Array.isArray(additionalRoomGuests) ? additionalRoomGuests : [],
      roomConfigs: Array.isArray(roomConfigs) ? roomConfigs : [],
      paymentType: paymentType.type,
      amount: paymentType.amount,
      currencyCode: paymentType.currency_code,
      amountSellB2b2c: customerAmount > 0 ? customerAmount.toFixed(2) : '0',
      remarks: remarks || '',
      roomCount: typeof roomCount === 'number' && roomCount > 0 ? roomCount : 1,
      upsellData: Array.isArray(upsellData) && upsellData.length > 0 ? upsellData : undefined,
    })

    if (!bookingResult.success && bookingResult.isFinal) {
      const errorCode = bookingResult.error
      const userMessage =
        errorCode === 'booking_form_expired'
          ? 'Bookingsesjonen er utløpt. Start på nytt.'
          : errorCode === 'rate_not_found'
          ? 'Rommet er ikke lenger tilgjengelig.'
          : 'En feil oppsto. Kontakt support.'
      await updateBookingStatus(partnerOrderId, 'failed')
      return NextResponse.json({ success: false, error: userMessage }, { status: 500 })
    }

    const bookingData = bookingResult.success ? bookingResult.data : undefined
    const orderId = bookingData?.order_id
    await updateBookingStatus(
      partnerOrderId,
      'pending',
      orderId ?? undefined,
      stripePaymentIntentId ?? undefined,
    )

    return NextResponse.json({
      success: true,
      booking: {
        orderId,
        partnerOrderId: bookingData?.partner_order_id,
        status: 'pending',
        itemId: bookingData?.item_id,
        requires3DS: false,
      }
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to create booking' }, { status: 500 })
  }
}
