"use client"

import { useState, useEffect } from "react"
import { X, Star, MapPin, ChevronLeft, ChevronRight, Clock, Wifi, Car, Waves, Dumbbell, UtensilsCrossed, Check, Images } from "lucide-react"
import { applyMarkup } from "@/lib/pricing"

interface TaxEntry {
  name: string
  amount: string
  currency_code: string
  included_by_supplier: boolean
}

interface Room {
  book_hash: string
  room_name: string
  rg_ext?: any
  meal_data: any
  daily_prices: any[]
  payment_options: any
  cancellation_penalties: any
  tax_data: { taxes?: TaxEntry[] } | null
  amenities: string[]
  allotment: number
  capacity: number
  size_sqm: number | null
  view: string | null
  bathroom_desc: string | null
  bedding_desc: string | null
  images: string[]
}

interface HotelDetail {
  id: string
  hid?: number
  name: string
  address: string
  image: string
  images: string[]
  star_rating: number
  amenity_groups: any[]
  description: any
  check_in_time: string | null
  check_out_time: string | null
  rooms: Room[]
  total_rooms: number
}

interface HotelDetailModalProps {
  hotelId: string
  hid?: number
  hotelName: string
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
    roomConfigs?: any[]
    currency?: string
    residency?: string
  }
  onClose: () => void
  onBook: (room: Room, hotel: HotelDetail) => void
}

