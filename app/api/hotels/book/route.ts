import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { createBooking, updateBookingStatus } from '@/lib/users-db'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { getCurrentUserId } from '@/lib/auth'
import { randomUUID } from 'crypto'

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

    createBooking({
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
    })

    // RateHawk finishBooking
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
      remarks: remarks || '',
      roomCount: typeof roomCount === 'number' && roomCount > 0 ? roomCount : 1,
    })

    if (!bookingResult.success && (bookingResult as any).isFinal) {
      const errorCode = (bookingResult as any).error
      const userMessage =
        errorCode === 'booking_form_expired'
          ? 'Bookingsesjonen er utløpt. Start på nytt.'
          : errorCode === 'rate_not_found'
          ? 'Rommet er ikke lenger tilgjengelig.'
          : 'En feil oppsto. Kontakt support.'
      updateBookingStatus(partnerOrderId, 'failed')
      return NextResponse.json({ success: false, error: userMessage }, { status: 500 })
    }

    // Poll booking status (maks 36 forsøk)
    const FINAL_ERRORS = ['block', 'charge', '3ds', 'soldout', 'provider', 'book_limit', 'not_allowed']
    let attempts = 0
    let finalStatus: any = null

    while (attempts < 36) {
      await new Promise(resolve => setTimeout(resolve, attempts === 0 ? 2000 : 5000))
      const statusResult = await ratehawkClient.checkBookingStatus(partnerOrderId)

      if (statusResult.status === 'ok') {
        finalStatus = { ...statusResult, status: 'confirmed' as const }
        break
      } else if (statusResult.status === '3ds' || statusResult.error === '3ds') {
        finalStatus = { ...statusResult, status: '3ds_required' as const }
        break
      } else if (statusResult.status === 'error' && FINAL_ERRORS.includes(statusResult.error || '')) {
        finalStatus = { ...statusResult, status: 'failed' as const, error: 'En feil oppsto. Kontakt support.' }
        break
      }
      attempts++
    }

    if (!finalStatus) {
      finalStatus = { status: 'timeout', error: 'Booking status check timeout' }
    }

    const isSuccess = finalStatus.status === 'ok' || finalStatus.status === 'confirmed'
    const orderId = (bookingResult as any).data?.order_id

    // Oppdater booking i SQLite
    updateBookingStatus(
      partnerOrderId,
      isSuccess ? 'confirmed' : finalStatus.status,
      orderId ?? undefined,
      stripePaymentIntentId ?? undefined,
    )

    // Send bekreftelses-e-post ved suksess
    if (isSuccess) {
      const nights = checkIn && checkOut
        ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
        : 0

      await sendBookingConfirmationEmail({
        to: guestInfo.email,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        hotelName: hotelName || 'Hotell',
        roomName: roomName || 'Rom',
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        nights,
        adults: adults ?? 0,
        children: children ?? 0,
        partnerOrderId,
        amount: amount != null ? parseFloat(String(amount)) : 0,
        currency: currency || 'NOK',
        hotelAddress: hotelAddress ?? undefined,
        cancellationPolicy: cancellationPolicy ?? undefined,
      })
    }

    return NextResponse.json({
      success: isSuccess,
      booking: {
        orderId,
        partnerOrderId: (bookingResult as any).data?.partner_order_id,
        status: finalStatus.status,
        itemId: (bookingResult as any).data?.item_id,
        requires3DS: finalStatus.status === '3ds_required',
        data3DS: finalStatus.data?.data_3ds,
        error: finalStatus.error,
      }
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to create booking' }, { status: 500 })
  }
}
