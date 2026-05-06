import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  findCountryBySlug,
  findCityBySlug,
  getHotelsByCity,
  slugify,
} from '@/lib/hotel-static-db'
import {
  generateHotelMetadata,
  buildBreadcrumbSchema,
  buildHotelSchema,
  SITE_URL,
} from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 86400

interface Props {
  params: Promise<{ land: string; by: string; hotell: string }>
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { land, by, hotell } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) return {}
  const cityName = findCityBySlug(countryName, by)
  if (!cityName) return {}

  const hotels = getHotelsByCity(countryName, cityName, 200)
  const hotel = hotels.find(h => slugify(h.id) === hotell)
  if (!hotel) return {}

  return generateHotelMetadata({
    hotel,
    path: `/hoteller/${land}/${by}/${hotell}`,
  })
}

export default async function HotellPage({ params }: Props) {
  const { land, by, hotell } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) notFound()

  const cityName = findCityBySlug(countryName, by)
  if (!cityName) notFound()

  const hotels = getHotelsByCity(countryName, cityName, 200)
  const hotel = hotels.find(h => slugify(h.id) === hotell)
  if (!hotel) notFound()

  const countryDisplay = displayCountry(countryName)
  const pageUrl = `${SITE_URL}/hoteller/${land}/${by}/${hotell}`

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Hjem', url: SITE_URL },
    { name: 'Hoteller', url: `${SITE_URL}/hoteller` },
    { name: countryDisplay, url: `${SITE_URL}/hoteller/${land}` },
    { name: cityName, url: `${SITE_URL}/hoteller/${land}/${by}` },
    { name: hotel.name ?? '', url: pageUrl },
  ])

  const hotelSchema = buildHotelSchema(hotel, pageUrl)

  const images = (hotel.images ?? []).slice(0, 6).map(img =>
    img.replace('{size}', '1024x768')
  )
  const mainImage = images[0] ?? null

  const stars = hotel.star_rating ? Math.round(hotel.star_rating) : 0
  const starStr = stars > 0 ? '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars)) : null

  const amenities: string[] = []
  if (hotel.amenity_groups) {
    for (const group of hotel.amenity_groups) {
      for (const a of group.amenities ?? []) {
        amenities.push(typeof a === 'string' ? a : (a as any).name ?? '')
      }
    }
  }

  const searchUrl = `/hoteller?destinasjon=${encodeURIComponent(cityName)}&hotel=${encodeURIComponent(hotel.name ?? '')}`

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-[var(--deep)] pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/hoteller" className="hover:text-white transition-colors">Hoteller</Link>
            <span>/</span>
            <Link href={`/hoteller/${land}`} className="hover:text-white transition-colors">{countryDisplay}</Link>
            <span>/</span>
            <Link href={`/hoteller/${land}/${by}`} className="hover:text-white transition-colors">{cityName}</Link>
            <span>/</span>
            <span className="text-white line-clamp-1">{hotel.name}</span>
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-[var(--sand-light)] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            {mainImage && (
              <div className="relative w-full aspect-[16/7] bg-[var(--sand)]">
                <Image
                  src={mainImage}
                  alt={hotel.name ?? ''}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
            )}

            {images.length > 1 && (
              <div className="flex gap-2 px-5 pt-3 overflow-x-auto scrollbar-hide">
                {images.slice(1).map((img, i) => (
                  <div key={i} className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--sand)]">
                    <Image
                      src={img}
                      alt={`${hotel.name} bilde ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl text-[var(--deep)] mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    {starStr && (
                      <span className="text-[var(--gold)] text-sm tracking-wider">{starStr}</span>
                    )}
                    {hotel.address && (
                      <span className="text-[var(--muted)] text-sm">
                        {hotel.address}, {cityName}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={searchUrl}
                  className="flex-shrink-0 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-7 py-3 rounded-full transition-colors text-sm"
                >
                  Sjekk priser og tilgjengelighet
                </Link>
              </div>

              {hotel.description && (
                <div className="mb-8">
                  <h2 className="font-display text-xl text-[var(--deep)] mb-3">Om hotellet</h2>
                  <p className="text-[var(--muted)] leading-relaxed">
                    {hotel.description.slice(0, 600)}
                    {hotel.description.length > 600 ? '…' : ''}
                  </p>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-xl text-[var(--deep)] mb-4">Fasiliteter</h2>
                  <div className="flex flex-wrap gap-2">
                    {amenities.slice(0, 20).map(a => (
                      <span
                        key={a}
                        className="text-xs bg-[var(--sea-light)] text-[var(--sea)] px-3 py-1 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm">
                {hotel.check_in_time && (
                  <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                    <div className="text-[var(--muted)] text-xs mb-1">Innsjekk</div>
                    <div className="font-medium text-[var(--deep)]">{hotel.check_in_time}</div>
                  </div>
                )}
                {hotel.check_out_time && (
                  <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                    <div className="text-[var(--muted)] text-xs mb-1">Utsjekk</div>
                    <div className="font-medium text-[var(--deep)]">{hotel.check_out_time}</div>
                  </div>
                )}
                {hotel.kind && (
                  <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                    <div className="text-[var(--muted)] text-xs mb-1">Type</div>
                    <div className="font-medium text-[var(--deep)] capitalize">{hotel.kind}</div>
                  </div>
                )}
                {stars > 0 && (
                  <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                    <div className="text-[var(--muted)] text-xs mb-1">Stjerner</div>
                    <div className="font-medium text-[var(--deep)]">{stars} av 5</div>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border)] pt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="text-[var(--muted)] text-sm">
                  Klar til å booke? Sjekk live priser og ledige rom.
                </div>
                <Link
                  href={searchUrl}
                  className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                  Finn priser
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={`/hoteller/${land}/${by}`}
              className="text-sm text-[var(--sea)] hover:underline"
            >
              ← Se alle hoteller i {cityName}
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />
    </main>
  )
}
