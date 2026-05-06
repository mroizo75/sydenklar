"use client"

import { useEffect, useRef, useState } from "react"
import { Star, X, MapPin } from "lucide-react"
import { RateHawkHotel } from "@/lib/types"

interface HotelMapProps {
  hotels: RateHawkHotel[]
  onSelectHotel: (hotel: RateHawkHotel) => void
  hoveredHotelId?: string | null
}

const FALLBACK_CENTER: [number, number] = [48.8566, 2.3522]

function getCenter(hotels: RateHawkHotel[]): [number, number] {
  const withCoords = hotels.filter(h => h.lat && h.lng)
  if (withCoords.length === 0) return FALLBACK_CENTER
  const avgLat = withCoords.reduce((s, h) => s + h.lat!, 0) / withCoords.length
  const avgLng = withCoords.reduce((s, h) => s + h.lng!, 0) / withCoords.length
  return [avgLat, avgLng]
}

export default function HotelMap({ hotels, onSelectHotel, hoveredHotelId }: HotelMapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const [selectedHotel, setSelectedHotel] = useState<RateHawkHotel | null>(null)
  const [noCoords, setNoCoords] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // cancelled-flagg håndterer React StrictMode double-invoke:
    // cleanup setter cancelled=true, så en pågående init() avbryter seg selv.
    let cancelled = false
    let localMap: any = null

    const init = async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      // Etter async-import: sjekk om vi ble kansellert eller container er borte
      if (cancelled || !containerRef.current) return

      // Slett evt. stale _leaflet_id som ble igjen fra en avbrutt init
      const container = containerRef.current as any
      if (container._leaflet_id) {
        delete container._leaflet_id
      }

      const hotelsWithCoords = hotels.filter(h => h.lat && h.lng)
      if (hotelsWithCoords.length === 0) {
        setNoCoords(true)
        return
      }

      setNoCoords(false)

      localMap = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      })

      // Kansellert mens vi lagde kartet — fjern med en gang
      if (cancelled) {
        localMap.remove()
        return
      }

      mapRef.current = localMap

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(localMap)

      markersRef.current = new Map()
      hotelsWithCoords.forEach(hotel => {
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
          .addTo(localMap)
          .on("click", () => {
            setSelectedHotel(hotel)
            markersRef.current.forEach(m => {
              const el = m.getElement()?.querySelector(".hotel-pin")
              el?.classList.remove("hotel-pin--active")
            })
            const el = marker.getElement()?.querySelector(".hotel-pin")
            el?.classList.add("hotel-pin--active")
          })

        markersRef.current.set(hotel.id, marker)
      })

      if (hotelsWithCoords.length > 1) {
        const bounds = L.latLngBounds(hotelsWithCoords.map(h => [h.lat!, h.lng!]))
        localMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 })
      } else {
        localMap.setView([hotelsWithCoords[0].lat!, hotelsWithCoords[0].lng!], 13)
      }
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = new Map()
      } else if (localMap) {
        localMap.remove()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Legg til nye markører når hotellisten utvides (load more)
  useEffect(() => {
    if (!mapRef.current) return
    const L = (window as any).L
    if (!L) return

    const newHotels = hotels.filter(h => h.lat && h.lng && !markersRef.current.has(h.id))
    newHotels.forEach(hotel => {
      const priceLabel = hotel.price.amount.toLocaleString("nb-NO")
      const icon = L.divIcon({
        className: "",
        html: `<div class="hotel-pin"><span>${priceLabel}</span></div>`,
        iconSize: [null, null],
        iconAnchor: [0, 0],
      })
      const marker = L.marker([hotel.lat!, hotel.lng!], { icon })
        .addTo(mapRef.current)
        .on("click", () => setSelectedHotel(hotel))
      markersRef.current.set(hotel.id, marker)
    })
  }, [hotels])

  // Lyser opp markøren som svarer til kortet man hover over
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()?.querySelector(".hotel-pin")
      if (!el) return
      if (id === hoveredHotelId) {
        el.classList.add("hotel-pin--hover")
      } else {
        el.classList.remove("hotel-pin--hover")
      }
    })
  }, [hoveredHotelId])

  return (
    <div className="relative w-full h-full">
      <style>{`
        .hotel-pin {
          background: white;
          border: 2px solid #1a2e44;
          border-radius: 20px;
          padding: 4px 9px;
          font-size: 12px;
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
          background: #e8604c;
          color: white;
          border-color: #e8604c;
          z-index: 1000 !important;
          transform: translate(-50%, -100%) scale(1.1);
        }
        .hotel-pin--hover {
          background: #1a2e44;
          color: white;
          border-color: #1a2e44;
          z-index: 900 !important;
          transform: translate(-50%, -100%) scale(1.15);
          box-shadow: 0 4px 16px rgba(26,46,68,0.35);
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
        .hotel-pin--active::after,
        .hotel-pin--hover::after {
          border-top-color: #1a2e44;
        }
        .hotel-pin--active::after {
          border-top-color: #e8604c;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
      `}</style>

      <div ref={containerRef} className="w-full h-full" />

      {noCoords && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--sand-light)]">
          <div className="text-center">
            <MapPin size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--deep)]">Koordinater ikke tilgjengelig</p>
            <p className="text-xs text-[var(--muted)] mt-1">Kartvisning krever koordinater fra API-et</p>
          </div>
        </div>
      )}

      {/* Hotell-popup ved klikk på pin */}
      {selectedHotel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[300px] z-[1000] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]">
          <button
            onClick={() => setSelectedHotel(null)}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <X size={13} />
          </button>

          {selectedHotel.image && !selectedHotel.image.startsWith("data:") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedHotel.image}
              alt={selectedHotel.name}
              className="w-full h-32 object-cover"
            />
          )}

          <div className="p-3.5">
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

            {selectedHotel.distance && (
              <p className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1 truncate">
                <MapPin size={9} className="shrink-0" />
                {selectedHotel.distance}
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-[10px] text-[var(--muted)]">Fra</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-xl text-[var(--deep)]">
                    {selectedHotel.price.amount.toLocaleString("nb-NO")}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">{selectedHotel.price.currency}/natt</span>
                </div>
              </div>
              <button
                onClick={() => { onSelectHotel(selectedHotel); setSelectedHotel(null) }}
                className="bg-[var(--coral)] hover:bg-[var(--deep)] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
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
