"use client"

import { useEffect, useRef, useState } from "react"
import { Star, X, MapPin } from "lucide-react"
import { RateHawkHotel } from "@/lib/types"

interface HotelMapProps {
  hotels: RateHawkHotel[]
  onSelectHotel: (hotel: RateHawkHotel) => void
}

// Fallback senterpunkt brukt når ingen hoteller har koordinater
const FALLBACK_CENTER: [number, number] = [48.8566, 2.3522]

function getCenter(hotels: RateHawkHotel[]): [number, number] {
  const withCoords = hotels.filter(h => h.lat && h.lng)
  if (withCoords.length === 0) return FALLBACK_CENTER
  const avgLat = withCoords.reduce((s, h) => s + h.lat!, 0) / withCoords.length
  const avgLng = withCoords.reduce((s, h) => s + h.lng!, 0) / withCoords.length
  return [avgLat, avgLng]
}

export default function HotelMap({ hotels, onSelectHotel }: HotelMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const [selectedHotel, setSelectedHotel] = useState<RateHawkHotel | null>(null)
  const [noCoords, setNoCoords] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    let L: any
    let map: any

    const init = async () => {
      L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      const hotelsWithCoords = hotels.filter(h => h.lat && h.lng)
      if (hotelsWithCoords.length === 0) {
        setNoCoords(true)
        return
      }

      const center = getCenter(hotelsWithCoords)
      map = L.map(containerRef.current!, { zoomControl: true, scrollWheelZoom: true })
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.setView(center, 13)

      markersRef.current = hotelsWithCoords.map(hotel => {
        const priceLabel = hotel.price.amount.toLocaleString("nb-NO")
        const icon = L.divIcon({
          className: "",
          html: `<div class="hotel-pin" data-id="${hotel.id}">
            <span>${priceLabel}</span>
          </div>`,
          iconSize: [null as any, null as any],
          iconAnchor: [0, 0],
        })

        const marker = L.marker([hotel.lat!, hotel.lng!], { icon })
          .addTo(map)
          .on("click", () => {
            setSelectedHotel(hotel)
            // Reset alle, aktiver valgt
            markersRef.current.forEach(m => {
              const el = m.getElement()?.querySelector(".hotel-pin")
              el?.classList.remove("hotel-pin--active")
            })
            const el = marker.getElement()?.querySelector(".hotel-pin")
            el?.classList.add("hotel-pin--active")
          })

        return marker
      })

      // Fit bounds
      if (hotelsWithCoords.length > 1) {
        const bounds = L.latLngBounds(hotelsWithCoords.map(h => [h.lat!, h.lng!]))
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
      }
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = []
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Oppdater markører når hotellisten endres (ved load more)
  useEffect(() => {
    if (!mapRef.current) return
    const L = (window as any).L
    if (!L) return

    const existingIds = new Set(markersRef.current.map((m: any) => m.options?.hotelId))
    const newHotels = hotels.filter(h => h.lat && h.lng && !existingIds.has(h.id))
    newHotels.forEach(hotel => {
      const priceLabel = hotel.price.amount.toLocaleString("nb-NO")
      const icon = L.divIcon({
        className: "",
        html: `<div class="hotel-pin"><span>${priceLabel}</span></div>`,
        iconSize: [null, null],
        iconAnchor: [0, 0],
      })
      const marker = L.marker([hotel.lat!, hotel.lng!], { icon, hotelId: hotel.id })
        .addTo(mapRef.current)
        .on("click", () => setSelectedHotel(hotel))
      markersRef.current.push(marker)
    })
  }, [hotels])

  return (
    <div className="relative w-full h-full">
      {/* Leaflet CSS injiseres via JS (leaflet/dist/leaflet.css) */}
      <style>{`
        .hotel-pin {
          background: white;
          border: 2px solid #1a2e44;
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1a2e44;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          transition: all 0.15s;
          position: relative;
          transform: translate(-50%, -100%);
        }
        .hotel-pin:hover,
        .hotel-pin--active {
          background: #1a2e44;
          color: white;
          border-color: #1a2e44;
          z-index: 1000 !important;
          transform: translate(-50%, -100%) scale(1.08);
        }
        .hotel-pin::after {
          content: "";
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #1a2e44;
        }
        .hotel-pin--active::after {
          border-top-color: #1a2e44;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
      `}</style>

      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Ingen koordinater */}
      {noCoords && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--sand-light)] rounded-2xl">
          <div className="text-center">
            <MapPin size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--deep)]">Koordinater ikke tilgjengelig</p>
            <p className="text-xs text-[var(--muted)] mt-1">Kartvisning krever koordinater fra API-et</p>
          </div>
        </div>
      )}

      {/* Hotell-popup ved valgt markør */}
      {selectedHotel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[320px] z-[1000] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]">
          <button
            onClick={() => setSelectedHotel(null)}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <X size={13} />
          </button>

          {/* Bilde */}
          {selectedHotel.image && !selectedHotel.image.startsWith("data:") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedHotel.image}
              alt={selectedHotel.name}
              className="w-full h-36 object-cover"
            />
          )}

          <div className="p-4">
            {/* Stjerner */}
            {selectedHotel.rating > 0 && (
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: Math.round(selectedHotel.rating) }).map((_, i) => (
                  <Star key={i} size={10} fill="var(--gold)" stroke="none" />
                ))}
              </div>
            )}

            <h3 className="font-display text-sm text-[var(--deep)] leading-snug line-clamp-2">
              {selectedHotel.name}
            </h3>

            <p className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1 truncate">
              <MapPin size={10} className="shrink-0" />
              {selectedHotel.distance}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="font-display text-xl text-[var(--deep)]">
                  {selectedHotel.price.amount.toLocaleString("nb-NO")}
                </span>
                <span className="text-xs text-[var(--muted)] ml-1">{selectedHotel.price.currency}/natt</span>
              </div>
              <button
                onClick={() => { onSelectHotel(selectedHotel); setSelectedHotel(null) }}
                className="bg-[var(--deep)] hover:bg-[var(--coral)] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Se rom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
