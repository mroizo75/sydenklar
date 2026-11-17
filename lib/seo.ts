import type { Metadata } from 'next'
import type { HotelStaticRecord } from '@/lib/hotel-static-db'

export const SITE_URL = 'https://www.sydenklar.no'

const BRAND_SUFFIX = ' | Sydenklar'
const MAX_TITLE_LENGTH = 60

export function pageTitle(raw: string): string {
  const stripped = raw.replace(/\s*[|–—]\s*Sydenklar(\.no)?\s*$/i, '').trim()
  const budget = MAX_TITLE_LENGTH - BRAND_SUFFIX.length
  if (stripped.length <= budget) return stripped
  const cut = stripped.slice(0, budget - 1)
  const space = cut.lastIndexOf(' ')
  return (space > 24 ? cut.slice(0, space) : cut).trim()
}

export function brandedTitle(raw: string): string {
  return `${pageTitle(raw)}${BRAND_SUFFIX}`
}

function collectText(value: unknown): string[] {
  if (typeof value === 'string') {
    const text = value.replace(/\s+/g, ' ').trim()
    return text ? [text] : []
  }
  if (Array.isArray(value)) return value.flatMap(collectText)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const parts = [
      ...collectText(record.title),
      ...collectText(record.paragraphs),
      ...collectText(record.text),
    ]
    if (parts.length > 0) return parts
  }
  return []
}

export function hotelDescriptionParagraphs(raw: string | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const paragraphs = collectText(JSON.parse(trimmed))
      if (paragraphs.length > 0) return paragraphs
    } catch {
      // Vanlig tekst, ikke JSON
    }
  }
  return trimmed
    .split(/\n{2,}/)
    .map(part => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export function plainHotelText(raw: string | undefined, max = 155): string {
  const text = hotelDescriptionParagraphs(raw).join(' ')
  if (!text) return ''
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > 80 ? cut.slice(0, space) : cut).trim()}…`
}

interface DestinationMetadataOptions {
  title: string
  description: string
  path: string
  imageUrl?: string
}

export function generateDestinationMetadata(opts: DestinationMetadataOptions): Metadata {
  const url = `${SITE_URL}${opts.path}`
  const title = pageTitle(opts.title)
  const description = plainHotelText(opts.description, 160) || opts.description
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'nb-NO': url, 'x-default': url },
    },
    openGraph: {
      type: 'website',
      locale: 'nb_NO',
      url,
      siteName: 'Sydenklar',
      title: brandedTitle(title),
      description,
      images: opts.imageUrl
        ? [{ url: opts.imageUrl, width: 1200, height: 630, alt: opts.title }]
        : [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
    },
  }
}

interface HotelMetadataOptions {
  hotel: HotelStaticRecord
  path: string
}

export function generateHotelMetadata(opts: HotelMetadataOptions): Metadata {
  const { hotel, path } = opts
  const url = `${SITE_URL}${path}`
  const city = hotel.city_name ?? ''
  const country = hotel.country_name ?? ''
  const stars = hotel.star_rating && hotel.star_rating > 0
    ? `${Math.round(hotel.star_rating)}-stjerners `
    : ''
  const title = pageTitle(`${hotel.name} – ${stars}hotell i ${city}`)
  const about = plainHotelText(hotel.description, 150)
  const description = about
    ? about
    : `Book ${hotel.name} i ${city}${country ? `, ${country}` : ''}. Sammenlign priser og se ledige rom hos Sydenklar.`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { 'nb-NO': url, 'x-default': url },
    },
    openGraph: {
      type: 'website',
      locale: 'nb_NO',
      url,
      siteName: 'Sydenklar',
      title: brandedTitle(title),
      description,
      images: hotel.first_image
        ? [{ url: hotel.first_image.replace('{size}', '1024x768'), width: 1024, height: 768, alt: hotel.name ?? '' }]
        : [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: title }],
    },
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildHotelSchema(hotel: HotelStaticRecord, url: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotel.name,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.city_name,
      addressRegion: hotel.region_name,
      addressCountry: hotel.country_name,
    },
  }

  if (hotel.star_rating && hotel.star_rating > 0) {
    schema['starRating'] = {
      '@type': 'Rating',
      ratingValue: hotel.star_rating,
    }
  }

  if (hotel.first_image) {
    schema['image'] = hotel.first_image.replace('{size}', '1024x768')
  }

  const about = plainHotelText(hotel.description, 300)
  if (about) {
    schema['description'] = about
  }

  if (hotel.check_in_time) schema['checkinTime'] = hotel.check_in_time
  if (hotel.check_out_time) schema['checkoutTime'] = hotel.check_out_time

  const location = hotel.location as Record<string, number> | undefined
  if (location?.latitude && location?.longitude) {
    schema['geo'] = {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude,
    }
  }

  return schema
}

export function buildFaqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildItemListSchema(
  hotels: HotelStaticRecord[],
  baseUrl: string,
  slugify: (s: string) => string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: hotels.slice(0, 20).map((hotel, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${baseUrl}/${slugify(hotel.id)}`,
      name: hotel.name,
    })),
  }
}
