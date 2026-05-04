import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookHash, checkIn, checkOut, adults, children, rooms, currency } = body

    if (!bookHash || !checkIn || !checkOut || !adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: bookHash, checkIn, checkOut, adults'
      }, { status: 400 })
    }

    const result = await ratehawkClient.prebookRate({
      bookHash,
      checkIn,
      checkOut,
      adults,
      children: Array.isArray(children) ? children.length : (children || 0),
      rooms: rooms || 1,
      currency: currency || 'NOK'
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to prebook rate' }, { status: 500 })
    }

    return NextResponse.json({ success: true, prebookData: result.data })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to prebook rate' }, { status: 500 })
  }
}
