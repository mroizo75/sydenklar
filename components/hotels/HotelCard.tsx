import Link from "next/link"
import { RateHawkHotel } from "@/lib/types"
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves, Coffee, Dumbbell, Sparkles, Wind, ShieldCheck } from "lucide-react"

interface HotelCardProps {
  hotel: RateHawkHotel
  onSelect: (hotel: RateHawkHotel) => void
  onHover?: (id: string | null) => void
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
  }
  variant?: "vertical" | "horizontal"
}

const AMENITY_META: Record<string, { icon: React.ReactNode; label: string }> = {
  "Gratis WiFi":          { icon: <Wifi size={12} />,          label: "Gratis WiFi" },
  "WiFi":                 { icon: <Wifi size={12} />,          label: "WiFi" },
  "Gratis parkering":     { icon: <Car size={12} />,           label: "Gratis parkering" },
  "Parkering":            { icon: <Car size={12} />,           label: "Parkering" },
  "Restaurant":           { icon: <UtensilsCrossed size={12} />, label: "Restaurant" },
  "Basseng":              { icon: <Waves size={12} />,         label: "Basseng" },
  "Svømmebasseng":        { icon: <Waves size={12} />,         label: "Svømmebasseng" },
  "Utendørs basseng":     { icon: <Waves size={12} />,         label: "Utendørs basseng" },
  "Innendørs basseng":    { icon: <Waves size={12} />,         label: "Innendørs basseng" },
  "Frokost inkludert":    { icon: <Coffee size={12} />,        label: "Frokost inkludert" },
  "Frokostbuffet":        { icon: <Coffee size={12} />,        label: "Frokostbuffet" },
  "Frokost":              { icon: <Coffee size={12} />,        label: "Frokost" },
  "Alt inkludert":        { icon: <Coffee size={12} />,        label: "Alt inkludert" },
  "Treningssenter":       { icon: <Dumbbell size={12} />,      label: "Treningssenter" },
  "Spa":                  { icon: <Sparkles size={12} />,      label: "Spa" },
  "Aircondition":         { icon: <Wind size={12} />,          label: "Aircondition" },
}

function getAmenityMeta(name: string) {
  return AMENITY_META[name] ?? { icon: null, label: name }
}

