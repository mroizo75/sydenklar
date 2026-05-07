"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, MapPin, Calendar, Users, ChevronDown, Plus, Minus, Building2, Globe } from "lucide-react"
import { RateHawkDestination } from "@/lib/types"

interface RoomConfig {
  adults: number
  childAges: number[]
}

interface SearchFormData {
  destination: string
  destinationId: string
  destinationType: string
  checkIn: string
  checkOut: string
  roomConfigs: RoomConfig[]
  residency: string
}

interface HotelSearchFormProps {
  onSearch: (data: SearchFormData) => void
  loading?: boolean
  initialValues?: Partial<SearchFormData>
  compact?: boolean
}

const RESIDENCY_OPTIONS = [
  { value: "no", label: "Norge" },
  { value: "se", label: "Sverige" },
  { value: "dk", label: "Danmark" },
  { value: "fi", label: "Finland" },
  { value: "is", label: "Island" },
  { value: "gb", label: "Storbritannia" },
  { value: "de", label: "Tyskland" },
  { value: "fr", label: "Frankrike" },
  { value: "es", label: "Spania" },
  { value: "it", label: "Italia" },
  { value: "nl", label: "Nederland" },
  { value: "be", label: "Belgia" },
  { value: "at", label: "Østerrike" },
  { value: "ch", label: "Sveits" },
  { value: "pl", label: "Polen" },
  { value: "pt", label: "Portugal" },
  { value: "gr", label: "Hellas" },
  { value: "cz", label: "Tsjekkia" },
  { value: "hu", label: "Ungarn" },
  { value: "ro", label: "Romania" },
  { value: "tr", label: "Tyrkia" },
  { value: "ua", label: "Ukraina" },
  { value: "ru", label: "Russland" },
  { value: "us", label: "USA" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "nz", label: "New Zealand" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "Kina" },
  { value: "in", label: "India" },
  { value: "th", label: "Thailand" },
  { value: "sg", label: "Singapore" },
  { value: "ae", label: "UAE" },
  { value: "za", label: "Sør-Afrika" },
  { value: "br", label: "Brasil" },
  { value: "mx", label: "Mexico" },
  { value: "ar", label: "Argentina" },
  { value: "il", label: "Israel" },
  { value: "kr", label: "Sør-Korea" },
  { value: "eg", label: "Egypt" },
  { value: "ma", label: "Marokko" },
]

