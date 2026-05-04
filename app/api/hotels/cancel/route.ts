import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { partnerOrderId } = body

    if (!partnerOrderId) {
      return NextResponse.json({ success: false, error: 'Missing required parameter: partnerOrderId' }, { status: 400 })
    }

    const result = await ratehawkClient.cancelBooking(partnerOrderId)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Cancellation failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message, penalties: result.penalties })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to cancel booking' }, { status: 500 })
  }
}
