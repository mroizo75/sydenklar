import { NextRequest, NextResponse } from 'next/server'
import { searchHotelByName } from '@/lib/hotel-static-db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ success: false, error: 'Mangler søkeord' }, { status: 400 })
  }

  const hotels = searchHotelByName(q.trim(), 5)

  return NextResponse.json({
    success: true,
    hotels: hotels.map(h => ({
      id: h.id,
      hid: h.hid,
      name: h.name,
      address: h.address,
      city_name: h.city_name,
      star_rating: h.star_rating,
      first_image: h.first_image,
    })),
  })
}
