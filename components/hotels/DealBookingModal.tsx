'use client'

import { useEffect, useState } from 'react'
import { X, Star, MapPin, Loader2, AlertCircle } from 'lucide-react'
import HotelDetailModal from './HotelDetailModal'
import HotelBookingModal from './HotelBookingModal'
import HotelCard from './HotelCard'
import { RateHawkHotel } from '@/lib/types'

interface Deal {
  hotelName: string
  destination: string
  country: string
  image: string
  stars: number
  pricePerNight: number
  originalPrice: number
  currency: string
  amenities: string[]
}

interface DealBookingModalProps {
  deal: Deal
  checkIn: string
  checkOut: string
  onClose: () => void
}

export default function DealBookingModal({ deal, checkIn, checkOut, onClose }: DealBookingModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hotels, setHotels] = useState<RateHawkHotel[]>([])
  const [searchId, setSearchId] = useState('')
  const [selectedHotel, setSelectedHotel] = useState<RateHawkHotel | null>(null)
  const [bookingRoom, setBookingRoom] = useState<any>(null)
  const [bookingHotel, setBookingHotel] = useState<any>(null)

  const searchParams = {
    checkIn,
    checkOut,
    adults: 2,
    children: [] as number[],
    roomConfigs: [{ adults: 2, childAges: [] }],
    currency: 'NOK',
  }

  useEffect(() => {
    async function search() {
      setLoading(true)
      setError('')
      try {
        // Hent destinasjons-ID via autocomplete
        const destRes = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(deal.destination)}`)
        const destData = await destRes.json()
        const dest = destData.destinations?.[0]
        if (!dest?.id) {
          setError(`Fant ingen resultater for ${deal.destination}.`)
          setLoading(false)
          return
        }

        // Søk etter hoteller
        const res = await fetch('/api/hotels/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: dest.id,
            destinationType: dest.type || 'region',
            checkIn,
            checkOut,
            adults: 2,
            children: [],
            rooms: 1,
            roomConfigs: [{ adults: 2, childAges: [] }],
            currency: 'NOK',
            residency: 'no',
          }),
        })
        const data = await res.json()
        if (data.success && data.hotels?.length > 0) {
          setHotels(data.hotels)
          setSearchId(data.searchId || '')
        } else {
          setError(data.error || 'Ingen hoteller funnet.')
        }
      } catch {
        setError('Kunne ikke koble til. Prøv igjen.')
      } finally {
        setLoading(false)
      }
    }
    search()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Detaljvisning for valgt hotell
  if (selectedHotel && !bookingRoom) {
    return (
      <HotelDetailModal
        hotelId={selectedHotel.id}
        hid={selectedHotel.hid}
        hotelName={selectedHotel.name}
        searchParams={searchParams}
        onClose={() => setSelectedHotel(null)}
        onBook={(room, hotel) => {
          setBookingRoom(room)
          setBookingHotel(hotel)
        }}
      />
    )
  }

  if (bookingRoom && bookingHotel) {
    return (
      <HotelBookingModal
        hotel={bookingHotel}
        room={bookingRoom}
        searchParams={searchParams}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.image}
            alt={deal.destination}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {Array.from({ length: deal.stars }).map((_, i) => (
                <Star key={i} size={10} fill="var(--gold)" stroke="none" />
              ))}
            </div>
            <p className="font-semibold text-sm text-[var(--deep)] truncate">{deal.hotelName}</p>
            <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <MapPin size={11} />
              {deal.destination}, {deal.country} · {checkIn} – {checkOut}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--deep)] hover:border-[var(--deep)] transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Innhold */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 size={32} className="animate-spin text-[var(--coral)]" />
              <p className="text-sm font-medium text-[var(--deep)]">
                Søker etter hoteller i {deal.destination}…
              </p>
              <p className="text-xs text-[var(--muted)]">{checkIn} – {checkOut} · 2 gjester</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <AlertCircle size={32} className="text-[var(--muted)]" />
              <p className="text-sm text-[var(--muted)]">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[var(--deep)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors"
              >
                Lukk
              </button>
            </div>
          )}

          {!loading && hotels.length > 0 && (
            <>
              <p className="text-xs text-[var(--muted)] mb-4">
                {hotels.length} hoteller funnet i {deal.destination}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hotels.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={h => setSelectedHotel(h)}
                    searchParams={{ checkIn, checkOut, adults: 2, children: [] }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
