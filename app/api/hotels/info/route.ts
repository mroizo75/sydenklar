import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelId, hid } = body

    if (!hotelId && !hid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: hotelId or hid' },
        { status: 400 }
      )
    }

    const info = await ratehawkClient.getHotelInfo(
      hotelId ?? undefined,
      hid ? Number(hid) : undefined
    )

    if (!info) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, hotel: info })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch hotel info' },
      { status: 500 }
    )
  }
}