function StarRow({ rating }: { rating: number }) {
  if (!rating) return null
  const full = Math.floor(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < full ? "var(--gold)" : "transparent"}
          stroke={i < full ? "none" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function hotelInfoUrl(hotel: RateHawkHotel, sp: { checkIn: string; checkOut: string; adults: number }): string {
  const p = new URLSearchParams({ checkIn: sp.checkIn, checkOut: sp.checkOut, adults: String(sp.adults) })
  if (hotel.hid) p.set("hid", String(hotel.hid))
  return `/hotell/${encodeURIComponent(hotel.id)}?${p.toString()}`
}

// ─── Horizontal (desktop split-panel) ────────────────────────────────────────
function HorizontalCard({ hotel, onSelect, onHover, searchParams }: { hotel: RateHawkHotel; onSelect: (h: RateHawkHotel) => void; onHover?: (id: string | null) => void; searchParams: { checkIn: string; checkOut: string; adults: number; children: number[] } }) {
  const hasImage = hotel.image && !hotel.image.startsWith("data:image")
  const nights = hotel.price.nights || 1
  const shownAmenities = hotel.amenities.slice(0, 6)
  const extraCount = hotel.amenities.length - shownAmenities.length

  return (
    <article
      className="bg-white rounded-xl border border-[var(--border)] hover:border-[var(--deep)]/25 hover:shadow-lg transition-all cursor-pointer group flex overflow-hidden"
      style={{ minHeight: 140 }}
      onClick={() => onSelect(hotel)}
      onMouseEnter={() => onHover?.(hotel.id)}
      onMouseLeave={() => onHover?.(null)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter") onSelect(hotel) }}
      aria-label={`Se detaljer for ${hotel.name}`}
    >
      {/* ── Bilde ── */}
      <div className="relative w-[150px] shrink-0 bg-[var(--sand-light)] overflow-hidden">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[var(--muted)] text-xs text-center px-2">Ingen bilde</span>
          </div>
        )}
        {hotel.rating > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-2 px-2 flex justify-center">
            <div className="flex gap-0.5">
              {Array.from({ length: Math.round(hotel.rating) }).map((_, i) => (
                <Star key={i} size={8} fill="var(--gold)" stroke="none" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Hotellinfo (midtre, fleksibel) ── */}
      <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[14px] leading-snug text-[var(--deep)] line-clamp-2 group-hover:text-[var(--coral)] transition-colors">
            {hotel.name}
          </h3>

          {hotel.address && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} className="text-[var(--muted)] shrink-0" />
              <p className="text-[11px] text-[var(--muted)] truncate">{hotel.address}</p>
            </div>
          )}

          {hotel.distance && hotel.distance !== "Se kart" && (
            <p className="text-[11px] text-[var(--sea)] font-medium mt-0.5">{hotel.distance}</p>
          )}
        </div>

        {/* Fasiliteter */}
        {shownAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {shownAmenities.map(amenity => {
              const meta = getAmenityMeta(amenity)
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--deep)]/80 bg-[var(--sand-light)] border border-[var(--border)] px-2 py-0.5 rounded-full"
                >
                  {meta.icon && <span className="text-[var(--coral)]">{meta.icon}</span>}
                  {meta.label}
                </span>
              )
            })}
            {extraCount > 0 && (
              <span className="text-[10px] font-medium text-[var(--sea)] bg-[var(--sea-light,#e8f4ff)] px-2 py-0.5 rounded-full border border-[var(--sea)]/20">
                +{extraCount} til
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Priskolonne (fast bredde) ── */}
      <div
        className="w-[148px] shrink-0 flex flex-col items-end justify-between px-4 py-3 bg-[var(--sand-light)]/50 border-l border-[var(--border)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-right">
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">Fra</p>
          <p className="font-display text-[22px] leading-none text-[var(--deep)] mt-0.5">
            {hotel.price.amount.toLocaleString("nb-NO")}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">
            {hotel.price.currency} / natt
          </p>
          {nights > 1 && hotel.price.totalPrice && (
            <p className="text-[10px] text-[var(--muted)] mt-0.5 font-medium">
              {hotel.price.totalPrice.toLocaleString("nb-NO")} kr totalt
            </p>
          )}
        </div>

        {hotel.freeCancellation && (
          <div className="flex items-center gap-1 mt-2.5">
            <ShieldCheck size={11} className="text-green-600 shrink-0" />
            <span className="text-[10px] font-medium text-green-700">Gratis avbestilling</span>
          </div>
        )}
        <button
          onClick={() => onSelect(hotel)}
          className="w-full mt-3 py-2.5 bg-[var(--coral)] hover:bg-[var(--deep)] text-white text-[12px] font-bold rounded-xl transition-all hover:shadow-md"
        >
          Vis tilbud
        </button>
        <Link
          href={hotelInfoUrl(hotel, searchParams)}
          onClick={e => e.stopPropagation()}
          className="block w-full mt-2 py-2 text-center text-[11px] font-medium text-[var(--sea)] hover:text-[var(--deep)] hover:underline transition-colors"
        >
          Se hotellet →
        </Link>
      </div>
    </article>
  )
}

// ─── Vertikal (mobil / grid) ─────────────────────────────────────────────────
function VerticalCard({ hotel, onSelect, onHover, searchParams }: { hotel: RateHawkHotel; onSelect: (h: RateHawkHotel) => void; onHover?: (id: string | null) => void; searchParams: { checkIn: string; checkOut: string; adults: number; children: number[] } }) {
  const hasImage = hotel.image && !hotel.image.startsWith("data:image")
  const nights = hotel.price.nights || 1
  const shownAmenities = hotel.amenities.slice(0, 5)
  const extraCount = hotel.amenities.length - shownAmenities.length

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border border-[var(--border)] card-hover cursor-pointer group"
      onClick={() => onSelect(hotel)}
      onMouseEnter={() => onHover?.(hotel.id)}
      onMouseLeave={() => onHover?.(null)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter") onSelect(hotel) }}
      aria-label={`Se detaljer for ${hotel.name}`}
    >
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

        {hotel.rating > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <StarRow rating={hotel.rating} />
          </div>
        )}

        {hotel.distance && hotel.distance !== "Se kart" && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
            {hotel.distance}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-base text-[var(--deep)] leading-tight line-clamp-2 group-hover:text-[var(--coral)] transition-colors">
          {hotel.name}
        </h3>

        {hotel.address && (
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={11} className="text-[var(--muted)] shrink-0" />
            <p className="text-xs text-[var(--muted)] truncate">{hotel.address}</p>
          </div>
        )}

        {shownAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {shownAmenities.map(amenity => {
              const meta = getAmenityMeta(amenity)
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--deep)]/80 bg-[var(--sand-light)] border border-[var(--border)] px-2 py-0.5 rounded-full"
                >
                  {meta.icon && <span className="text-[var(--coral)]">{meta.icon}</span>}
                  {meta.label}
                </span>
              )
            })}
            {extraCount > 0 && (
              <span className="text-[10px] font-medium text-[var(--sea)] bg-[var(--sea-light,#e8f4ff)] px-2 py-0.5 rounded-full border border-[var(--sea)]/20">
                +{extraCount} til
              </span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between mt-4 pt-3 border-t border-[var(--border)]">
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">Fra</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl text-[var(--deep)]">
                {hotel.price.amount.toLocaleString("nb-NO")}
              </span>
              <span className="text-xs text-[var(--muted)]">{hotel.price.currency}/natt</span>
            </div>
            {nights > 1 && hotel.price.totalPrice && (
              <p className="text-xs text-[var(--muted)]">
                {hotel.price.totalPrice.toLocaleString("nb-NO")} kr totalt
              </p>
            )}
            {hotel.freeCancellation && (
              <div className="flex items-center gap-1 mt-1.5">
                <ShieldCheck size={11} className="text-green-600 shrink-0" />
                <span className="text-[10px] font-medium text-green-700">Gratis avbestilling</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); onSelect(hotel) }}
              className="bg-[var(--coral)] hover:bg-[var(--deep)] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              Vis tilbud
            </button>

            <Link
              href={hotelInfoUrl(hotel, searchParams)}
              onClick={e => e.stopPropagation()}
              className="text-[11px] font-medium text-[var(--sea)] hover:text-[var(--deep)] hover:underline transition-colors whitespace-nowrap"
            >
              Se hotellet →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export default function HotelCard({ hotel, onSelect, onHover, searchParams, variant = "vertical" }: HotelCardProps) {
  if (variant === "horizontal") {
    return <HorizontalCard hotel={hotel} onSelect={onSelect} onHover={onHover} searchParams={searchParams} />
  }
  return <VerticalCard hotel={hotel} onSelect={onSelect} onHover={onHover} searchParams={searchParams} />
}
