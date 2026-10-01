import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { sendAdminBookingNotification, sendBookingConfirmationEmail } from '@/lib/email'
import { insertServerEvent } from '@/lib/analytics-server'
import { extractUserData, sendServerEvent } from '@/lib/meta-capi'
import { getBookingByPartnerOrderId, updateBookingStatus } from '@/lib/users-db'

const FINAL_ERRORS = ['block', 'charge', 'soldout', 'provider', 'book_limit', 'not_allowed']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { partnerOrderId } = body

    if (!partnerOrderId) {
      return NextResponse.json({ success: false, error: 'Missing required parameter: partnerOrderId' }, { status: 400 })
    }

    const booking = await getBookingByPartnerOrderId(partnerOrderId)
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status === 'confirmed') {
      return NextResponse.json({
        success: true,
        status: 'confirmed',
        data: { order_id: booking.ratehawkOrderId },
      })
    }

    if (booking.status === 'failed') {
      return NextResponse.json({ success: false, status: 'failed', error: 'Bookingen kunne ikke bekreftes.' })
    }

    const statusResult = await ratehawkClient.checkBookingStatus(partnerOrderId)

    if (statusResult.status === 'ok') {
      await updateBookingStatus(partnerOrderId, 'confirmed')

      const nights = booking.checkIn && booking.checkOut
        ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
        : 0

      await sendBookingConfirmationEmail({
        to: booking.guestEmail,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        hotelName: booking.hotelName || 'Hotell',
        roomName: booking.roomName || 'Rom',
        checkIn: booking.checkIn || '',
        checkOut: booking.checkOut || '',
        nights,
        adults: booking.adults ?? 0,
        children: booking.children ?? 0,
        partnerOrderId,
        amount: booking.amount ?? 0,
        currency: booking.currency || 'NOK',
        hotelAddress: booking.hotelAddress ?? undefined,
        cancellationPolicy: booking.cancellationPolicy ?? undefined,
      })

      void sendServerEvent(
        'Purchase',
        `https://www.sydenklar.no/booking-bekreftelse?ref=${partnerOrderId}`,
        extractUserData(request, booking.guestEmail),
        {
          content_name: booking.hotelName || 'Hotell',
          content_ids: [booking.hotelId || partnerOrderId],
          content_type: 'hotel',
          value: booking.amount ?? 0,
          currency: booking.currency || 'NOK',
          num_items: 1,
        },
      )

      insertServerEvent('purchase', {
        hotelId: booking.hotelId,
        hotelName: booking.hotelName,
        orderId: partnerOrderId,
        amount: booking.amount ?? 0,
        currency: booking.currency || 'NOK',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      })

      void sendAdminBookingNotification({
        partnerOrderId,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
        guestEmail: booking.guestEmail,
        hotelName: booking.hotelName || 'Hotell',
        checkIn: booking.checkIn || '',
        checkOut: booking.checkOut || '',
        adults: booking.adults ?? 0,
        amount: booking.amount ?? 0,
        currency: booking.currency || 'NOK',
      })

      return NextResponse.json({
        success: true,
        status: 'confirmed',
        data: {
          ...statusResult.data,
          order_id: booking.ratehawkOrderId,
        },
      })
    }

    if (statusResult.status === '3ds' || statusResult.error === '3ds') {
      await updateBookingStatus(partnerOrderId, '3ds_required')
      return NextResponse.json({
        success: true,
        status: '3ds_required',
        data: statusResult.data,
        requires3DS: true,
        data3DS: statusResult.data?.data_3ds,
      })
    }

    if (statusResult.status === 'error' && FINAL_ERRORS.includes(statusResult.error || '')) {
      await updateBookingStatus(partnerOrderId, 'failed')
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'En feil oppsto. Kontakt support.',
      })
    }

    if (!statusResult.success && statusResult.status === 'error') {
      return NextResponse.json(
        { success: false, status: 'pending', error: statusResult.error || 'Failed to check booking status' },
        { status: 503 },
      )
    }

    return NextResponse.json({
      success: true,
      status: 'pending',
      data: statusResult.data,
      error: statusResult.error,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to check booking status' }, { status: 500 })
  }
}
