import type { MetadataRoute } from 'next'
import {
  getCountriesWithCounts,
  getCitiesByCountry,
  getNorwayCountryName,
  getSitemapEntries,
  slugify,
} from '@/lib/hotel-static-db'
import { getAllArticles } from '@/lib/reisetips'

const SITE_URL = 'https://www.sydenklar.no'
const SITEMAP_LIMIT = 50000

const HOSTFERIE_SLUGS = [
  'gran-canaria',
  'kreta',
  'tenerife',
  'antalya',
  'alanya',
  'bangkok',
]

export const revalidate = 86400

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, priority: 1, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hoteller`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hoteller/norge`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/destinasjoner`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/tilbud`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hostferie`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/reisetips`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/skreddersy`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/faq`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/om-oss`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/kontakt`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/support`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/hjelp/bestilling`, priority: 0.3, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/hjelp/avbestilling`, priority: 0.3, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/personvern`, priority: 0.2, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/vilkar`, priority: 0.2, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/cookies`, priority: 0.2, changeFrequency: 'yearly' },
  ]

  const editorialPages: MetadataRoute.Sitemap = [
    ...HOSTFERIE_SLUGS.map(slug => ({
      url: `${SITE_URL}/hostferie/${slug}`,
      priority: 0.6,
      changeFrequency: 'weekly' as const,
    })),
    ...getAllArticles().map(article => ({
      url: `${SITE_URL}/reisetips/${article.slug}`,
      lastModified: article.publishedAt ? new Date(article.publishedAt) : undefined,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ]

  let countryPages: MetadataRoute.Sitemap = []
  let cityPages: MetadataRoute.Sitemap = []
  let hotelPages: MetadataRoute.Sitemap = []

  try {
    const norwayName = getNorwayCountryName()
    const countries = getCountriesWithCounts().filter(country => country.country_name !== norwayName)

    countryPages = countries.map(country => ({
      url: `${SITE_URL}/hoteller/${country.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }))

    const norwegianCities = norwayName ? getCitiesByCountry(norwayName) : []
    cityPages = norwegianCities.map(city => ({
      url: `${SITE_URL}/hoteller/norge/${city.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    }))

    for (const country of countries) {
      const cities = getCitiesByCountry(country.country_name)
      for (const city of cities) {
        cityPages.push({
          url: `${SITE_URL}/hoteller/${country.slug}/${city.slug}`,
          priority: 0.6,
          changeFrequency: 'weekly' as const,
        })
      }
    }

    const reserved = staticPages.length + editorialPages.length + countryPages.length + cityPages.length
    const hotelLimit = Math.max(0, SITEMAP_LIMIT - reserved)
    const entries = getSitemapEntries(hotelLimit)
    hotelPages = entries
      .filter(entry => entry.country_name && entry.city_name && entry.id)
      .map(entry => {
        const countrySlug = entry.country_name === norwayName ? 'norge' : slugify(entry.country_name)
        const citySlug = slugify(entry.city_name)
        const hotelSlug = slugify(entry.id)
        return {
          url: `${SITE_URL}/hoteller/${countrySlug}/${citySlug}/${hotelSlug}`,
          lastModified: entry.updated_at ? new Date(entry.updated_at * 1000) : undefined,
          priority: 0.5,
          changeFrequency: 'monthly' as const,
        }
      })
  } catch {
    // Databasen er ikke tilgjengelig ved bygging
  }

  return [...staticPages, ...editorialPages, ...countryPages, ...cityPages, ...hotelPages]
}
