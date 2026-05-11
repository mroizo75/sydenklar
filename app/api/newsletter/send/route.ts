import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { supabase } from '@/lib/supabase'
import {
  getHotelsByCity,
  getHotelCountByCity,
  getCitiesByCountry,
  getCountriesWithCounts,
  slugify,
} from '@/lib/hotel-static-db'
import { WeeklyNewsletterEmail } from '@/emails/WeeklyNewsletter'
import type { NewsletterHotel, NewsletterDestination } from '@/emails/WeeklyNewsletter'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'
const FROM = process.env.RESEND_FROM || 'booking@sydenklar.no'
const CRON_SECRET = process.env.CRON_SECRET

const WEEKLY_COUNTRIES = [
  'Norway', 'Spain', 'Turkey', 'Italy', 'Greece',
  'Thailand', 'France', 'Croatia', 'Portugal', 'United Arab Emirates',
]

const COUNTRY_DISPLAY: Record<string, string> = {
  Norway: 'Norge', Spain: 'Spania', Turkey: 'Tyrkia', Italy: 'Italia',
  Greece: 'Hellas', Thailand: 'Thailand', France: 'Frankrike',
  Croatia: 'Kroatia', Portugal: 'Portugal', 'United Arab Emirates': 'De forente arabiske emirater',
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function pickWeeklyContent(weekNumber: number): { country: string; cityIndex: number } {
  const countryIndex = (weekNumber - 1) % WEEKLY_COUNTRIES.length
  return {
    country: WEEKLY_COUNTRIES[countryIndex],
    cityIndex: Math.floor(weekNumber / WEEKLY_COUNTRIES.length) % 5,
  }
}

function buildHotelUrl(hotel: { id: string; country_name?: string; city_name?: string }): string {
  if (!hotel.country_name || !hotel.city_name) return `${BASE_URL}/hoteller`
  const countrySlug = hotel.country_name === 'Norway' ? 'norge' : slugify(hotel.country_name)
  const citySlug = slugify(hotel.city_name)
  const hotelSlug = slugify(hotel.id)
  return `${BASE_URL}/hoteller/${countrySlug}/${citySlug}/${hotelSlug}`
}

function buildCityUrl(countryName: string, citySlug: string): string {
  const countrySlug = countryName === 'Norway' ? 'norge' : slugify(countryName)
  return `${BASE_URL}/hoteller/${countrySlug}/${citySlug}`
}

function mapHotel(h: {
  id: string
  name?: string
  city_name?: string
  country_name?: string
  star_rating?: number
  first_image?: string
}): NewsletterHotel {
  return {
    name: h.name ?? 'Hotell',
    city: h.city_name ?? '',
    country: COUNTRY_DISPLAY[h.country_name ?? ''] ?? (h.country_name ?? ''),
    starRating: h.star_rating ?? 0,
    imageUrl: h.first_image ? h.first_image.replace('{size}', '640x480') : null,
    pageUrl: buildHotelUrl({ id: h.id, country_name: h.country_name, city_name: h.city_name }),
  }
}

function fetchHotelsForCity(countryName: string, cityName: string, limit: number, weekNumber: number): NewsletterHotel[] {
  const total = getHotelCountByCity(countryName, cityName)
  if (total === 0) return []
  const rawOffset = (weekNumber % 10) * 3
  const safeOffset = rawOffset < total ? rawOffset : 0
  return getHotelsByCity(countryName, cityName, limit, safeOffset).map(mapHotel)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const { country, cityIndex } = pickWeeklyContent(weekNumber)
  const cities = getCitiesByCountry(country)

  let destination: NewsletterDestination
  let hotels: NewsletterHotel[] = []
  let activeCountry = country

  if (cities.length > 0) {
    const city = cities[cityIndex % cities.length]
    destination = {
      cityName: city.city_name,
      countryName: COUNTRY_DISPLAY[country] ?? country,
      hotelCount: city.count,
      pageUrl: buildCityUrl(country, city.slug),
    }
    hotels = fetchHotelsForCity(country, city.city_name, 3, weekNumber)
  } else {
    // Chosen country has no DB data — fall back to best available country
    const allCountries = getCountriesWithCounts()
    const fallbackCountry = allCountries[0]
    if (fallbackCountry) {
      activeCountry = fallbackCountry.country_name
      const fallbackCities = getCitiesByCountry(activeCountry)
      const fallbackCity = fallbackCities[0]
      if (fallbackCity) {
        destination = {
          cityName: fallbackCity.city_name,
          countryName: COUNTRY_DISPLAY[activeCountry] ?? activeCountry,
          hotelCount: fallbackCity.count,
          pageUrl: buildCityUrl(activeCountry, fallbackCity.slug),
        }
        hotels = fetchHotelsForCity(activeCountry, fallbackCity.city_name, 3, weekNumber)
      } else {
        destination = {
          cityName: 'Reisemål',
          countryName: 'Verden',
          hotelCount: 0,
          pageUrl: `${BASE_URL}/hoteller`,
        }
      }
    } else {
      destination = {
        cityName: 'Reisemål',
        countryName: 'Verden',
        hotelCount: 0,
        pageUrl: `${BASE_URL}/hoteller`,
      }
    }
  }

  // Fill remaining slots from top countries if still short
  if (hotels.length < 3) {
    const allCountries = getCountriesWithCounts()
    for (const c of allCountries) {
      if (hotels.length >= 3) break
      if (c.country_name === activeCountry) continue
      const topCity = getCitiesByCountry(c.country_name)[0]
      if (!topCity) continue
      const fill = getHotelsByCity(c.country_name, topCity.city_name, 3 - hotels.length)
      fill.forEach(h => hotels.push(mapHotel(h)))
    }
  }

  const { data: subscribers, error: subError } = await supabase
    .from('newsletter_subscribers')
    .select('email, first_name, unsubscribe_token')
    .is('unsubscribed_at', null)

  if (subError) {
    return NextResponse.json({ error: 'Kunne ikke hente abonnenter' }, { status: 500 })
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ message: 'Ingen aktive abonnenter', sent: 0 })
  }

  let sent = 0
  let failed = 0
  const BATCH = 10

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)
    await Promise.allSettled(
      batch.map(async (sub) => {
        try {
          const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
          const html = await render(
            WeeklyNewsletterEmail({
              firstName: sub.first_name ?? undefined,
              weekNumber,
              year,
              hotels,
              destination,
              unsubscribeUrl,
              baseUrl: BASE_URL,
            })
          )

          await resend.emails.send({
            from: `Sydenklar <${FROM}>`,
            to: sub.email,
            subject: `✈️ Ukens reiseinspirasjon – ${destination.cityName} (uke ${weekNumber})`,
            html,
          })
          sent++
        } catch {
          failed++
        }
      })
    )
  }

  return NextResponse.json({
    message: 'Nyhetsbrev sendt',
    week: weekNumber,
    year,
    destination: destination.cityName,
    hotels: hotels.length,
    sent,
    failed,
    total: subscribers.length,
  })
}
