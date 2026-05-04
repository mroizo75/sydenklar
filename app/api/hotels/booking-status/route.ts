import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { partnerOrderId } = body

    if (!partnerOrderId) {
      return NextResponse.json({ success: false, error: 'Missing required parameter: partnerOrderId' }, { status: 400 })
    }

    const statusResult = await ratehawkClient.checkBookingStatus(partnerOrderId)

    if (!statusResult.success && statusResult.status === 'error') {
      return NextResponse.json({ success: false, error: statusResult.error || 'Failed to check booking status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      data: statusResult.data,
      error: statusResult.error,
      requires3DS: statusResult.status === '3ds',
      data3DS: statusResult.data?.data_3ds,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ success: false, error: err.message || 'Failed to check booking status' }, { status: 500 })
  }
}
