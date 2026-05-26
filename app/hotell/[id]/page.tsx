"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HotelBookingModal from "@/components/hotels/HotelBookingModal"
import {
  Star, MapPin, Clock, Wifi, Car, Waves, Dumbbell, UtensilsCrossed,
  Sparkles, ChevronLeft, ChevronRight, X, Check, Users, Bed,
  ArrowRight, Calendar, Wind, Coffee, PawPrint,
} from "lucide-react"

interface AmenityGroup {
  group_name: string
  amenities: { name: string }[]
}

interface HotelInfo {
  id?: string
  hid?: number
  name?: string
  hotel_name?: string
  address?: string
  city?: { name?: string }
  region?: { name?: string; country_name?: string }
  country?: { name?: string }
  images?: (string | { url?: string; tmpl?: string })[]
  star_rating?: number
  stars?: number
  amenity_groups?: AmenityGroup[]
  description?: string | { title?: string; paragraphs?: string[] }[]
  check_in_time?: string
  check_out_time?: string
  kind?: string
  latitude?: number | string
  longitude?: number | string
  serp_filters?: string[]
  facts?: Record<string, any>
  policy?: any
}

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
  non_free_amenities?: string[]
  keys_pickup_instructions?: string | null
  capacity: number
  size_sqm: number | null
  view: string | null
  bathroom_desc: string | null
  bedding_desc: string | null
  images: string[]
}

interface HotelDetail extends HotelInfo {
  image?: string
  amenity_groups: AmenityGroup[]
  rooms: Room[]
  total_rooms: number
}

function normalizeImage(img: string | { url?: string; tmpl?: string } | undefined, size = "1024x768"): string {
  if (!img) return ""
  const raw = typeof img === "string" ? img : (img.url || img.tmpl || "")
  return raw.replace("{size}", size)
}

function buildAddress(info: HotelInfo): string {
  return [
    info.address,
    info.city?.name,
    info.region?.name,
    info.region?.country_name || info.country?.name,
  ].filter(Boolean).join(", ")
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < count ? "var(--gold)" : "transparent"}
          stroke={i < count ? "none" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  "wifi": <Wifi size={14} />,
  "internet": <Wifi size={14} />,
  "parking": <Car size={14} />,
  "pool": <Waves size={14} />,
  "basseng": <Waves size={14} />,
  "gym": <Dumbbell size={14} />,
  "fitness": <Dumbbell size={14} />,
  "spa": <Sparkles size={14} />,
  "restaurant": <UtensilsCrossed size={14} />,
  "breakfast": <Coffee size={14} />,
  "frokost": <Coffee size={14} />,
  "air": <Wind size={14} />,
  "pet": <PawPrint size={14} />,
  "kjæledyr": <PawPrint size={14} />,
}

function getAmenityIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return <Check size={14} />
}

const MEAL_LABELS: Record<string, string> = {
  "all-inclusive": "Alt inklusiv",
  "super-all-inclusive": "Super all inclusive",
  "soft-all-inclusive": "Soft all inclusive",
  "ultra-all-inclusive": "Ultra all inclusive",
  "breakfast": "Frokost inkludert",
  "breakfast-buffet": "Frokostbuffet",
  "continental-breakfast": "Kontinental frokost",
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
  "dinner": "Middag inkludert",
  "full-board": "Helpensjon",
  "half-board": "Halvpensjon",
  "half-board-lunch": "Halvpensjon med lunsj",
  "half-board-dinner": "Halvpensjon med middag",
  "lunch": "Lunsj inkludert",
  "nomeal": "Kun rom",
  "some-meal": "Some meal",
}

function getMealLabel(meal: any): string {
  if (!meal) return ""
  if (meal.value && MEAL_LABELS[meal.value]) return MEAL_LABELS[meal.value]
  if (meal.has_all_inclusive) return "Alt inklusiv"
  if (meal.has_full_board) return "Helpensjon"
  if (meal.has_half_board) return "Halvpensjon"
  if (meal.has_breakfast) return "Frokost inkludert"
  return ""
}

