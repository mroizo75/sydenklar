'use client'

import { useState } from 'react'
import { Star, Wifi, Waves, UtensilsCrossed, Tag } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DealBookingModal from '@/components/hotels/DealBookingModal'

interface Deal {
  id: string
  hotelName: string
  destination: string
  country: string
  image: string
  stars: number
  pricePerNight: number
  originalPrice: number
  currency: string
  amenities: string[]
  destinationId: string
  destinationType: string
  badge?: string
  description?: string
}

const DEALS: Deal[] = [
  {
    id: '1',
    hotelName: 'Hotel Arts Barcelona',
    destination: 'Barcelona',
    country: 'Spania',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    stars: 5,
    pricePerNight: 1490,
    originalPrice: 2390,
    currency: 'NOK',
    amenities: ['Basseng', 'Gratis WiFi', 'Restaurant'],
    destinationId: 'barcelona',
    destinationType: 'city',
    badge: 'Bestseller',
    description: 'Ikonisk luksushotell midt i hjertet av Barcelona med utsikt over Middelhavet.',
  },
  {
    id: '2',
    hotelName: 'NH Collection Roma Fori Imperiali',
    destination: 'Roma',
    country: 'Italia',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    stars: 4,
    pricePerNight: 1190,
    originalPrice: 1750,
    currency: 'NOK',
    amenities: ['Gratis WiFi', 'Restaurant', 'Frokost inkl.'],
    destinationId: 'rome',
    destinationType: 'city',
    badge: 'Siste ledige rom',
    description: 'Klassisk byhotell med utsikt mot Forum Romanum og gangavstand til Colosseum.',
  },
  {
    id: '3',
    hotelName: 'Canaves Oia Boutique Hotel',
    destination: 'Santorini',
    country: 'Hellas',
    image: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
    stars: 5,
    pricePerNight: 2890,
    originalPrice: 3990,
    currency: 'NOK',
    amenities: ['Basseng', 'Havutsikt', 'Gratis WiFi'],
    destinationId: 'santorini',
    destinationType: 'island',
    description: 'Boutiquehotell med uendelig havutsikt over den vulkanske kalderaen i Oia.',
  },
  {
    id: '4',
    hotelName: 'Atlantis The Palm Dubai',
    destination: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    stars: 5,
    pricePerNight: 2190,
    originalPrice: 3290,
    currency: 'NOK',
    amenities: ['Basseng', 'Gratis WiFi', 'Badeanlegg'],
    destinationId: 'dubai',
    destinationType: 'city',
    badge: 'Populær',
    description: 'Legendarisk resort på The Palm med Aquaventure Waterpark og private strender.',
  },
  {
    id: '5',
    hotelName: 'Iberostar Grand Salomé',
    destination: 'Tenerife',
    country: 'Spania',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    stars: 5,
    pricePerNight: 1890,
    originalPrice: 2690,
    currency: 'NOK',
    amenities: ['All inclusive', 'Basseng', 'Gratis WiFi'],
    destinationId: 'tenerife',
    destinationType: 'island',
    description: 'Eksklusivt adults-only resort med all inclusive og spektakulær havutsikt.',
  },
  {
    id: '6',
    hotelName: 'Hotel Brummell',
    destination: 'Mallorca',
    country: 'Spania',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    stars: 4,
    pricePerNight: 1290,
    originalPrice: 1890,
    currency: 'NOK',
    amenities: ['Basseng', 'Gratis WiFi', 'Parkering'],
    destinationId: 'mallorca',
    destinationType: 'island',
    description: 'Designhotell med rooftop-basseng og fantastisk utsikt over Palma de Mallorca.',
  },
  {
    id: '7',
    hotelName: 'Le Bristol Paris',
    destination: 'Paris',
    country: 'Frankrike',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    stars: 5,
    pricePerNight: 3490,
    originalPrice: 4990,
    currency: 'NOK',
    amenities: ['Basseng', 'Gratis WiFi', 'Restaurant'],
    destinationId: 'paris',
    destinationType: 'city',
    badge: 'Luksus',
    description: 'Et av Europas mest prestisjefylte palace-hotell, rett ved Champs-Élysées.',
  },
  {
    id: '8',
    hotelName: 'Four Seasons Resort Bali',
    destination: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    stars: 5,
    pricePerNight: 2490,
    originalPrice: 3690,
    currency: 'NOK',
    amenities: ['Basseng', 'Spa', 'Gratis WiFi'],
    destinationId: 'bali',
    destinationType: 'island',
    description: 'Tropisk paradis med private bassengvillaer og autentisk balinessisk arkitektur.',
  },
]

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Gratis WiFi': <Wifi size={12} />,
  'Basseng': <Waves size={12} />,
  'Restaurant': <UtensilsCrossed size={12} />,
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getNextWeekendDates(): { checkIn: string; checkOut: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
  const friday = new Date(now)
  friday.setDate(now.getDate() + daysUntilFriday)
  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)
  return { checkIn: formatDate(friday), checkOut: formatDate(sunday) }
}

