import { RateHawkHotel } from "@/lib/types"
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves } from "lucide-react"

interface HotelCardProps {
  hotel: RateHawkHotel
  onSelect: (hotel: RateHawkHotel) => void
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
  }
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "Gratis WiFi": <Wifi size={12} />,
  "WiFi": <Wifi size={12} />,
  "Gratis parkering": <Car size={12} />,
  "Parkering": <Car size={12} />,
  "Restaurant": <UtensilsCrossed size={12} />,
  "Basseng": <Waves size={12} />,
  "Svømmebasseng": <Waves size={12} />,
}

export default function HotelCard({ hotel, onSelect }: HotelCardProps) {
  const nights = hotel.price.nights || 1
  const topAmenities = hotel.amenities.slice(0, 4)
  const hasImage = hotel.image && !hotel.image.startsWith("data:image")

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border border-[var(--border)] card-hover cursor-pointer group"
      onClick={() => onSelect(hotel)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter") onSelect(hotel) }}
      aria-label={`Se detaljer for ${hotel.name}`}
    >
      {/* Bilde */}
      <div className="relative overflow-hidden bg-[var(--sand-light)] aspect-[16/10]">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[var(--muted)] text-sm">Ingen bilde</span>
          </div>
        )}

        {/* Stjerner overlay */}
        {hotel.rating > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
              <Star key={i} size={10} fill="var(--gold)" stroke="none" />
            ))}
          </div>
        )}

        {/* Distance */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
          {hotel.distance}
        </div>
      </div>

      {/* Innhold */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-[var(--deep)] leading-tight line-clamp-2 group-hover:text-[var(--coral)] transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={12} className="text-[var(--muted)] shrink-0" />
              <p className="text-xs text-[var(--muted)] truncate">{hotel.address}</p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-display text-2xl text-[var(--deep)]">
              {hotel.price.amount.toLocaleString("nb-NO")}
            </p>
            <p className="text-xs text-[var(--muted)]">{hotel.price.currency}/natt</p>
            {nights > 1 && (
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {hotel.price.totalPrice?.toLocaleString("nb-NO")} tot.
              </p>
            )}
          </div>
        </div>

        {/* Fasiliteter */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {topAmenities.map(amenity => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--deep)]/70 bg-[var(--sand-light)] px-2.5 py-1 rounded-full"
              >
                {AMENITY_ICONS[amenity] && (
                  <span className="text-[var(--coral)]">{AMENITY_ICONS[amenity]}</span>
                )}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="text-[11px] font-medium text-[var(--sea)] bg-[var(--sea-light)] px-2.5 py-1 rounded-full">
                +{hotel.amenities.length - 4} til
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onSelect(hotel) }}
          className="w-full mt-4 py-3 min-h-[44px] bg-[var(--deep)] hover:bg-[var(--coral)] text-white text-sm font-semibold rounded-xl transition-all"
        >
          Se tilgjengelige rom
        </button>
      </div>
    </article>
  )
}
