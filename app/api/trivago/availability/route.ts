import { NextRequest, NextResponse } from 'next/server'
import { getHotelById, getHotelByHid, slugify } from '@/lib/hotel-static-db'
import { SITE_URL } from '@/lib/seo'
import { ratehawkClient } from '@/lib/ratehawk-client'

/**
 * Trivago FastConnect — Hotel Availability API
 *
 * POST /api/trivago/availability
 *
 * Trivago sends this request every time a user searches on trivago.no.
 * We respond with live rates from RateHawk for the requested hotels.
 *
 * Trivago docs: https://developer.trivago.com/fastconnect/hotel-availability.html
 *
 * Request body (from trivago):
 * {
 *   hotel_ids: string[]      // our hotel_id values from the inventory feed
 *   checkin: "YYYY-MM-DD"
 *   checkout: "YYYY-MM-DD"
 *   adults: number
 *   children?: number[]      // array of child ages
 *   currency: string         // e.g. "NOK"
 *   residency?: string       // e.g. "NO"
 * }
 *
 * Response (one entry per hotel with available rates):
 * {
 *   results: Array<{
 *     hotel_id: string
 *     rate: number
 *     currency: string
 *     deep_link: string
 *     room_name: string
 *     board_type?: string
 *   }>
 * }
 */

interface TrivagoAvailabilityRequest {
  hotel_ids: string[]
  checkin: string
  checkout: string
  adults: number
  children?: number[]
  currency?: string
  residency?: string
}

export async function POST(req: NextRequest) {
  const secret = process.env.TRIVAGO_PARTNER_SECRET
  if (secret) {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: TrivagoAvailabilityRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { hotel_ids, checkin, checkout, adults, children = [], currency = 'NOK', residency = 'no' } = body

  if (!Array.isArray(hotel_ids) || hotel_ids.length === 0) {
    return NextResponse.json({ error: 'hotel_ids array required' }, { status: 400 })
  }

  if (!checkin || !checkout) {
    return NextResponse.json({ error: 'checkin and checkout required' }, { status: 400 })
  }

  const results: Array<{
    hotel_id: string
    rate: number
    currency: string
    deep_link: string
    room_name: string
    board_type: string
  }> = []

  await Promise.allSettled(
    hotel_ids.slice(0, 50).map(async (hotelId) => {
      try {
        const staticRecord = getHotelById(hotelId)
        if (!staticRecord) return

        const hid = staticRecord.hid

        const details = await ratehawkClient.getHotelDetails({
          hotelId,
          hid,
          checkIn: checkin,
          checkOut: checkout,
          adults,
          children,
          rooms: 1,
          currency,
          residency,
        })

        if (!details.success || !details.hotel?.rooms?.length) return

        const rooms = details.hotel.rooms as Array<{
          room_name: string
          payment_options?: { payment_types?: Array<{ amount: string; currency_code: string }> }
          meal_data?: { has_breakfast?: boolean; has_all_inclusive?: boolean; has_half_board?: boolean }
        }>

        const cheapest = rooms.slice().sort((a, b) => {
          const aAmt = parseFloat(a.payment_options?.payment_types?.[0]?.amount ?? '999999')
          const bAmt = parseFloat(b.payment_options?.payment_types?.[0]?.amount ?? '999999')
          return aAmt - bAmt
        })[0]

        const rateAmount = parseFloat(cheapest.payment_options?.payment_types?.[0]?.amount ?? '0')
        const rateCurrency = cheapest.payment_options?.payment_types?.[0]?.currency_code ?? currency

        if (rateAmount <= 0) return

        const meal = cheapest.meal_data
        let boardType = 'room_only'
        if (meal?.has_all_inclusive) boardType = 'all_inclusive'
        else if (meal?.has_half_board) boardType = 'half_board'
        else if (meal?.has_breakfast) boardType = 'breakfast_included'

        const countrySlug = staticRecord.country_name ? slugify(staticRecord.country_name) : null
        const citySlug = staticRecord.city_name ? slugify(staticRecord.city_name) : null
        const hotelSlug = slugify(hotelId)
        const isNorway = staticRecord.country_name === 'Norway'

        const params = new URLSearchParams({
          checkIn: checkin,
          checkOut: checkout,
          adults: adults.toString(),
          hotel: staticRecord.name ?? hotelId,
        })

        const deepLink =
          countrySlug && citySlug
            ? isNorway
              ? `${SITE_URL}/hoteller/norge/${citySlug}/${hotelSlug}?${params}`
              : `${SITE_URL}/hoteller/${countrySlug}/${citySlug}/${hotelSlug}?${params}`
            : `${SITE_URL}/hoteller?hotel=${encodeURIComponent(staticRecord.name ?? hotelId)}&checkIn=${checkin}&checkOut=${checkout}&adults=${adults}`

        results.push({
          hotel_id: hotelId,
          rate: Math.round(rateAmount),
          currency: rateCurrency,
          deep_link: deepLink,
          room_name: cheapest.room_name,
          board_type: boardType,
        })
      } catch {
        // Skip this hotel on error — trivago expects we only return available rates
      }
    })
  )

  return NextResponse.json(
    { results },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  )
}
