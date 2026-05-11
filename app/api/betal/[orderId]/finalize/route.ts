import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { getBookingByPartnerOrderId, updateBookingStatus } from '@/lib/users-db'
import { sendBookingConfirmationEmail, sendAdminBookingNotification } from '@/lib/email'

const FINAL_ERRORS = ['block', 'charge', '3ds', 'soldout', 'provider', 'book_limit', 'not_allowed']

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params

  const booking = await getBookingByPartnerOrderId(orderId)

  if (!booking) {
    return NextResponse.json({ error: 'Bestilling ikke funnet' }, { status: 404 })
  }

  if (booking.status !== 'pending_payment' && booking.status !== 'paid') {
    return NextResponse.json({ error: `Ugyldig status: ${booking.status}` }, { status: 400 })
  }

  const pd = booking.prebookData as Record<string, unknown> | null
  if (!pd) {
    return NextResponse.json({ error: 'Mangler prebookData — kan ikke fullføre mot hotellet' }, { status: 500 })
  }

  const guestInfo = pd.guestInfo as { firstName: string; lastName: string; email: string; phone: string }
  const paymentType = pd.paymentType as { type: 'now' | 'deposit'; amount: string | number; currency_code: string }

  const storedUpsellData = Array.isArray(pd.upsellData) && pd.upsellData.length > 0
    ? (pd.upsellData as object[])
    : undefined

  // Finaliserer booking mot RateHawk
  const bookingResult = await ratehawkClient.finishBooking({
    bookHash: pd.bookHash as string,
    partnerOrderId: orderId,
    userEmail: guestInfo.email,
    userPhone: guestInfo.phone ?? '',
    firstName: guestInfo.firstName,
    lastName: guestInfo.lastName,
    childGuests: [],
    additionalRoomGuests: [],
    roomConfigs: [],
    paymentType: paymentType.type,
    amount: String(paymentType.amount),
    currencyCode: paymentType.currency_code,
    amountSellB2b2c: String(booking.amount ?? '0'),
    remarks: (pd.remarks as string) ?? '',
    roomCount: (pd.rooms as number) ?? 1,
    upsellData: storedUpsellData,
  })

  if (!bookingResult.success && (bookingResult as { isFinal?: boolean }).isFinal) {
    await updateBookingStatus(orderId, 'failed')
    return NextResponse.json({ error: 'Hotellet kunne ikke bekrefte bookingen. Kontakt support.' }, { status: 500 })
  }

  // Poll status
  let attempts = 0
  let finalStatus: { status: string; error?: string; data?: Record<string, unknown> } | null = null

  while (attempts < 36) {
    await new Promise(resolve => setTimeout(resolve, attempts === 0 ? 2000 : 5000))
    const statusResult = await ratehawkClient.checkBookingStatus(orderId)

    if (statusResult.status === 'ok') {
      finalStatus = { status: 'confirmed' }
      break
    } else if (statusResult.error === '3ds' || statusResult.status === '3ds') {
      finalStatus = { status: '3ds_required' }
      break
    } else if (statusResult.status === 'error' && FINAL_ERRORS.includes(statusResult.error ?? '')) {
      finalStatus = { status: 'failed', error: statusResult.error }
      break
    }
    attempts++
  }

  if (!finalStatus) finalStatus = { status: 'timeout' }

  const isSuccess = finalStatus.status === 'confirmed'
  const ratehawkOrderId = (bookingResult as { data?: { order_id?: number } }).data?.order_id

  await updateBookingStatus(
    orderId,
    isSuccess ? 'confirmed' : finalStatus.status,
    ratehawkOrderId,
    booking.stripePaymentId ?? undefined,
  )

  if (isSuccess) {
    const nights = booking.checkIn && booking.checkOut
      ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
      : 0

    await sendBookingConfirmationEmail({
      to: guestInfo.email,
      guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
      hotelName: booking.hotelName ?? 'Hotell',
      roomName: booking.roomName ?? 'Rom',
      checkIn: booking.checkIn ?? '',
      checkOut: booking.checkOut ?? '',
      nights,
      adults: booking.adults ?? 0,
      children: booking.children ?? 0,
      partnerOrderId: orderId,
      amount: booking.amount ?? 0,
      currency: booking.currency ?? 'NOK',
      hotelAddress: booking.hotelAddress ?? undefined,
      cancellationPolicy: booking.cancellationPolicy ?? undefined,
    })

    sendAdminBookingNotification({
      partnerOrderId: orderId,
      guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
      guestEmail: guestInfo.email,
      hotelName: booking.hotelName ?? 'Hotell',
      checkIn: booking.checkIn ?? '',
      checkOut: booking.checkOut ?? '',
      adults: booking.adults ?? 0,
      amount: booking.amount ?? 0,
      currency: booking.currency ?? 'NOK',
    })
  }

  return NextResponse.json({
    success: isSuccess,
    status: finalStatus.status,
    partnerOrderId: orderId,
  })
}
