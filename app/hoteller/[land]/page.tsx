import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  findCountryBySlug,
  getCitiesByCountry,
  getHotelCount,
  slugify,
} from '@/lib/hotel-static-db'
import { generateDestinationMetadata, buildBreadcrumbSchema, SITE_URL } from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 86400

interface Props {
  params: Promise<{ land: string }>
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
  Dubai: 'Dubai',
  'United Arab Emirates': 'De forente arabiske emirater',
  'United States': 'USA',
  Japan: 'Japan',
  Singapore: 'Singapore',
  Indonesia: 'Indonesia',
  Mexico: 'Mexico',
  Austria: 'Østerrike',
  Netherlands: 'Nederland',
  Hungary: 'Ungarn',
  Denmark: 'Danmark',
  Sweden: 'Sverige',
}

function displayName(countryName: string): string {
  return COUNTRY_DISPLAY[countryName] ?? countryName
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { land } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) return {}

  const display = displayName(countryName)
  return generateDestinationMetadata({
    title: `Hoteller i ${display} – Finn og bestill | Sydenklar`,
    description: `Se alle hoteller i ${display}. Sammenlign priser, les anmeldelser og bestill drømmeoppholdet ditt med Sydenklar.`,
    path: `/hoteller/${land}`,
  })
}

export default async function LandPage({ params }: Props) {
  const { land } = await params
  const countryName = findCountryBySlug(land)
  if (!countryName) notFound()

  const cities = getCitiesByCountry(countryName)
  if (cities.length === 0) notFound()

  const display = displayName(countryName)
  const totalHotels = cities.reduce((s, c) => s + c.count, 0)

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Hjem', url: SITE_URL },
    { name: 'Hoteller', url: `${SITE_URL}/hoteller` },
    { name: display, url: `${SITE_URL}/hoteller/${land}` },
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-[var(--deep)] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/hoteller" className="hover:text-white transition-colors">Hoteller</Link>
            <span>/</span>
            <span className="text-white">{display}</span>
          </nav>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-3">
            Hoteller i {display}
          </h1>
          <p className="text-white/60 text-base">
            {totalHotels.toLocaleString('nb-NO')} hoteller i {cities.length} byer
          </p>
        </div>
      </div>

      <div className="flex-1 bg-[var(--sand-light)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-2">
              Populære byer i {display}
            </h2>
            <p className="text-[var(--muted)] text-sm">
              Velg en by for å se tilgjengelige hoteller og priser
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cities.map(city => (
              <Link
                key={city.city_name}
                href={`/hoteller/${land}/${city.slug}`}
                className="group bg-white rounded-xl border border-[var(--border)] p-4 hover:border-[var(--coral)] hover:shadow-md transition-all"
              >
                <div className="font-medium text-[var(--deep)] group-hover:text-[var(--coral)] transition-colors leading-tight mb-1">
                  {city.city_name}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {city.count.toLocaleString('nb-NO')} hoteller
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href={`/hoteller?destinasjon=${encodeURIComponent(display)}`}
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-8 py-3 rounded-full transition-colors"
            >
              Søk hoteller i {display}
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </main>
  )
}
