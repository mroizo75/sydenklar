import type { Metadata } from 'next'
import type { HotelStaticRecord } from '@/lib/hotel-static-db'

export const SITE_URL = 'https://www.sydenklar.no'

interface DestinationMetadataOptions {
  title: string
  description: string
  path: string
  imageUrl?: string
}

export function generateDestinationMetadata(opts: DestinationMetadataOptions): Metadata {
  const url = `${SITE_URL}${opts.path}`
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: { 'nb-NO': url, 'x-default': url },
    },
    openGraph: {
      type: 'website',
      locale: 'nb_NO',
      url,
      siteName: 'Sydenklar',
      title: opts.title,
      description: opts.description,
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
  const stars = hotel.star_rating ? `${hotel.star_rating}-stjerners ` : ''
  const city = hotel.city_name ?? ''
  const country = hotel.country_name ?? ''
  const title = `${hotel.name} – ${stars}hotell i ${city} | Sydenklar`
  const description = hotel.description
    ? hotel.description.slice(0, 155)
    : `Book ${hotel.name} i ${city}, ${country}. Sammenlign priser og finn de beste tilbudene med Sydenklar.`

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
      title,
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

  if (hotel.description) {
    schema['description'] = hotel.description.slice(0, 300)
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