// Mini-bildegalleri per rom
function RoomImageGallery({ images, roomName }: { images: string[]; roomName: string }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const total = images.length
  if (total === 0) return null

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % total) }

  return (
    <>
      <div className="relative sm:w-52 shrink-0 bg-[var(--sand-light)] overflow-hidden" style={{ minHeight: 130 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[idx]}
          alt={`${roomName} – bilde ${idx + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          style={{ minHeight: 130, maxHeight: 180 }}
          loading="lazy"
          onClick={() => setLightbox(true)}
        />
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              <Images size={9} />
              {idx + 1}/{total}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <ChevronLeft size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx]} alt={roomName} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % total) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X size={20} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{idx + 1} / {total}</p>

          {/* Thumbnails */}
          {total > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto py-1 px-2">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  onClick={e => { e.stopPropagation(); setIdx(i) }}
                  className={`w-12 h-9 object-cover rounded cursor-pointer shrink-0 transition-all ${i === idx ? "ring-2 ring-white opacity-100" : "opacity-50 hover:opacity-80"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function renderDescription(description: any): React.ReactNode {
  if (!description) {
    return <p className="text-sm text-[var(--muted)]">Ingen beskrivelse tilgjengelig.</p>
  }
  if (Array.isArray(description)) {
    return description.map((block: any, i: number) => (
      <div key={i}>
        {block.title && <h4 className="font-semibold text-[var(--deep)] mb-2">{block.title}</h4>}
        {Array.isArray(block.paragraphs) && block.paragraphs.map((p: string, j: number) => (
          <p key={j} className="text-sm text-[var(--muted)] leading-relaxed mb-2">{p}</p>
        ))}
      </div>
    ))
  }
  if (typeof description === 'object' && Array.isArray(description.paragraphs)) {
    return (
      <div>
        {description.title && <h4 className="font-semibold text-[var(--deep)] mb-2">{description.title}</h4>}
        {description.paragraphs.map((p: string, j: number) => (
          <p key={j} className="text-sm text-[var(--muted)] leading-relaxed mb-2">{p}</p>
        ))}
      </div>
    )
  }
  return <p className="text-sm text-[var(--muted)] leading-relaxed">{String(description)}</p>
}

export default function HotelDetailModal({ hotelId, hid, hotelName, searchParams, onClose, onBook }: HotelDetailModalProps) {
  const [hotel, setHotel] = useState<HotelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"rooms" | "info" | "fasiliteter" | "kart">("rooms")
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  // Stable string key derived from primitive searchParams values.
  // Avoids re-fetching when the parent passes a new object reference with identical values.
  const paramsKey = `${searchParams.checkIn}|${searchParams.checkOut}|${searchParams.adults}|${(searchParams.children || []).join(",")}|${searchParams.residency || "no"}`

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/hotels/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelId: (hid || !hotelId) ? undefined : hotelId,
            hid: hid,
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.adults,
            children: searchParams.children,
            roomConfigs: searchParams.roomConfigs,
            currency: searchParams.currency || "NOK",
            residency: searchParams.residency || "no",
          }),
        })
        const data = await res.json()
        if (data.success) {
          setHotel(data.hotel)
        } else {
          setError(data.error || "Kunne ikke hente hotelldetaljer")
        }
      } catch {
        setError("En feil oppsto. Prøv igjen.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, hid, paramsKey])

  const nights = (() => {
    const d1 = new Date(searchParams.checkIn)
    const d2 = new Date(searchParams.checkOut)
    return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
  })()

  const getRoomPrice = (room: Room): {
    amount: number
    currency: string
    taxes: TaxEntry[]
    totalExcludingTaxes: number | null
  } => {
    const paymentTypes = room.payment_options?.payment_types
    if (paymentTypes && paymentTypes.length > 0) {
      const sorted = [...paymentTypes].sort((a: any, b: any) =>
        parseFloat(a.amount || "999999") - parseFloat(b.amount || "999999")
      )
      const best = sorted[0]
      const taxes: TaxEntry[] = room.tax_data?.taxes ?? best.tax_data?.taxes ?? []
      const netAmount = Math.round(parseFloat(best.amount || "0"))

      return {
        amount: applyMarkup(netAmount),
        currency: best.currency_code || "NOK",
        taxes,
        totalExcludingTaxes: null,
      }
    }
    return { amount: 0, currency: "NOK", taxes: [], totalExcludingTaxes: null }
  }

  const MEAL_LABELS: Record<string, string> = {
    "all-inclusive": "Alt inklusiv",
    "breakfast": "Frokost inkludert",
    "breakfast-buffet": "Frokostbuffet",
    "continental-breakfast": "Kontinental frokost",
    "dinner": "Middag inkludert",
    "full-board": "Helpensjon",
    "half-board": "Halvpensjon",
    "lunch": "Lunsj inkludert",
    "nomeal": "Kun rom",
    "some-meal": "Some meal",
    "english-breakfast": "Engelsk frokost",
    "american-breakfast": "Amerikansk frokost",
    "asian-breakfast": "Asiatisk frokost",
    "chinese-breakfast": "Kinesisk frokost",
    "israeli-breakfast": "Israelsk frokost",
    "japanese-breakfast": "Japansk frokost",
    "scandinavian-breakfast": "Skandinavisk frokost",
    "scottish-breakfast": "Skotsk frokost",
    "breakfast-for-1": "Frokost for 1 gjest",
    "breakfast-for-2": "Frokost for 2 gjester",
    "super-all-inclusive": "Super all inclusive",
    "soft-all-inclusive": "Soft all inclusive",
    "ultra-all-inclusive": "Ultra all inclusive",
    "half-board-lunch": "Halvpensjon med lunsj",
    "half-board-dinner": "Halvpensjon med middag",
  }

  const getMealLabel = (meal: any): string => {
    if (!meal) return ""
    if (meal.value && MEAL_LABELS[meal.value]) {
      const label = MEAL_LABELS[meal.value]
      if (meal.no_child_meal && meal.value !== "nomeal") {
        return `${label} (ikke barn)`
      }
      return label
    }
    if (meal.has_all_inclusive) return "Alt inklusiv"
    if (meal.has_full_board) return "Helpensjon"
    if (meal.has_half_board) return "Halvpensjon"
    if (meal.has_breakfast) return "Frokost inkludert"
    return ""
  }

  const formatTaxName = (name: string): string => {
    if (!name) return ""
    const taxNames: Record<string, string> = {
      city_tax: "Byavgift",
      cleaning_fee: "Rengjøringsgebyr",
      occupancy_tax: "Oppholdsskatt",
      resort_fee: "Resortavgift",
      service_charge: "Servicegebyr",
      service_fee: "Servicegebyr",
      vat: "MVA",
      local_tax: "Lokalskatt",
      tourism_tax: "Turistskatt",
      tourist_tax: "Turistskatt",
      environmental_fee: "Miljøavgift",
      parking_fee: "Parkeringsavgift",
      energy_surcharge: "Energitillegg",
      heritage_fee: "Kulturarvavgift",
      destination_fee: "Destinasjonsavgift",
      amenity_fee: "Fasilitetsavgift",
      facility_fee: "Fasilitetsavgift",
      spa_fee: "Spa-avgift",
      resort_levy: "Resortavgift",
      electricity_fee: "Strømavgift",
      tax: "Skatt",
    }
    const key = name.toLowerCase().replace(/-/g, "_")
    return taxNames[key] ?? name.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  }

  const getCancellationLabel = (penalties: any): string => {
    if (!penalties) return "Se vilkår"
    const freeBefore: string | undefined = penalties.free_cancellation_before
    if (freeBefore) {
      const dt = new Date(freeBefore)
      const formatted = dt.toLocaleString("nb-NO", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "UTC"
      })
      return `Gratis avbestilling før ${formatted} UTC`
    }
    if (penalties.policies && Array.isArray(penalties.policies)) {
      const freePolicy = penalties.policies.find((p: any) =>
        p.amount_charge === "0" || p.amount_charge === 0
      )
      if (freePolicy?.end_at) {
        const dt = new Date(freePolicy.end_at)
        const formatted = dt.toLocaleString("nb-NO", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", timeZone: "UTC"
        })
        return `Gratis avbestilling før ${formatted} UTC`
      }
      const firstPolicy = penalties.policies[0]
      if (firstPolicy?.amount_charge === "0" || firstPolicy?.amount_charge === 0) {
        return "Gratis avbestilling"
      }
    }
    return "Ikke-refunderbar"
  }

  const allImages = hotel ? [hotel.image, ...hotel.images.filter(img => img !== hotel.image)].filter(Boolean) : []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="font-display text-xl text-[var(--deep)] truncate pr-4">
            {loading ? "Laster..." : hotel?.name || hotelName}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--sand-light)] hover:bg-[var(--sand)] flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} className="text-[var(--deep)]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-[var(--coral)] border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
                <p className="text-sm text-[var(--muted)]">Henter tilgjengelige rom...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center max-w-sm">
                <p className="text-[var(--deep)] font-semibold">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-sm text-[var(--coral)] font-medium"
                >
                  Lukk og prøv igjen
                </button>
              </div>
            </div>
          ) : hotel ? (
            <>
              {/* Hero-galleri */}
              <div className="relative aspect-[16/9] sm:aspect-[21/8] bg-[var(--sand-light)] overflow-hidden">
                {allImages.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={allImages[galleryIndex]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setGalleryIndex(i => (i - 1 + allImages.length) % allImages.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() => setGalleryIndex(i => (i + 1) % allImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => setShowGallery(true)}
                          className="absolute bottom-3 right-3 text-xs font-semibold bg-black/50 text-white px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors"
                        >
                          {galleryIndex + 1} / {allImages.length} bilder
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[var(--muted)]">Ingen bilder tilgjengelig</span>
                  </div>
                )}
              </div>

              {/* Hotel info bar */}
              <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--sand-light)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {hotel.star_rating > 0 && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.round(hotel.star_rating) }).map((_, i) => (
                            <Star key={i} size={13} fill="var(--gold)" stroke="none" />
                          ))}
                        </div>
                      )}
                      {hotel.check_in_time && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Clock size={11} /> Innsjekk {hotel.check_in_time}
                        </span>
                      )}
                      {hotel.check_out_time && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          Utsjekk {hotel.check_out_time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-[var(--muted)]" />
                      <p className="text-sm text-[var(--muted)] truncate">{hotel.address}</p>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--muted)] shrink-0">
                    <span className="font-semibold text-[var(--deep)]">{nights}</span> netter ·{" "}
                    {new Date(searchParams.checkIn).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} –{" "}
                    {new Date(searchParams.checkOut).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-[var(--border)] px-6 scrollbar-none">
                {(["rooms", "info", "fasiliteter", "kart"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                      activeTab === tab
                        ? "border-[var(--coral)] text-[var(--coral)]"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--deep)]"
                    }`}
                  >
                    {tab === "rooms" ? `Rom (${hotel.total_rooms})` : tab === "info" ? "Om hotellet" : tab === "fasiliteter" ? "Fasiliteter" : "Kart"}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-6 py-5">
                {/* ROM-TAB */}
                {activeTab === "rooms" && (
                  <div className="space-y-4">
                    {hotel.rooms.length === 0 ? (
                      <p className="text-center text-[var(--muted)] py-8">Ingen tilgjengelige rom for valgte datoer.</p>
                    ) : (
                      hotel.rooms.map((room, idx) => {
                        const price = getRoomPrice(room)
                        const pricePerNight = nights > 0 ? Math.round(price.amount / nights) : price.amount
                        const mealLabel = getMealLabel(room.meal_data)
                        const cancellationLabel = getCancellationLabel(room.cancellation_penalties)
                        const isFree = cancellationLabel === "Gratis avbestilling"
                        const hasRoomImages = room.images && room.images.length > 0

                        return (
                          <div key={idx} className="rounded-2xl border border-[var(--border)] overflow-hidden bg-white group hover:border-[var(--coral)]/40 transition-colors">
                            <div className="flex flex-col sm:flex-row">
                              {/* Rombilder – galleri med alle bilder */}
                              {hasRoomImages && (
                                <RoomImageGallery images={room.images} roomName={room.room_name} />
                              )}

                              <div className="flex-1 p-4 flex flex-col gap-3">
                                {/* Rominfo + pris rad */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-[var(--deep)] text-sm">{room.room_name}</h4>
                                      {room.allotment >= 2 && room.allotment <= 5 && (
                                        <span className="text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                                          Kun {room.allotment} igjen!
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {mealLabel && (
                                        <span className="text-[11px] font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                                          {mealLabel}
                                        </span>
                                      )}
                                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                        isFree ? "bg-green-50 text-green-700" : "bg-[var(--sand-light)] text-[var(--muted)]"
                                      }`}>
                                        {cancellationLabel}
                                      </span>
                                      {room.size_sqm && (
                                        <span className="text-[11px] font-medium bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full">
                                          {room.size_sqm} m²
                                        </span>
                                      )}
                                      {room.capacity > 0 && (
                                        <span className="text-[11px] font-medium bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full">
                                          Maks {room.capacity} gjester
                                        </span>
                                      )}
                                    </div>
                                    {(room.amenities ?? []).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {(room.amenities ?? []).slice(0, 4).map(a => (
                                          <span key={a} className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                                            <Check size={9} className="text-green-500" /> {a}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                                    <div>
                                      <p className="font-display text-2xl text-[var(--deep)]">
                                        {pricePerNight.toLocaleString("nb-NO")}
                                      </p>
                                      <p className="text-xs text-[var(--muted)]">{price.currency}/natt</p>
                                      {nights > 1 && (
                                        <p className="text-xs text-[var(--muted)] mt-0.5">
                                          {price.amount.toLocaleString("nb-NO")} {price.currency} totalt
                                        </p>
                                      )}
                                      {(price.taxes ?? []).some(t => !t.included_by_supplier) && (
                                        <p className="text-[11px] text-amber-600 font-medium mt-1">+ avgifter v/innsjekk</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => onBook(room, hotel)}
                                      className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg shadow-[var(--coral)]/20"
                                    >
                                      Velg rom
                                    </button>
                                  </div>
                                </div>

                                {/* Skatteinfo */}
                                {(price.taxes ?? []).filter(t => !t.included_by_supplier).length > 0 && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
                                    <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                                      ⚠️ Betales direkte til hotellet ved innsjekk
                                    </p>
                                    {(price.taxes ?? []).filter(t => !t.included_by_supplier).map((tax, ti) => (
                                      <div key={ti} className="flex justify-between items-center">
                                        <span className="text-xs text-amber-700">{formatTaxName(tax.name)}</span>
                                        <span className="text-xs font-semibold text-amber-800">
                                          {parseFloat(tax.amount).toLocaleString("nb-NO")} {tax.currency_code}
                                        </span>
                                      </div>
                                    ))}
                                    <p className="text-[11px] text-amber-600 pt-0.5">
                                      Ikke inkludert i prisen over — betales separat til hotellet.
                                    </p>
                                  </div>
                                )}
                                {(price.taxes ?? []).length > 0 && (price.taxes ?? []).every(t => t.included_by_supplier) && (
                                  <p className="text-[11px] text-green-700 flex items-center gap-1">
                                    <span>✓</span> Alle skatter og avgifter er inkludert i prisen
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* INFO-TAB */}
                {activeTab === "info" && (
                  <div className="max-w-2xl space-y-4">
                    {renderDescription(hotel.description)}
                  </div>
                )}

                {/* KART-TAB */}
                {activeTab === "kart" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height: 400 }}>
                      <iframe
                        title="Hotellets beliggenhet"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.address)}&output=embed&z=15`}
                        className="border-0"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                        <MapPin size={13} className="text-[var(--coral)]" />
                        {hotel.address}
                      </p>
                      <a
                        href={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[var(--sea)] hover:text-[var(--deep)] transition-colors whitespace-nowrap"
                      >
                        Åpne i Google Maps ↗
                      </a>
                    </div>
                  </div>
                )}

                {/* FASILITETER-TAB */}
                {activeTab === "fasiliteter" && (
                  <div className="space-y-6">
                    {hotel.amenity_groups.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">Ingen fасilitetsinformasjon tilgjengelig.</p>
                    ) : (
                      hotel.amenity_groups.map((group: any, i: number) => (
                        <div key={i}>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">{group.group_name}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(group.amenities ?? []).filter((a: any) => !!a?.name).map((amenity: any, j: number) => (
                              <div key={j} className="flex items-center gap-2">
                                <Check size={13} className="text-[var(--coral)] shrink-0" />
                                <span className="text-sm text-[var(--deep)]">{amenity.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Fullscreen galleri */}
      {showGallery && allImages.length > 0 && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center" onClick={() => setShowGallery(false)}>
          <button
            onClick={e => { e.stopPropagation(); setGalleryIndex(i => (i - 1 + allImages.length) % allImages.length) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <ChevronLeft size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={allImages[galleryIndex]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain" onClick={e => e.stopPropagation()} />
          <button
            onClick={e => { e.stopPropagation(); setGalleryIndex(i => (i + 1) % allImages.length) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setShowGallery(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X size={20} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{galleryIndex + 1} / {allImages.length}</p>
        </div>
      )}
    </div>
  )
}