function getCancellationLabel(penalties: any): string {
  if (!penalties) return "Se vilkår"
  const freeBefore: string | undefined = penalties.free_cancellation_before
  if (freeBefore) {
    const dt = new Date(freeBefore)
    const formatted = dt.toLocaleString("nb-NO", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "UTC"
    })
    return `Gratis avbestilling før ${formatted}`
  }
  if (penalties.policies && Array.isArray(penalties.policies)) {
    const free = penalties.policies.find((p: any) => p.amount_charge === "0" || p.amount_charge === 0)
    if (free) return "Gratis avbestilling"
  }
  return "Ikke-refunderbar"
}

function getRoomPrice(room: Room): { amount: number; currency: string; taxes: TaxEntry[] } {
  const types = room.payment_options?.payment_types
  if (types && types.length > 0) {
    const best = [...types].sort((a: any, b: any) => parseFloat(a.amount || "99999") - parseFloat(b.amount || "99999"))[0]
    const taxes: TaxEntry[] = room.tax_data?.taxes ?? best.tax_data?.taxes ?? []
    return { amount: Math.round(parseFloat(best.amount || "0")), currency: best.currency_code || "NOK", taxes }
  }
  return { amount: 0, currency: "NOK", taxes: [] }
}

// ─── Bildegalleri ─────────────────────────────────────────────────────────────
function HotelGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const total = images.length
  if (total === 0) return (
    <div className="w-full aspect-[16/7] bg-[var(--sand-light)] flex items-center justify-center text-[var(--muted)]">
      Ingen bilder tilgjengelig
    </div>
  )

  const prev = () => setActive(i => (i - 1 + total) % total)
  const next = () => setActive(i => (i + 1) % total)

  return (
    <>
      <div className="relative w-full aspect-[16/7] bg-black overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt="Hotellbilde"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightbox(true)}
        />
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 text-xs font-semibold bg-black/60 text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              {active + 1} / {total} bilder
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-[var(--sand-light)] scrollbar-hide">
          {images.slice(0, 12).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              onClick={() => setActive(i)}
              className={`w-16 h-11 object-cover rounded cursor-pointer shrink-0 transition-all ${i === active ? "ring-2 ring-[var(--coral)]" : "opacity-60 hover:opacity-100"}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <ChevronLeft size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X size={20} />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{active + 1} / {total}</p>
          {total > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto py-1 px-2">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`w-12 h-9 object-cover rounded cursor-pointer shrink-0 ${i === active ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-80"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── Datovelger-widget ────────────────────────────────────────────────────────
function DateSearchBar({ hotelId, hid, initialCheckIn, initialCheckOut, initialAdults, onSearch }: {
  hotelId: string
  hid?: number
  initialCheckIn?: string
  initialCheckOut?: string
  initialAdults?: number
  onSearch: (checkIn: string, checkOut: string, adults: number) => void
}) {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 4)
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  const [checkIn, setCheckIn] = useState(initialCheckIn || fmt(tomorrow))
  const [checkOut, setCheckOut] = useState(initialCheckOut || fmt(dayAfter))
  const [adults, setAdults] = useState(initialAdults || 2)

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Velg datoer for å se priser</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs text-[var(--muted)] mb-1">Innsjekk</label>
          <input
            type="date"
            value={checkIn}
            min={fmt(tomorrow)}
            onChange={e => setCheckIn(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--deep)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/30"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--muted)] mb-1">Utsjekk</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={e => setCheckOut(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--deep)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/30"
          />
        </div>
        <div className="sm:w-28">
          <label className="block text-xs text-[var(--muted)] mb-1">Voksne</label>
          <select
            value={adults}
            onChange={e => setAdults(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--deep)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/30"
          >
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} voksen{n > 1 ? "e" : ""}</option>)}
          </select>
        </div>
        <div className="sm:flex sm:items-end">
          <button
            onClick={() => onSearch(checkIn, checkOut, adults)}
            className="w-full sm:w-auto bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Calendar size={15} />
            {nights} natt{nights !== 1 ? "er" : ""}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Romkort ──────────────────────────────────────────────────────────────────
function RoomCard({ room, nights, onBook }: { room: Room; nights: number; onBook: (r: Room) => void }) {
  const price = getRoomPrice(room)
  const perNight = nights > 0 ? Math.round(price.amount / nights) : price.amount
  const meal = getMealLabel(room.meal_data)
  const cancel = getCancellationLabel(room.cancellation_penalties)
  const isFreeCancel = cancel.startsWith("Gratis")
  const [imgIdx, setImgIdx] = useState(0)

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-white hover:border-[var(--coral)]/40 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {room.images.length > 0 && (
          <div className="relative sm:w-48 shrink-0 bg-[var(--sand-light)] overflow-hidden" style={{ minHeight: 130 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={room.images[imgIdx]} alt={room.room_name} className="w-full h-full object-cover" style={{ minHeight: 130, maxHeight: 170 }} loading="lazy" />
            {room.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i - 1 + room.images.length) % room.images.length)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white">
                  <ChevronLeft size={12} />
                </button>
                <button onClick={() => setImgIdx(i => (i + 1) % room.images.length)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white">
                  <ChevronRight size={12} />
                </button>
              </>
            )}
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--deep)] text-sm">{room.room_name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {meal && <span className="text-[11px] font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{meal}</span>}
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${isFreeCancel ? "bg-green-50 text-green-700" : "bg-[var(--sand-light)] text-[var(--muted)]"}`}>
                  {cancel}
                </span>
                {room.size_sqm && <span className="text-[11px] bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full">{room.size_sqm} m²</span>}
                {room.capacity > 0 && (
                  <span className="text-[11px] bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Users size={9} /> Maks {room.capacity}
                  </span>
                )}
                {room.bedding_desc && <span className="text-[11px] bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full flex items-center gap-1"><Bed size={9} /> {room.bedding_desc}</span>}
              </div>
              {room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.amenities.slice(0, 4).map(a => (
                    <span key={a} className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                      <Check size={9} className="text-green-500" /> {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
              <div>
                <p className="font-display text-2xl text-[var(--deep)]">{perNight.toLocaleString("nb-NO")}</p>
                <p className="text-xs text-[var(--muted)]">{price.currency}/natt</p>
                {nights > 1 && <p className="text-xs text-[var(--muted)] mt-0.5">{price.amount.toLocaleString("nb-NO")} totalt</p>}
                {price.taxes.some(t => !t.included_by_supplier) && <p className="text-[11px] text-amber-600 font-medium mt-1">+ avgifter v/innsjekk</p>}
              </div>
              <button
                onClick={() => onBook(room)}
                className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg shadow-[var(--coral)]/20"
              >
                Velg rom
              </button>
            </div>
          </div>
          {price.taxes.filter(t => !t.included_by_supplier).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
              ⚠️ Betales direkte til hotellet ved innsjekk: {price.taxes.filter(t => !t.included_by_supplier).map(t => `${t.name} ${t.amount} ${t.currency_code}`).join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Hoveddel ─────────────────────────────────────────────────────────────────
function HotellInfoContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const hotelId = Array.isArray(params.id) ? params.id[0] : (params.id as string)
  const hid = searchParams.get("hid") ? Number(searchParams.get("hid")) : undefined
  const urlCheckIn = searchParams.get("checkIn") || ""
  const urlCheckOut = searchParams.get("checkOut") || ""
  const urlAdults = Number(searchParams.get("adults") || "2")
  const urlResidency = searchParams.get("residency") || "no"

  const [info, setInfo] = useState<HotelInfo | null>(null)
  const [infoLoading, setInfoLoading] = useState(true)
  const [detail, setDetail] = useState<HotelDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [activeTab, setActiveTab] = useState<"rom" | "om" | "fasiliteter" | "kart">("rom")
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [searchDates, setSearchDates] = useState({
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    adults: urlAdults,
  })

  // Hent statisk hotellinfo
  useEffect(() => {
    async function fetchInfo() {
      setInfoLoading(true)
      try {
        const res = await fetch("/api/hotels/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotelId: hotelId || undefined, hid }),
        })
        const data = await res.json()
        if (data.success) setInfo(data.hotel)
      } catch {
        // Info ikke kritisk
      } finally {
        setInfoLoading(false)
      }
    }
    fetchInfo()
  }, [hotelId, hid])

  // Hent rom og priser
  const fetchDetail = useCallback(async (checkIn: string, checkOut: string, adults: number) => {
    if (!checkIn || !checkOut) return
    setDetailLoading(true)
    setDetailError("")
    try {
      const res = await fetch("/api/hotels/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: hotelId || undefined,
          hid,
          checkIn,
          checkOut,
          adults,
          children: [],
          currency: "NOK",
          residency: urlResidency,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDetail(data.hotel)
        setActiveTab("rom")
      } else {
        setDetailError(data.error || "Kunne ikke hente rom")
      }
    } catch {
      setDetailError("En feil oppsto. Prøv igjen.")
    } finally {
      setDetailLoading(false)
    }
  }, [hotelId, hid])

  // Auto-søk ved oppstart hvis datoer er i URL
  useEffect(() => {
    if (urlCheckIn && urlCheckOut) {
      fetchDetail(urlCheckIn, urlCheckOut, urlAdults)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (checkIn: string, checkOut: string, adults: number) => {
    setSearchDates({ checkIn, checkOut, adults })
    const url = new URL(window.location.href)
    url.searchParams.set("checkIn", checkIn)
    url.searchParams.set("checkOut", checkOut)
    url.searchParams.set("adults", String(adults))
    router.replace(url.pathname + url.search, { scroll: false })
    fetchDetail(checkIn, checkOut, adults)
  }

  const nights = searchDates.checkIn && searchDates.checkOut
    ? Math.max(1, Math.ceil((new Date(searchDates.checkOut).getTime() - new Date(searchDates.checkIn).getTime()) / 86400000))
    : 0

  const hotelData = detail || info
  const name = hotelData?.name || (hotelData as any)?.hotel_name || "Hotell"
  const address = info ? buildAddress(info) : ""
  const stars = Math.round(Number(info?.star_rating || info?.stars || 0))
  const amenityGroups: AmenityGroup[] = (detail?.amenity_groups || info?.amenity_groups || []) as AmenityGroup[]

  const rawImages: (string | { url?: string; tmpl?: string })[] = info?.images || []
  const images = rawImages
    .map(img => normalizeImage(img))
    .filter(Boolean)

  const description = info?.description
  const lat = parseFloat(String(info?.latitude || ""))
  const lng = parseFloat(String(info?.longitude || ""))
  const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0

  const checkInTime = detail?.check_in_time || info?.check_in_time
  const checkOutTime = detail?.check_out_time || info?.check_out_time

  const tabs = [
    { id: "rom", label: `Rom${detail ? ` (${detail.total_rooms})` : ""}` },
    { id: "om", label: "Om hotellet" },
    { id: "fasiliteter", label: "Fasiliteter" },
    { id: "kart", label: "Kart" },
  ] as const

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Topplinje */}
      <div className="bg-[var(--deep)] pt-20 pb-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/50 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/hoteller" className="hover:text-white transition-colors">Hoteller</Link>
            <span>/</span>
            <span className="text-white line-clamp-1">{infoLoading ? "Laster…" : name}</span>
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-[var(--sand-light)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Hotellkort */}
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            {infoLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-[var(--coral)] border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
                  <p className="text-sm text-[var(--muted)]">Henter hotellinfo…</p>
                </div>
              </div>
            ) : (
              <>
                <HotelGallery images={images} />

                <div className="p-6">
                  {/* Hotelltittel */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <h1 className="font-display text-3xl lg:text-4xl text-[var(--deep)] mb-2">{name}</h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        {stars > 0 && <StarRow count={stars} />}
                        {info?.kind && (
                          <span className="text-xs bg-[var(--sand-light)] text-[var(--muted)] px-2.5 py-1 rounded-full capitalize">{info.kind}</span>
                        )}
                        {address && (
                          <span className="flex items-center gap-1 text-sm text-[var(--muted)]">
                            <MapPin size={13} /> {address}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Quick facts */}
                    {(checkInTime || checkOutTime) && (
                      <div className="flex gap-3 shrink-0">
                        {checkInTime && (
                          <div className="text-center bg-[var(--sand-light)] rounded-xl px-4 py-2.5">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-0.5">Innsjekk</p>
                            <p className="font-semibold text-[var(--deep)] text-sm flex items-center gap-1"><Clock size={13} /> {checkInTime}</p>
                          </div>
                        )}
                        {checkOutTime && (
                          <div className="text-center bg-[var(--sand-light)] rounded-xl px-4 py-2.5">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-0.5">Utsjekk</p>
                            <p className="font-semibold text-[var(--deep)] text-sm flex items-center gap-1"><Clock size={13} /> {checkOutTime}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Populære fasiliteter */}
                  {amenityGroups.length > 0 && (() => {
                    const popular = amenityGroups.find(g => g.group_name?.toLowerCase().includes("popular") || g.group_name?.toLowerCase().includes("populær"))
                      || amenityGroups[0]
                    const amenities = popular?.amenities?.slice(0, 8) || []
                    if (amenities.length === 0) return null
                    return (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {amenities.map((a: { name: string }) => (
                          <span key={a.name} className="flex items-center gap-1.5 text-xs bg-[var(--sea-light)] text-[var(--sea)] px-3 py-1.5 rounded-full">
                            {getAmenityIcon(a.name)}
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Datovelger */}
                  <DateSearchBar
                    hotelId={hotelId}
                    hid={hid}
                    initialCheckIn={searchDates.checkIn}
                    initialCheckOut={searchDates.checkOut}
                    initialAdults={searchDates.adults}
                    onSearch={handleSearch}
                  />
                </div>

                {/* Faner */}
                <div className="flex overflow-x-auto border-t border-[var(--border)] scrollbar-none">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 py-3.5 px-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-[var(--coral)] text-[var(--coral)]"
                          : "border-transparent text-[var(--muted)] hover:text-[var(--deep)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Faneinnhold */}
                <div className="p-6">
                  {/* ROM */}
                  {activeTab === "rom" && (
                    <div className="space-y-4">
                      {!searchDates.checkIn && !detailLoading && !detail && (
                        <div className="text-center py-12 text-[var(--muted)]">
                          <Calendar size={36} className="mx-auto mb-3 opacity-30" />
                          <p className="font-medium text-[var(--deep)] mb-1">Velg datoer for å se tilgjengelige rom og priser</p>
                          <p className="text-sm">Bruk søkeskjemaet over og klikk på knappen.</p>
                        </div>
                      )}
                      {detailLoading && (
                        <div className="flex flex-col items-center gap-3 py-12">
                          <div className="w-10 h-10 rounded-full border-4 border-[var(--coral)] border-t-transparent animate-spin" style={{ borderWidth: 3 }} />
                          <p className="text-sm text-[var(--muted)]">Henter tilgjengelige rom…</p>
                        </div>
                      )}
                      {detailError && !detailLoading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{detailError}</div>
                      )}
                      {detail && !detailLoading && (
                        detail.rooms.length === 0 ? (
                          <p className="text-center text-[var(--muted)] py-8">Ingen tilgjengelige rom for valgte datoer.</p>
                        ) : (
                          detail.rooms.map((room, i) => (
                            <RoomCard key={i} room={room} nights={nights} onBook={r => setBookingRoom(r)} />
                          ))
                        )
                      )}
                    </div>
                  )}

                  {/* OM HOTELLET */}
                  {activeTab === "om" && (
                    <div className="max-w-2xl space-y-4">
                      {description ? (
                        Array.isArray(description) ? (
                          description.map((block: any, i: number) => (
                            <div key={i}>
                              {block.title && <h3 className="font-semibold text-[var(--deep)] mb-2">{block.title}</h3>}
                              {block.paragraphs?.map((p: string, j: number) => (
                                <p key={j} className="text-sm text-[var(--muted)] leading-relaxed mb-2">{p}</p>
                              ))}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--muted)] leading-relaxed">{String(description)}</p>
                        )
                      ) : (
                        <p className="text-sm text-[var(--muted)]">Ingen beskrivelse tilgjengelig.</p>
                      )}

                      {/* Grunnleggende fakta */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                        {stars > 0 && (
                          <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">Stjerner</p>
                            <p className="font-semibold text-[var(--deep)]">{stars} av 5</p>
                          </div>
                        )}
                        {info?.kind && (
                          <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">Type</p>
                            <p className="font-semibold text-[var(--deep)] capitalize">{info.kind}</p>
                          </div>
                        )}
                        {checkInTime && (
                          <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">Innsjekk</p>
                            <p className="font-semibold text-[var(--deep)]">{checkInTime}</p>
                          </div>
                        )}
                        {checkOutTime && (
                          <div className="bg-[var(--sand-light)] rounded-xl p-4 text-center">
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">Utsjekk</p>
                            <p className="font-semibold text-[var(--deep)]">{checkOutTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FASILITETER */}
                  {activeTab === "fasiliteter" && (
                    <div className="space-y-6">
                      {amenityGroups.length === 0 ? (
                        <p className="text-sm text-[var(--muted)]">Ingen fasiliteter tilgjengelig.</p>
                      ) : (
                        amenityGroups.map((group, i) => (
                          <div key={i}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                              {group.group_name}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {group.amenities.map((a, j) => (
                                <div key={j} className="flex items-center gap-2">
                                  <span className="text-[var(--coral)] shrink-0">{getAmenityIcon(a.name)}</span>
                                  <span className="text-sm text-[var(--deep)]">{a.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* KART */}
                  {activeTab === "kart" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ height: 400 }}>
                        <iframe
                          title="Hotellets beliggenhet"
                          width="100%"
                          height="100%"
                          loading="lazy"
                          src={
                            hasCoords
                              ? `https://maps.google.com/maps?q=${lat},${lng}&output=embed&z=15`
                              : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`
                          }
                          className="border-0"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                          <MapPin size={13} className="text-[var(--coral)]" />
                          {address}
                        </p>
                        <a
                          href={
                            hasCoords
                              ? `https://maps.google.com/maps?q=${lat},${lng}`
                              : `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[var(--sea)] hover:text-[var(--deep)] transition-colors whitespace-nowrap"
                        >
                          Åpne i Google Maps ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* CTA nederst */}
          {!detailLoading && !detail && !infoLoading && (
            <div className="bg-[var(--deep)] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-display text-xl text-white mb-1">Klar til å booke?</p>
                <p className="text-sm text-white/60">Velg datoer over og se tilgjengelige rom og priser.</p>
              </div>
              <Link
                href={`/hoteller?destinasjon=${encodeURIComponent(info?.city?.name || "")}&hotel=${encodeURIComponent(name)}`}
                className="shrink-0 flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Søk etter ledige rom <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Bestillingsmodal */}
      {bookingRoom && detail && searchDates.checkIn && (
        <HotelBookingModal
          room={bookingRoom}
          hotel={{
            id: detail.id || hotelId,
            name: detail.name || (detail as any).hotel_name || name,
            address: address || detail.address || "",
            image: detail.image || images[0] || "",
            star_rating: Number(detail.star_rating || detail.stars || 0),
          }}
          searchParams={{
            checkIn: searchDates.checkIn,
            checkOut: searchDates.checkOut,
            adults: searchDates.adults,
            children: [],
            roomCount: 1,
            roomConfigs: [{ adults: searchDates.adults, childAges: [] }],
          }}
          onClose={() => setBookingRoom(null)}
        />
      )}
    </main>
  )
}

export default function HotellInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--sand-light)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--sand)] border-t-[var(--coral)] animate-spin" />
      </div>
    }>
      <HotellInfoContent />
    </Suspense>
  )
}
