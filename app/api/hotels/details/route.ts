import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelId, hid, checkIn, checkOut, adults, children, rooms, roomConfigs, currency, residency } = body

    if ((!hotelId && !hid) || !checkIn || !checkOut || !adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: hotelId/hid, checkIn, checkOut, adults'
      }, { status: 400 })
    }

    const result = await ratehawkClient.getHotelDetails({
      hotelId,
      hid,
      checkIn,
      checkOut,
      adults,
      children: Array.isArray(children) ? children : [],
      rooms: rooms || 1,
      roomConfigs: Array.isArray(roomConfigs) ? roomConfigs : undefined,
      currency: currency || 'NOK',
      residency: residency || 'no'
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to fetch hotel details' }, { status: 500 })
    }

    return NextResponse.json({ success: true, hotel: result.hotel })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch hotel details' }, { status: 500 })
  }
}
