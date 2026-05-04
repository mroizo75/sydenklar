import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'
import { RateHawkHotelSearchParams } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const userCountry: string | null = body.residency || 'no'

    const params: RateHawkHotelSearchParams = {
      destination: body.destination,
      destinationType: body.destinationType || '',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      adults: body.adults || 2,
      children: Array.isArray(body.children) ? body.children : [],
      rooms: body.rooms || 1,
      roomConfigs: Array.isArray(body.roomConfigs) ? body.roomConfigs : undefined,
      currency: body.currency || 'NOK'
    }

    const result = await ratehawkClient.searchHotels(params, userCountry)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Hotel search failed',
          technicalError: result.technicalError,
          hotels: [],
          totalResults: 0
        },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke søke etter hoteller',
        technicalError: err.message || 'Unknown error',
        hotels: [],
        totalResults: 0,
      },
      { status: 500 }
    )
  }
}