export default function HotelSearchForm({ onSearch, loading = false, initialValues, compact = false }: HotelSearchFormProps) {
  const [destination, setDestination] = useState(initialValues?.destination || "")
  const [destinationId, setDestinationId] = useState(initialValues?.destinationId || "")
  const [destinationType, setDestinationType] = useState(initialValues?.destinationType || "")
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn || "")
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut || "")
  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>(initialValues?.roomConfigs || [{ adults: 2, childAges: [] }])
  const [residency, setResidency] = useState(initialValues?.residency || "no")
  const [suggestions, setSuggestions] = useState<RateHawkDestination[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const destRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalGuests = roomConfigs.reduce((sum, r) => sum + r.adults + r.childAges.length, 0)
  const totalRooms = roomConfigs.length
  const guestLabel = `${totalGuests} gjest${totalGuests !== 1 ? "er" : ""}, ${totalRooms} rom`

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowSuggestions(false)
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) setShowGuestPicker(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data.destinations || [])
    } catch {
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    setDestinationId("")
    setDestinationType("")
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (/^\d{5,}$/.test(value.trim())) {
      setSuggestions([{ id: value.trim(), name: `Hotell-ID: ${value.trim()}`, type: "hotel", country: "Søk direkte" }])
      setShowSuggestions(true)
      return
    }

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleDestinationFocus = () => {
    if (destination.length >= 1) {
      setShowSuggestions(true)
      fetchSuggestions(destination)
    } else {
      fetchSuggestions("")
      setShowSuggestions(true)
    }
  }

  const selectDestination = (dest: RateHawkDestination) => {
    setDestination(dest.name + (dest.country ? `, ${dest.country}` : ""))
    setDestinationId(dest.id)
    setDestinationType(dest.type)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const updateRoom = (roomIndex: number, field: "adults" | "childAges", value: any) => {
    setRoomConfigs(prev => {
      const updated = [...prev]
      if (field === "adults") {
        updated[roomIndex] = { ...updated[roomIndex], adults: Math.max(1, value) }
      } else {
        updated[roomIndex] = { ...updated[roomIndex], childAges: value }
      }
      return updated
    })
  }

  const addRoom = () => {
    if (roomConfigs.length < 4) setRoomConfigs(prev => [...prev, { adults: 2, childAges: [] }])
  }

  const removeRoom = (index: number) => {
    if (roomConfigs.length > 1) setRoomConfigs(prev => prev.filter((_, i) => i !== index))
  }

  const addChild = (roomIndex: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev]
      if (updated[roomIndex].childAges.length < 4) {
        updated[roomIndex] = { ...updated[roomIndex], childAges: [...updated[roomIndex].childAges, 5] }
      }
      return updated
    })
  }

  const removeChild = (roomIndex: number, childIndex: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev]
      updated[roomIndex] = { ...updated[roomIndex], childAges: updated[roomIndex].childAges.filter((_, i) => i !== childIndex) }
      return updated
    })
  }

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    setRoomConfigs(prev => {
      const updated = [...prev]
      const newAges = [...updated[roomIndex].childAges]
      newAges[childIndex] = age
      updated[roomIndex] = { ...updated[roomIndex], childAges: newAges }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !checkIn || !checkOut) return
    const rawId = destination.trim()
    const isRawHotelId = /^\d{5,}$/.test(rawId) && !destinationId
    const resolvedType = destinationType || (isRawHotelId ? "hotel" : "")
    onSearch({
      destination,
      destinationId: destinationId || (isRawHotelId ? rawId : ""),
      destinationType: resolvedType,
      checkIn,
      checkOut,
      roomConfigs,
      residency,
    })
  }

  const getDestIcon = (type: string) => {
    if (type === "hotel") return <Building2 size={14} className="text-[var(--coral)]" />
    if (type === "city" || type === "region") return <Globe size={14} className="text-[var(--sea)]" />
    return <MapPin size={14} className="text-[var(--muted)]" />
  }

  /* Delt gjestevelger-panel — brukes i begge moduser */
  const GuestPickerPanel = () => (
    <div className="absolute top-full right-0 mt-1 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-xl shadow-2xl shadow-black/15 border border-[var(--border)] p-4 z-50">
      {roomConfigs.map((room, roomIdx) => (
        <div key={roomIdx} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Rom {roomIdx + 1}</p>
            {roomConfigs.length > 1 && (
              <button type="button" onClick={() => removeRoom(roomIdx)} className="text-xs text-red-400 hover:text-red-600">
                Fjern rom
              </button>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-[var(--deep)]">Voksne</p>
              <p className="text-xs text-[var(--muted)]">18+ år</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => updateRoom(roomIdx, "adults", room.adults - 1)}
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors">
                <Minus size={13} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-[var(--deep)]">{room.adults}</span>
              <button type="button" onClick={() => updateRoom(roomIdx, "adults", room.adults + 1)}
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--deep)]">Barn</p>
              <p className="text-xs text-[var(--muted)]">0–17 år</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => removeChild(roomIdx, room.childAges.length - 1)}
                disabled={room.childAges.length === 0}
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Minus size={13} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-[var(--deep)]">{room.childAges.length}</span>
              <button type="button" onClick={() => addChild(roomIdx)}
                disabled={room.childAges.length >= 4}
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--deep)] hover:border-[var(--coral)] hover:text-[var(--coral)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus size={13} />
              </button>
            </div>
          </div>

          {room.childAges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {room.childAges.map((age, childIdx) => (
                <select key={childIdx} value={age}
                  onChange={e => updateChildAge(roomIdx, childIdx, parseInt(e.target.value))}
                  className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 text-[var(--deep)] bg-white outline-none">
                  {Array.from({ length: 18 }, (_, i) => (
                    <option key={i} value={i}>{i === 0 ? "Under 1" : `${i} år`}</option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      ))}

      {roomConfigs.length < 4 && (
        <button type="button" onClick={addRoom}
          className="w-full mt-2 py-2 text-xs font-semibold text-[var(--sea)] hover:text-[var(--deep)] border border-dashed border-[var(--sea)]/40 rounded-lg transition-colors">
          + Legg til rom
        </button>
      )}

      <button type="button" onClick={() => setShowGuestPicker(false)}
        className="w-full mt-3 py-2 text-sm font-semibold bg-[var(--deep)] hover:bg-[var(--coral)] text-white rounded-xl transition-colors">
        Bekreft
      </button>
    </div>
  )

  /* ─────────────────────────────────────────────
     KOMPAKT-MODUS: tynn én-linje bar (resultatsiden)
  ───────────────────────────────────────────── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg shadow-black/10 px-2 py-1">
        <div className="flex items-center gap-0">

          {/* Destinasjon */}
          <div className="flex-[2] relative min-w-0" ref={destRef}>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <MapPin size={13} className="text-[var(--coral)] shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={e => handleDestinationChange(e.target.value)}
                onFocus={handleDestinationFocus}
                placeholder="Destinasjon"
                autoComplete="off"
                className="w-full text-[var(--deep)] text-sm font-semibold placeholder:text-[var(--muted)]/60 bg-transparent outline-none truncate"
                required
              />
              {loadingSuggestions && (
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--coral)] border-t-transparent animate-spin shrink-0" />
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl shadow-black/15 border border-[var(--border)] overflow-hidden z-50 max-h-64 overflow-y-auto">
                {suggestions.map((dest) => (
                  <button key={dest.id} type="button" onClick={() => selectDestination(dest)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--sand-light)] transition-colors text-left">
                    <div className="w-6 h-6 rounded-full bg-[var(--sand-light)] flex items-center justify-center shrink-0">
                      {getDestIcon(dest.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--deep)] truncate">{dest.name}</p>
                      {dest.country && <p className="text-xs text-[var(--muted)] truncate">{dest.country}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px bg-[var(--border)] self-stretch my-2 shrink-0" />

          {/* Innsjekk */}
          <div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
            <Calendar size={13} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light] w-[128px]"
              required
            />
          </div>

          <div className="w-px bg-[var(--border)] self-stretch my-2 shrink-0" />

          {/* Utsjekk */}
          <div className="flex items-center gap-2 px-3 py-2.5 shrink-0">
            <Calendar size={13} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light] w-[128px]"
              required
            />
          </div>

          <div className="w-px bg-[var(--border)] self-stretch my-2 shrink-0" />

          {/* Gjester */}
          <div className="relative shrink-0" ref={guestRef}>
            <button type="button" onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap">
              <Users size={13} className="text-[var(--muted)] shrink-0" />
              <span className="text-[var(--deep)] text-sm font-medium">{guestLabel}</span>
              <ChevronDown size={12} className={`text-[var(--muted)] transition-transform ${showGuestPicker ? "rotate-180" : ""}`} />
            </button>
            {showGuestPicker && <GuestPickerPanel />}
          </div>

          <div className="w-px bg-[var(--border)] self-stretch my-2 shrink-0" />

          {/* Pass – skjult på mobil */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2.5 shrink-0">
            <Globe size={13} className="text-[var(--muted)] shrink-0" />
            <select value={residency} onChange={e => setResidency(e.target.value)}
              className="text-[var(--deep)] text-sm font-medium bg-transparent outline-none cursor-pointer">
              {RESIDENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Søk-knapp */}
          <button type="submit"
            disabled={loading || !destination || !checkIn || !checkOut}
            className="flex items-center gap-1.5 bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 ml-1 whitespace-nowrap">
            {loading
              ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <Search size={15} />
            }
            <span className="hidden sm:inline">{loading ? "Søker..." : "Søk"}</span>
          </button>
        </div>
      </form>
    )
  }

  /* ─────────────────────────────────────────────
     NORMAL-MODUS: full form (forsiden / tom tilstand)
  ───────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-black/10 p-4">
      <div className="flex flex-col lg:flex-row gap-2">

        {/* Destinasjon */}
        <div className="flex-[2] relative" ref={destRef}>
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Destinasjon</span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <MapPin size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={e => handleDestinationChange(e.target.value)}
              onFocus={handleDestinationFocus}
              placeholder="Hvor vil du reise?"
              autoComplete="off"
              className="w-full text-[var(--deep)] text-sm font-medium placeholder:text-[var(--muted)]/70 bg-transparent outline-none"
              required
            />
            {loadingSuggestions && (
              <div className="w-3 h-3 rounded-full border-2 border-[var(--coral)] border-t-transparent animate-spin shrink-0" />
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl shadow-black/15 border border-[var(--border)] overflow-hidden z-50 max-h-72 overflow-y-auto">
              {suggestions.map((dest) => (
                <button key={dest.id} type="button" onClick={() => selectDestination(dest)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--sand-light)] transition-colors text-left group">
                  <div className="w-7 h-7 rounded-full bg-[var(--sand-light)] flex items-center justify-center shrink-0">
                    {getDestIcon(dest.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--deep)] truncate">{dest.name}</p>
                    {dest.country && (
                      <p className="text-xs text-[var(--muted)] truncate">
                        {dest.country} · {dest.type === "hotel" ? "Hotell" : dest.type === "city" ? "By" : "Region"}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Innsjekk */}
        <div className="flex-1">
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Innsjekk</span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <Calendar size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light]"
              required
            />
          </div>
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Utsjekk */}
        <div className="flex-1">
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Utsjekk</span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <Calendar size={15} className="text-[var(--muted)] shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none [color-scheme:light]"
              required
            />
          </div>
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Gjester */}
        <div className="flex-1 relative" ref={guestRef}>
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Gjester</span>
          </label>
          <button type="button" onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="flex items-center gap-2 px-4 pb-3 w-full text-left">
            <Users size={15} className="text-[var(--muted)] shrink-0" />
            <span className="flex-1 text-[var(--deep)] text-sm font-medium truncate">{guestLabel}</span>
            <ChevronDown size={13} className={`text-[var(--muted)] transition-transform ${showGuestPicker ? "rotate-180" : ""}`} />
          </button>
          {showGuestPicker && <GuestPickerPanel />}
        </div>

        <div className="w-px bg-[var(--border)] hidden lg:block self-stretch my-2" />

        {/* Nasjonalitet – desktop */}
        <div className="shrink-0 w-[130px] hidden lg:block">
          <label className="block px-3 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Pass</span>
          </label>
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <Globe size={13} className="text-[var(--muted)] shrink-0" />
            <select value={residency} onChange={e => setResidency(e.target.value)}
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none cursor-pointer truncate">
              {RESIDENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Nasjonalitet – mobil */}
        <div className="lg:hidden">
          <label className="block px-4 pt-3 pb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--coral)]">Nasjonalitet (pass)</span>
          </label>
          <div className="flex items-center gap-2 px-4 pb-3">
            <Globe size={15} className="text-[var(--muted)] shrink-0" />
            <select value={residency} onChange={e => setResidency(e.target.value)}
              className="w-full text-[var(--deep)] text-sm font-medium bg-transparent outline-none cursor-pointer">
              {RESIDENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Søk-knapp */}
        <button type="submit"
          disabled={loading || !destination || !checkIn || !checkOut}
          className="flex items-center justify-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-7 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-lg shadow-[var(--coral)]/25 whitespace-nowrap">
          {loading
            ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            : <Search size={18} />
          }
          <span>{loading ? "Søker..." : "Søk"}</span>
        </button>
      </div>
    </form>
  )
}
