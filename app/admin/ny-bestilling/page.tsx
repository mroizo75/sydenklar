'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { RateHawkHotel } from '@/lib/types'

const HotelMap = dynamic(() => import('@/components/hotels/HotelMap'), { ssr: false })

// ---- Types ----

interface Destination { id: string; name: string; type: string; country?: string }
interface Rate {
  id: string
  bookHash: string
  roomName: string
  boardType: string
  price: number
  currency: string
  freeCancellation: boolean
  freeCancellationBefore?: string | null
  paymentTypeRaw: Record<string, unknown>
  images: string[]
  sizeSqm: number | null
  view: string | null
  beddingDesc: string | null
  bathroomDesc: string | null
  capacity: number
  allotment: number
  amenities: string[]
  cancellationDeadline: string | null
}
interface HotelResult {
  id: string
  hid?: number
  name: string
  address: string
  rating: number
  price: { amount: number; currency: string }
  image: string
  amenities: string[]
  distance: string
  freeCancellation?: boolean
  lat?: number
  lng?: number
}

type Step = 'search' | 'rooms' | 'guest' | 'confirm'

const STEP_LABELS: Record<Step, string> = {
  search: '1. Søk',
  rooms: '2. Velg rom',
  guest: '3. Kundeinfo',
  confirm: '4. Send link',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtAmount(n: number, currency: string) {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}
function nightsBetween(a: string, b: string) {
  return Math.max(1, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}
function today() { return new Date().toISOString().slice(0, 10) }
function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }

// ---- Oversettelse RateHawk-termer → Norsk ----

const VIEW_NO: Record<string, string> = {
  'sea view': 'Havutsikt', 'ocean view': 'Havutsikt', 'sea': 'Havutsikt',
  'pool view': 'Bassengvisning', 'pool': 'Bassengvisning',
  'beach view': 'Strandutsikt', 'beach': 'Strandutsikt',
  'garden view': 'Hageutsikt', 'garden': 'Hageutsikt',
  'mountain view': 'Fjellutsikt', 'mountain': 'Fjellutsikt',
  'city view': 'Byutsikt', 'city': 'Byutsikt',
  'lake view': 'Innsjøutsikt', 'river view': 'Elveutsikt',
  'courtyard view': 'Gårdsplassutsikt', 'street view': 'Gateutsikt',
  'forest view': 'Skogsutsikt', 'park view': 'Parkutsikt',
  'no view': 'Ingen spesiell utsikt', 'inner courtyard view': 'Indre gårdutsikt',
}

const BED_NO: Record<string, string> = {
  'double bed': 'Dobbeltseng', 'double': 'Dobbeltseng',
  'twin beds': 'To enkeltsenger', 'twin': 'To enkeltsenger',
  'king size bed': 'King size-seng', 'king': 'King size-seng',
  'queen size bed': 'Queen size-seng', 'queen': 'Queen size-seng',
  'single bed': 'Enkeltseng', 'single': 'Enkeltseng',
  'bunk beds': 'Køyesenger', 'sofa bed': 'Sovesofa',
  'not guaranteed': 'Ikke garantert sengetype',
  'double or twin': 'Dobbelt- eller enkeltsenger',
}

const BATH_NO: Record<string, string> = {
  'private bathroom': 'Privat bad', 'private': 'Privat bad',
  'shared bathroom': 'Delt bad', 'shared': 'Delt bad',
  'ensuite': 'Eget bad (en-suite)',
  'shower only': 'Kun dusj', 'bath and shower': 'Badekar og dusj',
  'not guaranteed': 'Bad ikke garantert',
}

function toNO(map: Record<string, string>, raw: string | null): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim()
  return map[key] ?? raw
}

function isNotGuaranteed(val: string | null): boolean {
  return (val ?? '').toLowerCase().includes('not guaranteed')
}

// ---- Main component ----

