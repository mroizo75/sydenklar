import { NextRequest, NextResponse } from 'next/server'
import { getAllHotelsForFeed, slugify } from '@/lib/hotel-static-db'
import { SITE_URL } from '@/lib/seo'

/**
 * Trivago FastConnect — Hotel Inventory Feed
 *
 * GET /api/trivago/hotels
 *
 * Returns a JSON list of all bookable hotels for trivago to map against its
 * property database. Should be refreshed daily.
 *
 * Trivago docs: https://developer.trivago.com/fastconnect/hotel-data.html
 */

export async function GET(req: NextRequest) {
  const secret = process.env.TRIVAGO_PARTNER_SECRET
  if (secret) {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const rows = getAllHotelsForFeed()

    const hotels = rows.map(row => {
      let lat: number | null = null
      let lng: number | null = null

      if (row.location) {
        try {
          const loc = JSON.parse(row.location) as Record<string, unknown>
          lat = typeof loc.latitude === 'number' ? loc.latitude : null
          lng = typeof loc.longitude === 'number' ? loc.longitude : null
        } catch {
          // ignore malformed location
        }
      }

      const countrySlug = row.country_name ? slugify(row.country_name) : null
      const citySlug = row.city_name ? slugify(row.city_name) : null
      const hotelSlug = slugify(row.id)
      const isNorway = row.country_name === 'Norway'

      const deepLink =
        countrySlug && citySlug
          ? isNorway
            ? `${SITE_URL}/hoteller/norge/${citySlug}/${hotelSlug}`
            : `${SITE_URL}/hoteller/${countrySlug}/${citySlug}/${hotelSlug}`
          : `${SITE_URL}/hoteller`

      return {
        hotel_id: row.id,
        hid: row.hid,
        name: row.name,
        address: row.address ?? '',
        city: row.city_name ?? '',
        region: row.region_name ?? '',
        country: row.country_name ?? '',
        star_rating: row.star_rating ?? 0,
        latitude: lat,
        longitude: lng,
        image_url: row.first_image?.replace('{size}', '640x480') ?? null,
        deep_link: deepLink,
      }
    })

    return NextResponse.json(
      { hotels, total: hotels.length, generated_at: new Date().toISOString() },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
