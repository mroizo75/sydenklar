import { NextRequest, NextResponse } from 'next/server'
import { ratehawkClient } from '@/lib/ratehawk-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const destinations = await ratehawkClient.searchDestinations(query)

    return NextResponse.json({ success: true, destinations: destinations || [] })
  } catch (error: unknown) {
    const fallbackDestinations = [
      { id: '2563', name: 'Oslo', type: 'city', country: 'Norge' },
      { id: '1953', name: 'København', type: 'city', country: 'Danmark' },
      { id: '1912', name: 'Barcelona', type: 'city', country: 'Spania' },
      { id: '1775', name: 'Paris', type: 'city', country: 'Frankrike' },
      { id: '1869', name: 'London', type: 'city', country: 'Storbritannia' },
      { id: '1783', name: 'Amsterdam', type: 'city', country: 'Nederland' }
    ]
    return NextResponse.json({ success: true, destinations: fallbackDestinations })
  }
}
