"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { SlidersHorizontal, ArrowUpDown, Loader2, List, Map } from "lucide-react"
import { RateHawkHotel } from "@/lib/types"
import HotelCard from "./HotelCard"

const HotelMap = dynamic(() => import("./HotelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--sand-light)]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--coral)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--muted)]">Laster kart...</p>
      </div>
    </div>
  ),
})

interface HotelResultsProps {
  hotels: RateHawkHotel[]
  totalResults: number
  hasMore?: boolean
  searchId?: string
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
    residency?: string
    roomConfigs?: { adults: number; childAges: number[] }[]
  }
  onSelectHotel: (hotel: RateHawkHotel) => void
  onLoadMore?: (newHotels: RateHawkHotel[], hasMore: boolean) => void
}

type SortKey = "price_asc" | "price_desc" | "rating_desc" | "name_asc"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price_asc", label: "Pris: Lavest først" },
  { value: "price_desc", label: "Pris: Høyest først" },
  { value: "rating_desc", label: "Stjerner: Flest først" },
  { value: "name_asc", label: "Navn: A–Å" },
]

export default function HotelResults({
  hotels,
  totalResults,
  hasMore,
  searchId,
  searchParams,
  onSelectHotel,
  onLoadMore
}: HotelResultsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("price_asc")
  const [minStars, setMinStars] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null)

  const handleLoadMore = async () => {
    if (!searchId || !onLoadMore || loadingMore) return
    setLoadingMore(true)
    setLoadMoreError("")
    try {
      const res = await fetch("/api/hotels/search/more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, offset: hotels.length, batchSize: 15 }),
      })
      const data = await res.json()
      if (data.success && data.hotels?.length > 0) {
        onLoadMore(data.hotels, !!data.hasMore)
      } else if (!data.success) {
        setLoadMoreError(data.error || "Kunne ikke laste flere hoteller")
      }
    } catch {
      setLoadMoreError("En feil oppsto. Prøv igjen.")
    } finally {
      setLoadingMore(false)
    }
  }

  const sortedAndFiltered = [...hotels]
    .filter(h => minStars === 0 || h.rating >= minStars)
    .sort((a, b) => {
      switch (sortKey) {
        case "price_asc": return a.price.amount - b.price.amount
        case "price_desc": return b.price.amount - a.price.amount
        case "rating_desc": return b.rating - a.rating
        case "name_asc": return a.name.localeCompare(b.name)
        default: return 0
      }
    })

  const filterPanel = showFilters && (
    <div className="bg-white rounded-2xl p-4 mb-4 border border-[var(--border)]">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
        Minimum stjerner
      </p>
      <div className="flex gap-2 flex-wrap">
        {[0, 3, 4, 5].map(stars => (
          <button
            key={stars}
            onClick={() => setMinStars(stars)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
              minStars === stars
                ? "bg-[var(--deep)] text-white"
                : "bg-[var(--sand-light)] text-[var(--deep)] border border-[var(--border)] hover:border-[var(--deep)]"
            }`}
          >
            {stars === 0 ? "Alle" : `${stars}★`}
          </button>
        ))}
      </div>
    </div>
  )

  const loadMoreButton = hasMore && onLoadMore && (
    <div className="mt-6 pb-8 text-center space-y-3">
      {loadMoreError && (
        <p className="text-sm text-red-500">{loadMoreError} — prøv å søke på nytt.</p>
      )}
      <button
        onClick={handleLoadMore}
        disabled={loadingMore}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--deep)] text-white font-medium text-sm hover:bg-[var(--deep)]/90 transition-colors disabled:opacity-60"
      >
        {loadingMore ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Laster hoteller...
          </>
        ) : (
          `Vis flere (${totalResults - hotels.length} gjenstår)`
        )}
      </button>
    </div>
  )

  return (
    <>
      {/* ===== DESKTOP: split-screen (lg+) ===== */}
      <div className="hidden lg:flex items-start gap-0 -mx-4 sm:-mx-6 lg:-mx-8">

        {/* Venstrepanel – kortliste (tar mesteparten av bredden) */}
        <div
          className="flex-1 min-w-0 pl-4 sm:pl-6 lg:pl-8 pr-4 overflow-y-auto"
          style={{ height: "calc(100vh - 80px)", paddingTop: "20px", paddingBottom: "24px" }}
        >
          {/* Topplinje */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <p className="text-sm text-[var(--muted)]">
              Viser{" "}
              <span className="font-semibold text-[var(--deep)]">{sortedAndFiltered.length}</span>{" "}
              av{" "}
              <span className="font-semibold text-[var(--deep)]">{totalResults}</span> hoteller
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${
                  showFilters
                    ? "bg-[var(--deep)] text-white border-[var(--deep)]"
                    : "border-[var(--border)] text-[var(--deep)] hover:border-[var(--deep)]"
                }`}
              >
                <SlidersHorizontal size={14} />
                Filter
              </button>
              <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3 py-2">
                <ArrowUpDown size={14} className="text-[var(--muted)] shrink-0" />
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as SortKey)}
                  className="text-sm text-[var(--deep)] bg-transparent outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filterPanel}

          {sortedAndFiltered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-xl text-[var(--deep)]">Ingen hoteller funnet</p>
              <p className="text-[var(--muted)] mt-2 text-sm">Prøv å justere filtrene.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAndFiltered.map(hotel => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onSelect={onSelectHotel}
                  onHover={setHoveredHotelId}
                  searchParams={searchParams}
                  variant="horizontal"
                />
              ))}
            </div>
          )}

          {loadMoreButton}
        </div>

        {/* Høyrepanel – kart (smal, fast bredde) */}
        <div
          className="w-[340px] xl:w-[380px] flex-shrink-0 sticky top-[80px] overflow-hidden"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <HotelMap hotels={sortedAndFiltered} onSelectHotel={onSelectHotel} hoveredHotelId={hoveredHotelId} />
        </div>
      </div>

      {/* ===== MOBIL: toggle (< lg) ===== */}
      <div className="lg:hidden">
        {/* Topplinje */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <p className="text-sm text-[var(--muted)]">
            Viser{" "}
            <span className="font-semibold text-[var(--deep)]">{sortedAndFiltered.length}</span>{" "}
            av{" "}
            <span className="font-semibold text-[var(--deep)]">{totalResults}</span> hoteller
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Liste/Kart-toggle */}
            <div className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--deep)] text-white"
                    : "text-[var(--deep)] hover:bg-[var(--sand-light)]"
                }`}
              >
                <List size={14} /> Liste
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-[var(--deep)] text-white"
                    : "text-[var(--deep)] hover:bg-[var(--sand-light)]"
                }`}
              >
                <Map size={14} /> Kart
              </button>
            </div>

            {viewMode === "list" && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors ${
                    showFilters
                      ? "bg-[var(--deep)] text-white border-[var(--deep)]"
                      : "border-[var(--border)] text-[var(--deep)] hover:border-[var(--deep)]"
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Filter
                </button>
                <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3 py-2">
                  <ArrowUpDown size={14} className="text-[var(--muted)] shrink-0" />
                  <select
                    value={sortKey}
                    onChange={e => setSortKey(e.target.value as SortKey)}
                    className="text-sm text-[var(--deep)] bg-transparent outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {filterPanel}

        {/* Kartvisning */}
        {viewMode === "map" && (
          <div style={{ height: "calc(100vh - 280px)", minHeight: 420 }}>
            <HotelMap hotels={sortedAndFiltered} onSelectHotel={onSelectHotel} />
          </div>
        )}

        {/* Listevisning */}
        {viewMode === "list" && (
          sortedAndFiltered.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-[var(--deep)]">Ingen hoteller funnet</p>
              <p className="text-[var(--muted)] mt-2">Prøv å justere filtrene dine.</p>
            </div>
          ) : (
            <>
              {/* Mobil: vertikal liste / Tablet: 2 kolonner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedAndFiltered.map(hotel => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={onSelectHotel}
                    onHover={setHoveredHotelId}
                    searchParams={searchParams}
                    variant="horizontal"
                  />
                ))}
              </div>
              {loadMoreButton}
            </>
          )
        )}
      </div>
    </>
  )
}