export default function TilbudPage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const { checkIn, checkOut } = getNextWeekendDates()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--sand-light)]">

        {/* Hero */}
        <div className="bg-[var(--deep)] pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 text-[var(--coral)] text-xs font-semibold uppercase tracking-widest mb-4">
              <Tag size={13} />
              Eksklusive tilbud
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
              Beste priser,{' '}
              <em className="italic text-[var(--sand)]">utvalgte hoteller</em>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Håndplukkede tilbud på noen av verdens beste hoteller — til priser du ikke finner andre steder.
            </p>
          </div>
        </div>

        {/* Deals grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {DEALS.map(deal => {
              const discountPct = Math.round((1 - deal.pricePerNight / deal.originalPrice) * 100)
              return (
                <button
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal)}
                  className="group bg-white rounded-2xl ring-1 ring-[var(--border)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: '200px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={deal.image}
                      alt={`${deal.hotelName}, ${deal.destination}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Discount badge */}
                    <div className="absolute top-3 left-3 bg-[var(--coral)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{discountPct}%
                    </div>

                    {/* Custom badge */}
                    {deal.badge && (
                      <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
                        {deal.badge}
                      </div>
                    )}

                    {/* Stars */}
                    <div className="absolute bottom-3 left-3 flex gap-0.5">
                      {Array.from({ length: deal.stars }).map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-[var(--muted)] mb-1">{deal.destination}, {deal.country}</p>
                    <h3 className="font-semibold text-[var(--deep)] text-sm leading-snug mb-2 line-clamp-2">
                      {deal.hotelName}
                    </h3>

                    {deal.description && (
                      <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2 leading-relaxed">
                        {deal.description}
                      </p>
                    )}

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {deal.amenities.slice(0, 3).map(amenity => (
                        <span
                          key={amenity}
                          className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--sand-light)] text-[var(--muted)] px-2 py-1 rounded-full"
                        >
                          {AMENITY_ICONS[amenity] ?? null}
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between border-t border-[var(--border)] pt-3">
                      <div>
                        <p className="text-xs text-[var(--muted)] line-through mb-0.5">
                          {deal.originalPrice.toLocaleString('nb-NO')} kr
                        </p>
                        <p className="font-display text-xl text-[var(--deep)]">
                          {deal.pricePerNight.toLocaleString('nb-NO')} kr
                        </p>
                        <p className="text-[10px] text-[var(--muted)]">per natt</p>
                      </div>
                      <span className="text-xs font-semibold text-[var(--coral)] bg-[var(--coral)]/10 px-3 py-1.5 rounded-xl">
                        Se tilbud →
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Info box */}
          <div className="mt-12 bg-white rounded-2xl border border-[var(--border)] p-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-[var(--coral)]/10 flex items-center justify-center shrink-0">
              <Tag size={18} className="text-[var(--coral)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--deep)] mb-1">Om prisene</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Prisene er per natt basert på neste tilgjengelige helg. Endelig pris avhenger av valgte datoer og rom. Tilbud gjelder så lenge det er ledig kapasitet.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {selectedDeal && (
        <DealBookingModal
          deal={selectedDeal}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </>
  )
}
