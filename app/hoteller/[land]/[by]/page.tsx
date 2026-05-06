import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  findCountryBySlug,
  findCityBySlug,
  getHotelsByCity,
  getHotelCountByCity,
  slugify,
} from '@/lib/hotel-static-db'
import {
  generateDestinationMetadata,
  buildBreadcrumbSchema,
  buildItemListSchema,
  SITE_URL,
} from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props {
  params: Promise<{ land: string; by: string }>
}

const COUNTRY_DISPLAY: Record<string, string> = {
  Norway: 'Norge',
  Spain: 'Spania',
  Turkey: 'Tyrkia',
  Italy: 'Italia',
  Greece: 'Hellas',
  Thailand: 'Thailand',
  France: 'Frankrike',
  Germany: 'Tyskland',
  'United Kingdom': 'Storbritannia',
  Portugal: 'Portugal',
  Croatia: 'Kroatia',
  'United Arab Emirates': 'De forente arabiske emirater',
  'United States': 'USA',
  Japan: 'Japan',
  Denmark: 'Danmark',
  Sweden: 'Sverige',
}

function displayCountry(name: string): string {
  return COUNTRY_DISPLAY[name] ?? name
}

const STARS: Record<number, string> = {
  5: '★★★★★',
  4: '★★★★',
  3: '★★★',
  2: '★★',
  1: '★',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { land, by } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) return {}
  const cityName = findCityBySlug(countryName, by)
  if (!cityName) return {}

  const countryDisplay = displayCountry(countryName)
  const total = getHotelCountByCity(countryName, cityName)

  return generateDestinationMetadata({
    title: `Hoteller i ${cityName} – Sammenlign ${total} hoteller | Sydenklar`,
    description: `Finn og bestill hotell i ${cityName}, ${countryDisplay}. Sammenlign ${total} hoteller med de beste prisene på Sydenklar.`,
    path: `/hoteller/${land}/${by}`,
  })
}

export default async function ByPage({ params }: Props) {
  const { land, by } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) notFound()

  const cityName = findCityBySlug(countryName, by)
  if (!cityName) notFound()

  const hotels = getHotelsByCity(countryName, cityName, 48)
  const total = getHotelCountByCity(countryName, cityName)
  const countryDisplay = displayCountry(countryName)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Hjem', url: SITE_URL },
    { name: 'Hoteller', url: `${SITE_URL}/hoteller` },
    { name: countryDisplay, url: `${SITE_URL}/hoteller/${land}` },
    { name: cityName, url: `${SITE_URL}/hoteller/${land}/${by}` },
  ])

  const itemList = buildItemListSchema(hotels, `/hoteller/${land}/${by}`, slugify)

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-[var(--deep)] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/hoteller" className="hover:text-white transition-colors">Hoteller</Link>
            <span>/</span>
            <Link href={`/hoteller/${land}`} className="hover:text-white transition-colors">{countryDisplay}</Link>
            <span>/</span>
            <span className="text-white">{cityName}</span>
          </nav>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-3">
            Hoteller i {cityName}
          </h1>
          <p className="text-white/60 text-base">
            {total.toLocaleString('nb-NO')} hoteller i {cityName}, {countryDisplay}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-[var(--sand-light)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="font-display text-2xl text-[var(--deep)]">
              {total.toLocaleString('nb-NO')} hoteller
            </h2>
            <Link
              href={`/hoteller?destinasjon=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Søk med datoer og priser
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {hotels.map(hotel => {
              const hotelSlug = slugify(hotel.id)
              const imageUrl = hotel.first_image
                ? hotel.first_image.replace('{size}', '640x480')
                : null

              return (
                <Link
                  key={hotel.id}
                  href={`/hoteller/${land}/${by}/${hotelSlug}`}
                  className="group bg-white rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:border-[var(--coral)]/30 transition-all"
                >
                  <div className="relative aspect-[4/3] bg-[var(--sand)] overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={hotel.name ?? ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)]">
                        <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zm0 11H5V9h14v9zM3 5h18v2H3V5z" />
                        </svg>
                      </div>
                    )}
                    {hotel.star_rating != null && hotel.star_rating > 0 && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {STARS[Math.round(hotel.star_rating)] ?? `${hotel.star_rating}★`}
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-medium text-[var(--deep)] text-sm leading-tight line-clamp-2 group-hover:text-[var(--coral)] transition-colors mb-1">
                      {hotel.name}
                    </h3>
                    {hotel.address && (
                      <p className="text-xs text-[var(--muted)] line-clamp-1">{hotel.address}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {total > 48 && (
            <div className="mt-10 text-center">
              <Link
                href={`/hoteller?destinasjon=${encodeURIComponent(cityName)}`}
                className="inline-flex items-center gap-2 border border-[var(--border)] bg-white hover:bg-[var(--sand)] text-[var(--deep)] font-medium px-8 py-3 rounded-full transition-colors"
              >
                Se alle {total.toLocaleString('nb-NO')} hoteller i {cityName}
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </main>
  )
}
