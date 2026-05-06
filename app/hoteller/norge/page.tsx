import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCitiesByCountry, getHotelCount } from '@/lib/hotel-static-db'
import { generateDestinationMetadata, buildBreadcrumbSchema, SITE_URL } from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 86400

export const metadata: Metadata = generateDestinationMetadata({
  title: 'Hoteller i Norge – Finn og bestill norske hoteller | Sydenklar',
  description:
    'Se og bestill hoteller i hele Norge. Fra hoteller i Oslo, Bergen, Tromsø og Stavanger til sjarmerende overnatting langs fjordene – finn de beste prisene med Sydenklar.',
  path: '/hoteller/norge',
})

const FEATURED_CITIES = [
  'Oslo', 'Bergen', 'Tromsø', 'Stavanger', 'Trondheim',
  'Ålesund', 'Kristiansand', 'Bodø', 'Lillehammer', 'Molde',
]

const CITY_DESCRIPTIONS: Record<string, string> = {
  Oslo: 'Norges pulserende hovedstad med verdensklasse restauranter, museer og byliv.',
  Bergen: 'Hansabyen ved fjordene — fargerike trehus og porten til de norske fjordene.',
  Tromsø: 'Arktisk by med nordlys om vinteren og midnattsol om sommeren.',
  Stavanger: 'Oljehovedstaden med vakre strender og nærhet til Preikestolen.',
  Trondheim: 'Historisk by med Nidarosdomen og et levende studentliv.',
  Ålesund: 'Jugendstilbyen ved havet — kjent for sin unike arkitektur og fiskerikjøkken.',
}

export default function NorgePage() {
  const cities = getCitiesByCountry('Norway')
  const totalHotels = cities.reduce((s, c) => s + c.count, 0)

  const featuredCities = FEATURED_CITIES
    .map(name => cities.find(c => c.city_name === name))
    .filter(Boolean) as typeof cities

  const otherCities = cities.filter(
    c => !FEATURED_CITIES.includes(c.city_name)
  )

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Hjem', url: SITE_URL },
    { name: 'Hoteller', url: `${SITE_URL}/hoteller` },
    { name: 'Norge', url: `${SITE_URL}/hoteller/norge` },
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-[var(--deep)] pt-20 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/hoteller" className="hover:text-white transition-colors">Hoteller</Link>
            <span>/</span>
            <span className="text-white">Norge</span>
          </nav>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">
            Hoteller i Norge
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            {totalHotels > 0
              ? `${totalHotels.toLocaleString('nb-NO')} norske hoteller i ${cities.length} byer og steder`
              : 'Finn de beste hotellene i hele Norge — fra storby til fjord'}
          </p>
        </div>
      </div>

      <div className="bg-[var(--sand)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-[var(--deep)] mb-6">
            Populære norske reisemål
          </h2>

          {featuredCities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {featuredCities.map(city => (
                <Link
                  key={city.city_name}
                  href={`/hoteller/norge/${city.slug}`}
                  className="group bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--coral)] hover:shadow-md transition-all"
                >
                  <div className="font-display text-xl text-[var(--deep)] group-hover:text-[var(--coral)] transition-colors mb-1">
                    {city.city_name}
                  </div>
                  <div className="text-xs text-[var(--muted)] mb-2">
                    {city.count.toLocaleString('nb-NO')} hoteller
                  </div>
                  {CITY_DESCRIPTIONS[city.city_name] && (
                    <p className="text-sm text-[var(--muted)] leading-snug line-clamp-2">
                      {CITY_DESCRIPTIONS[city.city_name]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURED_CITIES.map(cityName => (
                <Link
                  key={cityName}
                  href={`/hoteller?destinasjon=${encodeURIComponent(cityName)}`}
                  className="group bg-white rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--coral)] hover:shadow-md transition-all"
                >
                  <div className="font-display text-xl text-[var(--deep)] group-hover:text-[var(--coral)] transition-colors mb-1">
                    {cityName}
                  </div>
                  {CITY_DESCRIPTIONS[cityName] && (
                    <p className="text-sm text-[var(--muted)] leading-snug line-clamp-2">
                      {CITY_DESCRIPTIONS[cityName]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {otherCities.length > 0 && (
        <div className="bg-[var(--sand-light)] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-6">
              Flere norske byer og steder
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {otherCities.slice(0, 60).map(city => (
                <Link
                  key={city.city_name}
                  href={`/hoteller/norge/${city.slug}`}
                  className="group bg-white rounded-xl border border-[var(--border)] p-3 hover:border-[var(--coral)] hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-medium text-[var(--deep)] group-hover:text-[var(--coral)] transition-colors leading-tight truncate">
                    {city.city_name}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-0.5">
                    {city.count} hoteller
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--deep)] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl text-white mb-4">
            Klar til å søke?
          </h2>
          <p className="text-white/60 mb-8">
            Søk med datoer og se live priser på norske hoteller
          </p>
          <Link
            href="/hoteller?destinasjon=Norge"
            className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-10 py-4 rounded-full transition-colors text-base"
          >
            Søk norske hoteller
          </Link>
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
