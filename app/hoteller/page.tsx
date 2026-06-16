"use client"

import { useState, useCallback, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HotelSearchForm from "@/components/hotels/HotelSearchForm"
import HotelResults from "@/components/hotels/HotelResults"
import HotelDetailModal from "@/components/hotels/HotelDetailModal"
import HotelBookingModal from "@/components/hotels/HotelBookingModal"
import { RateHawkHotel } from "@/lib/types"
import { decodeRoomCfg } from "@/lib/room-config"
import ErrorBoundary from "@/components/ErrorBoundary"

interface SearchState {
  destination: string
  destinationId: string
  destinationType: string
  checkIn: string
  checkOut: string
  roomConfigs: { adults: number; childAges: number[] }[]
  residency: string
}

interface SearchResult {
  hotels: RateHawkHotel[]
  totalResults: number
  searchId: string
  hasMore: boolean
}

function HotellPageContent() {
  const searchParams = useSearchParams()
  const urlDestination = searchParams.get("destinasjon") || ""
  const urlDestinationId = searchParams.get("destinationId") || ""
  const urlDestinationType = searchParams.get("destinationType") || "region"
  const urlCheckIn = searchParams.get("checkIn") || ""
  const urlCheckOut = searchParams.get("checkOut") || ""
  const urlRoomCfg = searchParams.get("roomCfg")
  // Legacy fallback params — kept for backwards compatibility with old URLs
  const urlAdults = parseInt(searchParams.get("adults") || "2", 10) || 2
  const urlBarn = parseInt(searchParams.get("barn") || "0", 10) || 0
  const urlRooms = Math.max(1, Math.min(4, parseInt(searchParams.get("rooms") || "1", 10) || 1))
  const urlChildAges = searchParams.get("childAges")
    ? searchParams.get("childAges")!.split(",").map(Number).filter(n => !isNaN(n))
    : Array(urlBarn).fill(10)
  const urlHotelNavn = searchParams.get("hotel") || ""
  const urlResidency = searchParams.get("residency") || "no"
  const [searchState, setSearchState] = useState<SearchState | null>(null)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedHotel, setSelectedHotel] = useState<RateHawkHotel | null>(null)
  const [bookingRoom, setBookingRoom] = useState<any | null>(null)
  const [bookingHotel, setBookingHotel] = useState<any | null>(null)
  const [searchTimestamp, setSearchTimestamp] = useState<number | null>(null)
  const [searchExpired, setSearchExpired] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const SEARCH_TTL_S = 25 * 60 // 25 min — varsler litt før RateHawk-cachen (30 min) løper ut

  useEffect(() => {
    if (!searchTimestamp) return
    setSearchExpired(false)

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - searchTimestamp) / 1000)
      const left = SEARCH_TTL_S - elapsed
      if (left <= 0) {
        setSecondsLeft(0)
        setSearchExpired(true)
        clearInterval(interval)
      } else {
        setSecondsLeft(left)
      }
    }, 1000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTimestamp])

  const handleSearch = useCallback(async (data: SearchState) => {
    setLoading(true)
    setError("")
    setResults(null)
    setSearchState(data)

    const totalAdults = data.roomConfigs.reduce((s, r) => s + r.adults, 0)
    const allChildren = data.roomConfigs.flatMap(r => r.childAges)

    try {
      const res = await fetch("/api/hotels/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: data.destinationId || data.destination,
          destinationType: data.destinationType,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adults: totalAdults,
          children: allChildren,
          rooms: data.roomConfigs.length,
          roomConfigs: data.roomConfigs,
          currency: "NOK",
          residency: data.residency || "no",
        }),
      })

      const result = await res.json()

      if (result.success) {
        const hotels: RateHawkHotel[] = result.hotels || []
        setResults({
          hotels,
          totalResults: result.totalResults || 0,
          searchId: result.searchId || "",
          hasMore: !!result.hasMore,
        })
        setSearchTimestamp(Date.now())
        setSearchExpired(false)
        setSecondsLeft(SEARCH_TTL_S)
        // Auto-åpne hotell fra URL-parameter (fra "Beste tilbud"-kort)
        if (urlHotelNavn) {
          const needle = urlHotelNavn.toLowerCase()
          const match = hotels.find(h => h.name.toLowerCase().includes(needle))
          if (match) setSelectedHotel(match)
        }
      } else {
        setError(result.error || "Søket feilet")
      }
    } catch {
      setError("En feil oppsto. Sjekk internettforbindelsen og prøv igjen.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-søk når siden lastes med URL-parametere (fra forsiden eller destinasjonskort)
  useEffect(() => {
    if (!urlDestination && !urlDestinationId) return

    const fmt = (d: Date) => d.toISOString().split("T")[0]
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    const checkOutDefault = new Date(); checkOutDefault.setDate(checkOutDefault.getDate() + 4)

    const checkIn = urlCheckIn || fmt(tomorrow)
    const checkOut = urlCheckOut || fmt(checkOutDefault)

    // Prefer structured roomCfg param which preserves exact per-room configuration.
    // Fall back to legacy adults/rooms/childAges params for old URLs.
    const decodedRoomCfg = decodeRoomCfg(urlRoomCfg)
    const roomConfigs = decodedRoomCfg ?? (() => {
      const baseAdults = Math.floor(urlAdults / urlRooms)
      const extraAdults = urlAdults % urlRooms
      const childrenPerRoom: number[][] = Array.from({ length: urlRooms }, () => [])
      urlChildAges.forEach((age, idx) => {
        const roomIdx = Math.max(0, urlRooms - 1 - idx)
        childrenPerRoom[roomIdx].push(age)
      })
      return Array.from({ length: urlRooms }, (_, i) => ({
        adults: Math.max(1, baseAdults + (i === 0 ? extraAdults : 0)),
        childAges: childrenPerRoom[i],
      }))
    })()

    async function autoSearch() {
      setLoading(true)
      setError("")
      try {
        // Hvis vi allerede har destinationId, hopp over destinasjonssøket
        if (urlDestinationId) {
          await handleSearch({
            destination: urlDestination || urlDestinationId,
            destinationId: urlDestinationId,
            destinationType: urlDestinationType,
            checkIn,
            checkOut,
            roomConfigs,
            residency: urlResidency,
          })
          return
        }

        const destRes = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(urlDestination)}`)
        const destData = await destRes.json()
        const match = destData.destinations?.[0]

        if (!match?.id) {
          setError(`Fant ingen resultater for "${urlDestination}". Prøv å søke manuelt.`)
          setLoading(false)
          return
        }

        await handleSearch({
          destination: match.name || urlDestination,
          destinationId: match.id,
          destinationType: match.type || "region",
          checkIn,
          checkOut,
          roomConfigs,
          residency: urlResidency,
        })
      } catch {
        setError("Kunne ikke laste destinasjonen. Søk manuelt.")
        setLoading(false)
      }
    }

    autoSearch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDestination, urlDestinationId, urlResidency])

  const totalAdults = searchState?.roomConfigs.reduce((s, r) => s + r.adults, 0) || 2
  const allChildren = useMemo(
    () => searchState?.roomConfigs.flatMap(r => r.childAges) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(searchState?.roomConfigs)]
  )

  const hasSearched = searchState !== null

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Search header */}
      <div className={`bg-[var(--deep)] pt-20 ${hasSearched ? "pb-4" : "pb-8"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hasSearched && (
            <div className="py-8 text-center">
              <h1 className="font-display text-4xl lg:text-5xl text-white mb-3">
                Søk etter hoteller
              </h1>
              <p className="text-white/60 text-base">
                Sammenlign priser og finn de beste hotellene for din reise
              </p>
            </div>
          )}
          <HotelSearchForm
            key={searchState ? `${searchState.destination}-${searchState.checkIn}-${searchState.checkOut}` : "empty"}
            onSearch={handleSearch}
            loading={loading}
            compact={hasSearched}
            initialValues={searchState ? {
              destination: searchState.destination,
              destinationId: searchState.destinationId,
              destinationType: searchState.destinationType,
              checkIn: searchState.checkIn,
              checkOut: searchState.checkOut,
              roomConfigs: searchState.roomConfigs,
              residency: searchState.residency,
            } : undefined}
          />
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 bg-[var(--sand-light)]">
        {/* Ikke-resultat-tilstander: sentrert med max-bredde */}
        {(!results || loading || error) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!hasSearched && !loading && (
              <div className="text-center py-20">
                <div className="text-5xl mb-6">🏨</div>
                <h2 className="font-display text-3xl text-[var(--deep)] mb-3">
                  Finn ditt perfekte hotell
                </h2>
                <p className="text-[var(--muted)] max-w-md mx-auto">
                  Bruk søkefeltet over til å finne ledige rom basert på destinasjon, datoer og antall gjester.
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-20">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-[var(--sand)] border-t-[var(--coral)] animate-spin" />
                  <p className="font-display text-2xl text-[var(--deep)]">Søker etter hoteller...</p>
                  <p className="text-[var(--muted)] text-sm">Henter priser fra over 2 millioner hoteller</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="max-w-lg mx-auto mt-12 bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
                <div className="text-4xl mb-4">😕</div>
                <h3 className="font-semibold text-[var(--deep)] mb-2">Ingen resultater</h3>
                <p className="text-sm text-[var(--muted)]">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Resultater: split-screen, HotelResults håndterer eget layout */}
        {/* Søkeutløps-banner */}
        {results && !loading && secondsLeft !== null && (
          <div className={`sticky top-0 z-30 transition-colors ${searchExpired ? "bg-red-600" : secondsLeft < 5 * 60 ? "bg-amber-500" : "bg-[var(--deep)]"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
              {searchExpired ? (
                <>
                  <p className="text-white text-sm font-medium">
                    ⏰ Søket ditt har utløpt — prisene kan ha endret seg.
                  </p>
                  <button
                    onClick={() => searchState && handleSearch(searchState)}
                    className="shrink-0 bg-white text-red-600 font-semibold text-xs px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Søk på nytt
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-xs">
                    {secondsLeft < 5 * 60
                      ? `⚠️ Prisene utløper om ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} — fullfør bestillingen snart.`
                      : `Prisene er gyldige i ${Math.floor(secondsLeft / 60)} min ${String(secondsLeft % 60).padStart(2, "0")} sek`
                    }
                  </p>
                  {secondsLeft < 5 * 60 && (
                    <button
                      onClick={() => searchState && handleSearch(searchState)}
                      className="shrink-0 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors"
                    >
                      Oppdater søk
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {results && !loading && searchState && results.hotels.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HotelResults
              hotels={results.hotels}
              totalResults={results.totalResults}
              hasMore={results.hasMore}
              searchId={results.searchId}
              searchParams={{
                checkIn: searchState.checkIn,
                checkOut: searchState.checkOut,
                adults: totalAdults,
                children: allChildren,
                residency: searchState.residency,
                roomConfigs: searchState.roomConfigs,
              }}
              onSelectHotel={hotel => setSelectedHotel(hotel)}
              onLoadMore={(newHotels, hasMore) => {
                setResults(prev => prev ? {
                  ...prev,
                  hotels: [...prev.hotels, ...newHotels],
                  hasMore
                } : prev)
              }}
            />
          </div>
        )}

        {results && results.hotels.length === 0 && !loading && !error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-2xl text-[var(--deep)] mb-2">Ingen hoteller funnet</h3>
              <p className="text-[var(--muted)]">Prøv å endre destinasjon eller datoer.</p>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Hotel detail modal */}
      {selectedHotel && searchState && (
        <HotelDetailModal
          hotelId={selectedHotel.hid ? "" : selectedHotel.id}
          hid={selectedHotel.hid}
          hotelName={selectedHotel.name}
          searchParams={{
            checkIn: searchState.checkIn,
            checkOut: searchState.checkOut,
            adults: totalAdults,
            children: allChildren,
            roomConfigs: searchState.roomConfigs,
            currency: "NOK",
            residency: searchState.residency,
          }}
          onClose={() => setSelectedHotel(null)}
          onBook={(room, hotelDetail) => {
            setBookingRoom(room)
            setBookingHotel(hotelDetail)
            setSelectedHotel(null)
          }}
        />
      )}

      {/* Booking modal */}
      {bookingRoom && bookingHotel && searchState && (
        <ErrorBoundary
          fallback={(err, reset) => (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60">
              <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                <p className="font-semibold text-red-600 mb-2">Noe gikk galt i bestillingen</p>
                <p className="text-xs text-[var(--muted)] mb-4 font-mono break-all">{err.message}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={reset} className="px-4 py-2 rounded-xl bg-[var(--coral)] text-white text-sm font-semibold hover:opacity-90">Prøv igjen</button>
                  <button onClick={() => { setBookingRoom(null); setBookingHotel(null); reset() }} className="px-4 py-2 rounded-xl border text-sm">Lukk</button>
                </div>
              </div>
            </div>
          )}
        >
          <HotelBookingModal
            room={bookingRoom}
            hotel={bookingHotel}
            searchParams={{
              checkIn: searchState.checkIn,
              checkOut: searchState.checkOut,
              adults: totalAdults,
              children: allChildren,
              roomCount: searchState.roomConfigs.length,
              roomConfigs: searchState.roomConfigs,
            }}
            onClose={() => {
              setBookingRoom(null)
              setBookingHotel(null)
            }}
          />
        </ErrorBoundary>
      )}
    </main>
  )
}

export default function HotellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--sand-light)] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--sand)] border-t-[var(--coral)] animate-spin" />
      </div>
    }>
      <HotellPageContent />
    </Suspense>
  )
}