export default function NyBestillingPage() {
  const [step, setStep] = useState<Step>('search')

  // Step 1 — søk
  const [destQuery, setDestQuery] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null)
  const [checkIn, setCheckIn] = useState(tomorrow())
  const [checkOut, setCheckOut] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10) })
  const [adults, setAdults] = useState(2)
  const [childAges, setChildAges] = useState<number[]>([])
  const [rooms, setRooms] = useState(1)
  const [searching, setSearching] = useState(false)
  const [hotels, setHotels] = useState<HotelResult[]>([])
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState('')

  // Step 2 — rom
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null)
  const [rates, setRates] = useState<Rate[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const ratesRef = useRef<HTMLDivElement>(null)

  // Step 3 — kunde
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [remarks, setRemarks] = useState('')

  // Step 4 — resultat
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [result, setResult] = useState<{ partnerOrderId: string; paymentUrl: string } | null>(null)

  // ---- Step 1: Destination search ----
  async function handleDestSearch(q: string) {
    setDestQuery(q)
    setSelectedDest(null)
    if (q.length < 2) { setDestinations([]); return }
    try {
      const res = await fetch(`/api/hotels/destinations?q=${encodeURIComponent(q)}`)
      if (!res.ok) return
      const data = await res.json()
      setDestinations(data.destinations ?? [])
    } catch {
      // ignorer nettverksfeil under søk
    }
  }

  async function handleSearch() {
    if (!selectedDest) { setSearchError('Velg et reisemål'); return }
    if (!checkIn || !checkOut || checkIn >= checkOut) { setSearchError('Sjekk inn/ut-datoer'); return }
    setSearchError('')
    setSearching(true)
    setHotels([])
    const res = await fetch('/api/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: selectedDest.id,
        destinationType: selectedDest.type,
        checkIn,
        checkOut,
        adults,
        children: childAges,
        rooms,
        currency: 'NOK',
      }),
    })
    const data = await res.json()
    setSearching(false)
    if (!data.success) { setSearchError(data.error ?? 'Søket feilet'); return }
    // Bevar alle felt fra API-svaret inkl. amenities, distance, freeCancellation, koordinater
    const mapped: HotelResult[] = (data.hotels ?? []).map((h: Record<string, unknown>) => ({
      id: h.id,
      hid: h.hid,
      name: h.name,
      address: h.address,
      rating: h.rating ?? 0,
      price: h.price,
      image: h.image,
      amenities: Array.isArray(h.amenities) ? h.amenities : [],
      distance: String(h.distance ?? ''),
      freeCancellation: Boolean(h.freeCancellation),
      lat: typeof h.lat === 'number' ? h.lat : undefined,
      lng: typeof h.lng === 'number' ? h.lng : undefined,
    }))
    setHotels(mapped.sort((a, b) => (a.price?.amount ?? 0) - (b.price?.amount ?? 0)))
    if (mapped.length === 0) setSearchError('Ingen hotell funnet. Prøv andre datoer eller reisemål.')
  }

  // ---- Step 2: Load hotel rates ----
  async function selectHotel(hotel: HotelResult) {
    setSelectedHotel(hotel)
    setSelectedRate(null)
    setRates([])
    setLoadingRates(true)
    setStep('rooms')
    setTimeout(() => ratesRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    const res = await fetch('/api/hotels/details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId: hotel.id, hid: hotel.hid, checkIn, checkOut, adults, children: childAges, rooms, currency: 'NOK' }),
    })
    const data = await res.json()
    setLoadingRates(false)
    if (!data.success || !data.hotel) { setRates([]); return }

    // API returnerer hotel.rooms (ikke .rates)
    const rawRooms: Record<string, unknown>[] = data.hotel.rooms ?? []

    const rawRates: Rate[] = rawRooms.flatMap((r) => {
      const paymentTypes = (r.payment_options as Record<string, unknown>)?.payment_types
      const types = Array.isArray(paymentTypes) ? paymentTypes as Record<string, unknown>[] : []
      if (types.length === 0) return []

      // Billigste betalingstype
      const best = [...types].sort((a, b) => parseFloat(String(a.amount ?? '0')) - parseFloat(String(b.amount ?? '0')))[0]
      const price = parseFloat(String(best.amount ?? '0'))
      if (!price || price <= 0) return []

      const mealData = r.meal_data as Record<string, unknown> ?? {}
      const boardType = mealData.has_all_inclusive ? 'All inclusive'
        : mealData.has_full_board ? 'Full pensjon'
        : mealData.has_half_board ? 'Halvpensjon'
        : mealData.has_breakfast ? 'Frokost inkludert'
        : 'Romonly'

      const cancelPolicies = (r.cancellation_penalties as Record<string, unknown>)?.policies
      const policies = Array.isArray(cancelPolicies) ? cancelPolicies as Record<string, unknown>[] : []
      const freeCancellation = policies.length > 0
        ? (parseFloat(String(policies[0].amount_charge ?? '1')) === 0)
        : false
      const cancellationDeadline = freeCancellation && policies[0]?.deadline_date
        ? String(policies[0].deadline_date)
        : null

      const images = Array.isArray(r.images)
        ? (r.images as string[]).filter(Boolean).slice(0, 6)
        : []

      return [{
        id: String(r.book_hash),
        bookHash: String(r.book_hash),
        roomName: String(r.room_name ?? 'Rom'),
        boardType,
        price,
        currency: String(best.currency_code ?? 'NOK'),
        freeCancellation,
        cancellationDeadline,
        paymentTypeRaw: best,
        images,
        sizeSqm: typeof r.size_sqm === 'number' ? r.size_sqm : null,
        view: typeof r.view === 'string' && r.view ? r.view : null,
        beddingDesc: typeof r.bedding_desc === 'string' && r.bedding_desc ? r.bedding_desc : null,
        bathroomDesc: typeof r.bathroom_desc === 'string' && r.bathroom_desc ? r.bathroom_desc : null,
        capacity: typeof r.capacity === 'number' ? r.capacity : 0,
        allotment: typeof r.allotment === 'number' ? r.allotment : 0,
        amenities: Array.isArray(r.amenities) ? (r.amenities as string[]).slice(0, 6) : [],
      }]
    })

    setRates(rawRates.sort((a, b) => a.price - b.price))
  }

  // ---- Step 4: Send payment link ----
  async function handleSend() {
    if (!selectedHotel || !selectedRate) return
    setSendError('')
    setSending(true)

    const res = await fetch('/api/admin/bookings/opprett', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookHash: selectedRate.bookHash,
        checkIn,
        checkOut,
        adults,
        children: childAges,
        rooms,
        currency: selectedRate.currency,
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        hotelAddress: selectedHotel.address,
        roomName: selectedRate.roomName,
        guestFirstName: firstName.trim(),
        guestLastName: lastName.trim(),
        guestEmail: email.trim().toLowerCase(),
        guestPhone: phone.trim(),
        remarks: remarks.trim(),
      }),
    })

    const data = await res.json()
    setSending(false)

    if (!res.ok || !data.ok) { setSendError(data.error ?? 'Noe gikk galt'); return }
    setResult({ partnerOrderId: data.partnerOrderId, paymentUrl: data.paymentUrl })
    setStep('confirm')
  }

  // Konverter til RateHawkHotel-format for HotelMap
  const mapHotels: RateHawkHotel[] = hotels.map(h => ({
    id: h.id,
    hid: h.hid,
    name: h.name,
    address: h.address,
    rating: h.rating,
    price: { amount: h.price.amount, currency: h.price.currency, perNight: false },
    image: h.image,
    images: [],
    amenities: h.amenities,
    distance: h.distance,
    freeCancellation: h.freeCancellation,
    lat: h.lat,
    lng: h.lng,
  }))

  const handleMapSelectHotel = useCallback((rh: RateHawkHotel) => {
    const hotel = hotels.find(h => h.id === rh.id)
    if (hotel) selectHotel(hotel)
  }, [hotels]) // eslint-disable-line react-hooks/exhaustive-deps

  const showMap = hotels.length > 0 && mapHotels.some(h => h.lat && h.lng)

  // ---- Render ----
  return (
    <div style={{ maxWidth: showMap ? '1400px' : '900px' }}>

      {/* Heading + steg-indikator */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>Ny bestilling for kunde</h1>
        <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '14px' }}>Søk, velg rom, fyll inn kundeinfo og send betalingslink.</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(Object.keys(STEP_LABELS) as Step[]).map(s => (
            <span key={s} style={{
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: step === s ? '#0F1923' : '#F3F4F6',
              color: step === s ? '#fff' : '#6B7280',
            }}>
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      {/* ---- STEG 1: SØKESKJEMA ---- */}
      <Section title="Søk etter hotell">
        {/* Rad 1: Reisemål + datoer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: '12px', marginBottom: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Label>Reisemål</Label>
            <input
              value={destQuery}
              onChange={e => handleDestSearch(e.target.value)}
              placeholder="By, region eller hotell…"
              style={inputStyle}
            />
            {destinations.length > 0 && !selectedDest && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '240px', overflowY: 'auto' }}>
                {destinations.slice(0, 8).map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDest(d); setDestQuery(d.name + (d.country ? `, ${d.country}` : '')); setDestinations([]) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderBottom: '1px solid #F3F4F6', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#111827' }}
                  >
                    <span style={{ fontWeight: 500 }}>{d.name}</span>
                    {d.country && <span style={{ color: '#9CA3AF', marginLeft: '6px' }}>{d.country}</span>}
                    <span style={{ float: 'right', fontSize: '11px', color: '#C9A84C', textTransform: 'uppercase' }}>{d.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label>Innsjekk</Label>
            <input type="date" min={today()} value={checkIn} onChange={e => setCheckIn(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Utsjekk</Label>
            <input type="date" min={checkIn} value={checkOut} onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Rad 2: Voksne + Barn + Rom */}
        <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 1fr', gap: '12px', alignItems: 'end', marginBottom: '12px' }}>
          <div>
            <Label>Voksne</Label>
            <select value={adults} onChange={e => setAdults(Number(e.target.value))} style={inputStyle}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <Label>Barn</Label>
            <select
              value={childAges.length}
              onChange={e => {
                const n = Number(e.target.value)
                setChildAges(prev => {
                  if (n > prev.length) return [...prev, ...Array(n - prev.length).fill(5)]
                  return prev.slice(0, n)
                })
              }}
              style={inputStyle}
            >
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <Label>Rom</Label>
            <select value={rooms} onChange={e => setRooms(Number(e.target.value))} style={inputStyle}>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {/* Barns aldre */}
          {childAges.length > 0 && (
            <div>
              <Label>Barns alder</Label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {childAges.map((age, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Barn {i + 1}:</span>
                    <select
                      value={age}
                      onChange={e => setChildAges(prev => prev.map((a, j) => j === i ? Number(e.target.value) : a))}
                      style={{ ...inputStyle, width: '64px', padding: '6px 8px' }}
                    >
                      {Array.from({ length: 18 }, (_, y) => (
                        <option key={y} value={y}>{y} år</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {searchError && <p style={{ margin: '0 0 10px', color: '#B91C1C', fontSize: '13px' }}>{searchError}</p>}
        <button onClick={handleSearch} disabled={searching} style={{ ...btnPrimary }}>
          {searching ? 'Søker…' : 'Søk etter hotell'}
        </button>
      </Section>

      {/* Søkeresultater — to-kolonne med kart */}
      {hotels.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: showMap ? '3fr 2fr' : '1fr', gap: '16px', alignItems: 'start' }}>
          <Section title={`${hotels.length} hotell — billigst først`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '480px', overflowY: 'auto' }}>
              {hotels.map(h => {
                const nights = nightsBetween(checkIn, checkOut)
                const total = h.price.amount
                const perNight = Math.round(total / nights)
                const isActive = selectedHotel?.id === h.id
                const isHovered = hoveredHotelId === h.id
                return (
                  <div
                    key={h.id}
                    onClick={() => selectHotel(h)}
                    onMouseEnter={() => setHoveredHotelId(h.id)}
                    onMouseLeave={() => setHoveredHotelId(null)}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${isActive ? '#0F1923' : isHovered ? '#C9A84C' : '#E5E7EB'}`,
                      backgroundColor: isActive ? '#F9FAFB' : '#fff',
                      cursor: 'pointer',
                      transition: 'border-color 0.12s',
                    }}>
                    {h.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.image} alt={h.name} style={{ width: '72px', height: '56px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ margin: '0 0 1px', fontWeight: 700, color: '#0F1923', fontSize: '13px', lineHeight: '1.3' }}>{h.name}</p>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, color: '#E5623E', fontWeight: 800, fontSize: '13px', whiteSpace: 'nowrap' }}>
                            {fmtAmount(total, h.price.currency)}
                          </p>
                          <p style={{ margin: 0, color: '#9CA3AF', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {fmtAmount(perNight, h.price.currency)}/natt
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', marginTop: '3px' }}>
                        {h.rating > 0 && <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 700 }}>{'★'.repeat(Math.min(5, Math.round(h.rating / 20)))}</span>}
                        {h.distance && <Tag>{h.distance}</Tag>}
                        {h.freeCancellation && <Tag color="#15803D">Gratis avb.</Tag>}
                        {h.amenities.slice(0, 3).map(a => <Tag key={a}>{a}</Tag>)}
                        {h.amenities.length > 3 && <span style={{ fontSize: '10px', color: '#9CA3AF' }}>+{h.amenities.length - 3}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Kart — høyre kolonne */}
          {showMap && (
            <div style={{ position: 'sticky', top: '80px', height: '420px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <HotelMap
                hotels={mapHotels}
                onSelectHotel={handleMapSelectHotel}
                hoveredHotelId={hoveredHotelId}
              />
            </div>
          )}
        </div>
      )}

      {/* ---- STEG 2: VELG ROM ---- */}
      {(step === 'rooms' || step === 'guest' || step === 'confirm') && selectedHotel && (
        <Section title={`Rom — ${selectedHotel.name}`} ref={ratesRef}>
          {loadingRates && <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Henter tilgjengelige rom…</p>}
          {!loadingRates && rates.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Ingen rom tilgjengelig. Prøv andre datoer.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
            {rates.map(r => {
              const nights = nightsBetween(checkIn, checkOut)
              const totalPrice = r.price
              const perNight = Math.round(totalPrice / nights)
              const isSelected = selectedRate?.id === r.id
              return (
                <div key={r.id} onClick={() => { setSelectedRate(r); setStep('guest') }} style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${isSelected ? '#0F1923' : '#E5E7EB'}`,
                  backgroundColor: isSelected ? '#F9FAFB' : '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.12s',
                }}>
                  {/* Lite thumbnail */}
                  {r.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.images[0]} alt={r.roomName} style={{ width: '64px', height: '50px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '64px', height: '50px', borderRadius: '5px', backgroundColor: '#F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '18px' }}>🛏</div>
                  )}
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0F1923', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.roomName}</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {r.boardType && <Tag>{r.boardType}</Tag>}
                      {r.sizeSqm != null && r.sizeSqm > 0 && <Tag>📐 {r.sizeSqm} m²</Tag>}
                      {r.view && <Tag>🪟 {toNO(VIEW_NO, r.view)}</Tag>}
                      {r.beddingDesc && (
                        isNotGuaranteed(r.beddingDesc)
                          ? <Tag color="#92400E">🛏 Sengetype ikke garantert</Tag>
                          : <Tag>🛏 {toNO(BED_NO, r.beddingDesc)}</Tag>
                      )}
                      {r.bathroomDesc && !isNotGuaranteed(r.bathroomDesc) && (
                        <Tag>🚿 {toNO(BATH_NO, r.bathroomDesc)}</Tag>
                      )}
                      {r.capacity > 0 && <Tag>👤 maks {r.capacity}</Tag>}
                      {r.freeCancellation && (
                        <Tag color="#15803D">
                          {r.cancellationDeadline
                            ? `Gratis avb. innen ${new Date(r.cancellationDeadline).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short' })}`
                            : 'Gratis avb.'}
                        </Tag>
                      )}
                      {r.allotment >= 2 && r.allotment <= 5 && (
                        <Tag color="#B91C1C">Kun {r.allotment} igjen!</Tag>
                      )}
                    </div>
                    {r.amenities.length > 0 && (
                      <p style={{ margin: '3px 0 0', color: '#9CA3AF', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.amenities.join(' · ')}
                      </p>
                    )}
                  </div>
                  {/* Pris */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 1px', fontWeight: 800, color: '#0F1923', fontSize: '15px', whiteSpace: 'nowrap' }}>
                      {fmtAmount(totalPrice, r.currency)}
                    </p>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {fmtAmount(perNight, r.currency)}/natt · {nights}n
                    </p>
                  </div>
                  {/* Valgt-markering */}
                  {isSelected && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0F1923', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ---- STEG 3: KUNDEINFO ---- */}
      {(step === 'guest' || step === 'confirm') && selectedRate && (
        <Section title="Kundeinfo">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Fornavn *" value={firstName} onChange={setFirstName} placeholder="Ola" />
            <Field label="Etternavn *" value={lastName} onChange={setLastName} placeholder="Nordmann" />
            <Field label="E-post *" value={email} onChange={setEmail} placeholder="kunde@eksempel.no" type="email" />
            <Field label="Telefon" value={phone} onChange={setPhone} placeholder="+47 123 45 678" />
          </div>
          <div style={{ marginTop: '14px' }}>
            <Label>Merknad til hotellet (valgfritt)</Label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="F.eks. sen innsjekk, allergier…"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {sendError && <p style={{ margin: '10px 0 0', color: '#B91C1C', fontSize: '13px' }}>{sendError}</p>}
          <button
            onClick={handleSend}
            disabled={sending || !firstName || !lastName || !email}
            style={{ ...btnPrimary, marginTop: '16px', backgroundColor: sending ? '#9CA3AF' : '#E5623E' }}
          >
            {sending ? 'Sender…' : `Send betalingslink til ${email || 'kunden'}`}
          </button>
        </Section>
      )}

      {/* ---- STEG 4: BEKREFTELSE ---- */}
      {step === 'confirm' && result && (
        <Section title="Betalingslink sendt!">
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#15803D', fontSize: '16px' }}>✅ E-post sendt til {email}</p>
            <p style={{ margin: '0', color: '#166534', fontSize: '13px' }}>
              Kunden mottar en e-post med betalingslink. Når de betaler, fullføres bookingen automatisk mot hotellet.
            </p>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', color: '#374151' }}>
              <tbody>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', width: '140px' }}>Bestillingsnr.</td><td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{result.partnerOrderId}</td></tr>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #E5E7EB' }}>Hotell</td><td style={{ borderTop: '1px solid #E5E7EB' }}>{selectedHotel?.name}</td></tr>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #E5E7EB' }}>Datoer</td><td style={{ borderTop: '1px solid #E5E7EB' }}>{fmtDate(checkIn)} → {fmtDate(checkOut)} ({nightsBetween(checkIn, checkOut)} netter)</td></tr>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #E5E7EB' }}>Gjester</td><td style={{ borderTop: '1px solid #E5E7EB' }}>{adults} voksne{childAges.length > 0 ? `, ${childAges.length} barn (${childAges.map(a => `${a}år`).join(', ')})` : ''}{rooms > 1 ? ` · ${rooms} rom` : ''}</td></tr>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #E5E7EB' }}>Gjest</td><td style={{ borderTop: '1px solid #E5E7EB' }}>{firstName} {lastName}</td></tr>
                <tr><td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #E5E7EB' }}>Beløp</td><td style={{ borderTop: '1px solid #E5E7EB', fontWeight: 700, color: '#0F1923' }}>{selectedRate && fmtAmount(selectedRate.price, selectedRate.currency)}</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnOutline }}>
              Åpne betalingsside →
            </a>
            <a href={`/admin/bestilling/${result.partnerOrderId}`} style={{ ...btnOutline }}>
              Se bestilling i admin
            </a>
            <button onClick={() => { setStep('search'); setResult(null); setSelectedHotel(null); setSelectedRate(null); setFirstName(''); setLastName(''); setEmail(''); setPhone('') }} style={btnOutline}>
              + Ny bestilling
            </button>
          </div>
        </Section>
      )}

    </div>
  )
}

// ---- Helpers ----

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontSize: '14px',
  backgroundColor: '#fff',
  color: '#111827',
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#0F1923',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
}

const btnOutline: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#fff',
  color: '#374151',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
}

import { forwardRef } from 'react'

const Section = forwardRef<HTMLDivElement, { title: string; children: React.ReactNode }>(
  function Section({ title, children }, ref) {
    return (
      <div ref={ref} style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#0F1923' }}>{title}</h2>
        {children}
      </div>
    )
  }
)

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {children}
    </label>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function Tag({ children, color = '#374151' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: color === '#15803D' ? '#DCFCE7' : '#F3F4F6', color }}>
      {children}
    </span>
  )
}
