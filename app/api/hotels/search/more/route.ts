import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchId, offset, batchSize } = body

    if (!searchId || typeof offset !== 'number') {
      return NextResponse.json(
        { success: false, error: 'searchId og offset er påkrevd', hotels: [], totalResults: 0 },
        { status: 400 }
      )
    }

    const result = await ratehawkClient.enrichHotelBatch(searchId, offset, batchSize || 15)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, hotels: [], totalResults: 0 },
        { status: 410 }
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json(
      { success: false, error: 'Kunne ikke laste flere hoteller', technicalError: err.message, hotels: [], totalResults: 0 },
      { status: 500 }
    )
  }
}
