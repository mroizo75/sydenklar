'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Star, Tag, Wifi, Waves, UtensilsCrossed } from 'lucide-react'
import DealBookingModal from './hotels/DealBookingModal'

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
  },
]

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Gratis WiFi': <Wifi size={11} />,
  'Basseng': <Waves size={11} />,
  'Restaurant': <UtensilsCrossed size={11} />,
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

function DealCard({ deal, checkIn, checkOut, onOpen }: { deal: Deal; checkIn: string; checkOut: string; onOpen: () => void }) {
  const discountPct = Math.round((1 - deal.pricePerNight / deal.originalPrice) * 100)

  return (
    <button
      onClick={onOpen}
      className="group flex-none w-72 sm:w-80 h-[420px] bg-white rounded-2xl ring-1 ring-[var(--border)] card-hover flex flex-col text-left"
    >
      {/* Bilde – fast høyde */}
      <div className="relative overflow-hidden rounded-t-2xl shrink-0" style={{ height: '200px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deal.image}
          alt={`${deal.hotelName}, ${deal.destination}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-[var(--coral)] text-white px-2 py-1 rounded-full">
            <Tag size={9} />
            Spar {discountPct}%
          </span>
          {deal.badge && (
            <span className="text-[10px] font-semibold bg-[var(--deep)]/80 backdrop-blur-sm text-white px-2 py-1 rounded-full">
              {deal.badge}
            </span>
          )}
        </div>

        {/* Destinasjon */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-full">
            {deal.destination}, {deal.country}
          </span>
        </div>
      </div>

      {/* Innhold – fyller resten */}
      <div className="p-4 flex flex-col flex-1">
        {/* Stjerner */}
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: deal.stars }).map((_, i) => (
            <Star key={i} size={11} fill="var(--gold)" stroke="none" />
          ))}
        </div>

        <h3 className="font-display text-base text-[var(--deep)] leading-snug line-clamp-1 group-hover:text-[var(--coral)] transition-colors">
          {deal.hotelName}
        </h3>

        {/* Fasiliteter */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {deal.amenities.slice(0, 3).map(amenity => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--deep)]/70 bg-[var(--sand-light)] px-2 py-0.5 rounded-full"
            >
              {AMENITY_ICONS[amenity] && (
                <span className="text-[var(--coral)]">{AMENITY_ICONS[amenity]}</span>
              )}
              {amenity}
            </span>
          ))}
        </div>

        {/* Pris – skyves til bunnen */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-[var(--border)]">
          <div>
            <p className="text-[11px] text-[var(--muted)] line-through">
              {deal.originalPrice.toLocaleString('nb-NO')} {deal.currency}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl text-[var(--deep)]">
                {deal.pricePerNight.toLocaleString('nb-NO')}
              </span>
              <span className="text-xs text-[var(--muted)]">{deal.currency}/natt</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[var(--deep)] group-hover:bg-[var(--coral)] flex items-center justify-center transition-colors shrink-0">
            <ArrowRight size={16} className="text-white" />
          </div>
        </div>
      </div>
    </button>
  )
}

const CARD_W = 320 + 20 // sm:w-80 (320px) + gap-5 (20px)

export default function BestDealsSection() {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [formattedDate, setFormattedDate] = useState('')
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { checkIn, checkOut } = getNextWeekendDates()
    setDates({ checkIn, checkOut })
    const d = new Date(checkIn)
    setFormattedDate(d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' }))
  }, [])

  const sync = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? CARD_W : -CARD_W, behavior: 'smooth' })

  return (
    <section className="bg-[var(--sand-light)] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[var(--coral)] text-xs font-semibold uppercase tracking-widest">
              Eksklusive priser
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-[var(--deep)] mt-2">
              Beste tilbud
              <br />
              <em className="italic">akkurat nå</em>
            </h2>
            {formattedDate && (
              <p className="text-sm text-[var(--muted)] mt-2">
                Priser for neste helg · Innsjekk {formattedDate} · 2 netter · 2 gjester
              </p>
            )}
          </div>

          <a
            href="/hoteller"
            className="text-sm font-semibold text-[var(--sea)] hover:text-[var(--deep)] transition-colors flex items-center gap-1.5 shrink-0 animated-link"
          >
            Se alle hoteller
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Karusell */}
        <div className="group/carousel relative">

          {/* Venstre hover-sone */}
          {canLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-20 z-20 flex items-center justify-start pl-2 cursor-pointer"
              onClick={() => scroll('left')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--sand-light)] via-[var(--sand-light)]/60 to-transparent" />
              <button
                aria-label="Forrige"
                className="relative w-11 h-11 rounded-full bg-white shadow-md border border-[var(--border)] flex items-center justify-center text-[var(--deep)] opacity-0 group-hover/carousel:opacity-100 hover:bg-[var(--deep)] hover:text-white transition-all duration-200 translate-x-[-4px] group-hover/carousel:translate-x-0"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}

          {/* Høyre hover-sone */}
          {canRight && (
            <div className="absolute right-0 top-0 bottom-4 w-20 z-20 flex items-center justify-end pr-2 cursor-pointer"
              onClick={() => scroll('right')}
            >
              <div className="absolute inset-0 bg-gradient-to-l from-[var(--sand-light)] via-[var(--sand-light)]/60 to-transparent" />
              <button
                aria-label="Neste"
                className="relative w-11 h-11 rounded-full bg-white shadow-md border border-[var(--border)] flex items-center justify-center text-[var(--deep)] opacity-0 group-hover/carousel:opacity-100 hover:bg-[var(--deep)] hover:text-white transition-all duration-200 translate-x-[4px] group-hover/carousel:translate-x-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {DEALS.map(deal => (
              <div key={deal.id} className="snap-start">
                <DealCard
                  deal={deal}
                  checkIn={dates.checkIn}
                  checkOut={dates.checkOut}
                  onOpen={() => setActiveDeal(deal)}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted)] mt-4 text-center">
          Priser er veiledende og kan variere. Endelig pris bekreftes ved søk.
        </p>
      </div>

      {activeDeal && (
        <DealBookingModal
          deal={activeDeal}
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
          onClose={() => setActiveDeal(null)}
        />
      )}
    </section>
  )
}
