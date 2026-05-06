import type { MetadataRoute } from 'next'
import {
  getCountriesWithCounts,
  getCitiesByCountry,
  getSitemapEntries,
  slugify,
} from '@/lib/hotel-static-db'

const SITE_URL = 'https://www.sydenklar.no'

export const revalidate = 86400

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, priority: 1.0, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hoteller`, lastModified: now, priority: 0.9, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hoteller/norge`, lastModified: now, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/destinasjoner`, lastModified: now, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/tilbud`, lastModified: now, priority: 0.8, changeFrequency: 'daily' },
    { url: `${SITE_URL}/om-oss`, lastModified: now, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/kontakt`, lastModified: now, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/personvern`, lastModified: now, priority: 0.2, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/vilkar`, lastModified: now, priority: 0.2, changeFrequency: 'monthly' },
  ]

  let countryPages: MetadataRoute.Sitemap = []
  let cityPages: MetadataRoute.Sitemap = []
  let hotelPages: MetadataRoute.Sitemap = []

  try {
    const countries = getCountriesWithCounts()

    countryPages = countries.map(c => ({
      url: `${SITE_URL}/hoteller/${c.slug}`,
      lastModified: now,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }))

    // Add Norwegian city pages under /hoteller/norge/
    const norwegianCities = getCitiesByCountry('Norway')
    const norskByPages: MetadataRoute.Sitemap = norwegianCities.map(city => ({
      url: `${SITE_URL}/hoteller/norge/${city.slug}`,
      lastModified: now,
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    }))

    // City pages for all countries
    const allCityPages: MetadataRoute.Sitemap = []
    for (const country of countries) {
      const cities = getCitiesByCountry(country.country_name)
      for (const city of cities) {
        allCityPages.push({
          url: `${SITE_URL}/hoteller/${country.slug}/${city.slug}`,
          lastModified: now,
          priority: 0.6,
          changeFrequency: 'weekly' as const,
        })
      }
    }

    cityPages = [...norskByPages, ...allCityPages]

    // Hotel pages — limit to 50 000 to stay within Google's sitemap limit
    const entries = getSitemapEntries(50000)
    hotelPages = entries
      .filter(e => e.country_name && e.city_name && e.id && e.name)
      .map(e => {
        const countrySlug = slugify(e.country_name)
        const citySlug = slugify(e.city_name)
        const hotelSlug = slugify(e.id)
        const isNorway = e.country_name === 'Norway'
        const basePath = isNorway
          ? `/hoteller/norge/${citySlug}/${hotelSlug}`
          : `/hoteller/${countrySlug}/${citySlug}/${hotelSlug}`

        return {
          url: `${SITE_URL}${basePath}`,
          lastModified: e.updated_at ? new Date(e.updated_at * 1000) : now,
          priority: 0.5,
          changeFrequency: 'monthly' as const,
        }
      })
  } catch {
    // DB not available at build time — static pages only
  }

  return [...staticPages, ...countryPages, ...cityPages, ...hotelPages]
}
