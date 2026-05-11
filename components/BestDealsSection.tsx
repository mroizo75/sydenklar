'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Star, Tag, Wifi, Waves, UtensilsCrossed } from 'lucide-react'

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
    hotelName: 'Lopesan Costa Meloneras Resort',
    destination: 'Gran Canaria',
    country: 'Spania',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    stars: 5,
    pricePerNight: 1390,
    originalPrice: 2190,
    currency: 'NOK',
    amenities: ['All inclusive', 'Basseng', 'Gratis WiFi'],
    destinationId: 'gran-canaria',
    destinationType: 'island',
    badge: 'Nordmenns favoritt',
  },
  {
    id: '2',
    hotelName: 'Aldemar Knossos Royal',
    destination: 'Kreta',
    country: 'Hellas',
    image: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
    stars: 5,
    pricePerNight: 1690,
    originalPrice: 2490,
    currency: 'NOK',
    amenities: ['All inclusive', 'Basseng', 'Strandlinje'],
    destinationId: 'crete',
    destinationType: 'island',
    badge: 'Bestseller',
  },
  {
    id: '3',
    hotelName: 'Iberostar Grand Salomé',
    destination: 'Tenerife',
    country: 'Spania',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    stars: 5,
    pricePerNight: 1890,
    originalPrice: 2690,
    currency: 'NOK',
    amenities: ['All inclusive', 'Basseng', 'Gratis WiFi'],
    destinationId: 'tenerife',
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
    hotelName: 'The Bvlgari Resort Bali',
    destination: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    stars: 5,
    pricePerNight: 2490,
    originalPrice: 3590,
    currency: 'NOK',
    amenities: ['Basseng', 'Havutsikt', 'Gratis WiFi'],
    destinationId: 'bali',
    destinationType: 'island',
    badge: 'Eksotisk drøm',
  },
  {
    id: '6',
    hotelName: 'Thon Hotel Opera',
    destination: 'Oslo',
    country: 'Norge',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    stars: 4,
    pricePerNight: 1090,
    originalPrice: 1590,
    currency: 'NOK',
    amenities: ['Gratis WiFi', 'Restaurant', 'Frokost inkl.'],
    destinationId: 'oslo',
    destinationType: 'city',
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

/** Returnerer neste fredag som ikke er innen 24 timer */
function getNextWeekendDates(): { checkIn: string; checkOut: string; fridayMs: number } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7

  if (daysUntilFriday === 0) {
    // Det er fredag – hopp til neste uke
    daysUntilFriday = 7
  } else {
    // Sjekk om det er under 24 timer til fredag midnatt
    const candidate = new Date(now)
    candidate.setDate(now.getDate() + daysUntilFriday)
    candidate.setHours(0, 0, 0, 0)
    if (candidate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      daysUntilFriday += 7
    }
  }

  const friday = new Date(now)
  friday.setDate(now.getDate() + daysUntilFriday)
  friday.setHours(0, 0, 0, 0)
  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)
  return { checkIn: formatDate(friday), checkOut: formatDate(sunday), fridayMs: friday.getTime() }
}

function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return ''
  const totalSec = Math.floor(msLeft / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  if (days > 1) return `${days} dager`
  if (days === 1) return `${days} dag og ${hours} t`
  if (hours > 0) return `${hours} t ${mins} min`
  return `${mins} min`
}

function buildHotellUrl(deal: Deal, checkIn: string, checkOut: string): string {
  // Sender bare destinasjonsnavn — hoteller-siden slår opp riktig RateHawk-ID via autocomplete
  const params = new URLSearchParams({
    destinasjon: deal.destination,
    checkIn,
    checkOut,
    adults: '2',
    rooms: '1',
  })
  return `/hoteller?${params.toString()}`
}

function DealCard({ deal, checkIn, checkOut }: { deal: Deal; checkIn: string; checkOut: string }) {
  const discountPct = Math.round((1 - deal.pricePerNight / deal.originalPrice) * 100)
  const href = buildHotellUrl(deal, checkIn, checkOut)

  return (
    <Link
      href={href}
      className="group flex-none w-72 sm:w-80 h-[420px] bg-white rounded-2xl ring-1 ring-[var(--border)] card-hover flex flex-col text-left cursor-pointer"
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

      {/* Innhold */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: deal.stars }).map((_, i) => (
            <Star key={i} size={11} fill="var(--gold)" stroke="none" />
          ))}
        </div>

        <h3 className="font-display text-base text-[var(--deep)] leading-snug line-clamp-1 group-hover:text-[var(--coral)] transition-colors">
          {deal.hotelName}
        </h3>

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

        {/* Pris + CTA */}
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
    </Link>
  )
}

const CARD_W = 320 + 20

export default function BestDealsSection() {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [formattedDate, setFormattedDate] = useState('')
  const [countdown, setCountdown] = useState('')
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fridayMsRef = useRef(0)

  const applyDates = (checkIn: string, checkOut: string) => {
    const [inY, inM, inD] = checkIn.split('-').map(Number)
    const [outY, outM, outD] = checkOut.split('-').map(Number)
    const dIn = new Date(inY, inM - 1, inD)
    const dOut = new Date(outY, outM - 1, outD)
    const inStr = dIn.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'long' })
    const outStr = dOut.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'long' })
    setDates({ checkIn, checkOut })
    setFormattedDate(`${inStr} – ${outStr}`)
  }

  useEffect(() => {
    const refresh = () => {
      const { checkIn, checkOut, fridayMs } = getNextWeekendDates()
      fridayMsRef.current = fridayMs
      applyDates(checkIn, checkOut)
    }
    refresh()

    // Oppdater nedtellingen hvert minutt og bytt helg ved behov
    const interval = setInterval(() => {
      const msLeft = fridayMsRef.current - Date.now()
      if (msLeft < 24 * 60 * 60 * 1000) {
        // Nå under 24 timer – hent nye datoer (neste helg)
        refresh()
      } else {
        setCountdown(formatCountdown(msLeft))
      }
    }, 60_000)

    // Sett første verdi umiddelbart
    setTimeout(() => {
      const msLeft = fridayMsRef.current - Date.now()
      setCountdown(formatCountdown(msLeft))
    }, 0)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-sm text-[var(--muted)]">
                  Neste helg · {formattedDate} · 2 gjester
                </p>
                {countdown && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--coral)] bg-[var(--coral)]/10 border border-[var(--coral)]/20 px-2.5 py-1 rounded-full">
                    <Clock size={10} />
                    Tilbudet utløper om {countdown}
                  </span>
                )}
              </div>
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
                />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted)] mt-4 text-center">
          Priser er veiledende og kan variere. Endelig pris bekreftes ved søk.
        </p>
      </div>
    </section>
  )
}
