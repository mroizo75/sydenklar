"use client"

import { useState, useCallback, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { applyMarkup } from "@/lib/pricing"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { X, CheckCircle, AlertCircle, Loader2, Calendar, Users, AlertTriangle, CreditCard, Shield } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// --- Types ---

interface ChildGuest {
  firstName: string
  lastName: string
  age: number
}

interface RoomGuest {
  firstName: string
  lastName: string
}

interface Room {
  book_hash: string
  room_name: string
  meal_data: any
  daily_prices: any[]
  payment_options: any
  cancellation_penalties: any
  tax_data: any
  amenities: string[]
  allotment: number
  non_free_amenities?: string[]
  keys_pickup_instructions?: string | null
  size_sqm: number | null
}

interface Hotel {
  id: string
  name: string
  address: string
  image: string
  star_rating: number
}

interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  remarks: string
}

interface RoomConfig {
  adults: number
  childAges: number[]
}

interface HotelBookingModalProps {
  room: Room
  hotel: Hotel
  searchParams: {
    checkIn: string
    checkOut: string
    adults: number
    children: number[]
    roomCount?: number
    roomConfigs?: RoomConfig[]
  }
  onClose: () => void
}

type Step = "guest_info" | "prebook" | "price_changed" | "payment" | "booking" | "success" | "error" | "3ds"

// --- Stripe checkout inner form ---

function StripeCheckoutForm({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
}: {
  clientSecret: string
  amount: number
  currency: string
  onSuccess: (paymentIntentId: string) => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const formattedAmount = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/booking-bekreftelse` },
      redirect: "if_required",
    })

    if (error) {
      onError(error.message || "Betalingen feilet. Prøv igjen.")
      setProcessing(false)
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id)
    } else {
      onError("Uventet betalingsstatus. Kontakt support.")
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 border border-[var(--border)] rounded-xl bg-white">
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: {},
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)] bg-[var(--sand-light)] px-3 py-2.5 rounded-lg">
        <Shield size={13} className="text-green-600 shrink-0" />
        <span>Sikker betaling via Stripe · 256-bit kryptering</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark,#b5522e)] text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Behandler betaling...
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Betal {formattedAmount}
          </>
        )}
      </button>
    </form>
  )
}

// --- Main modal ---

export default function HotelBookingModal({ room, hotel, searchParams, onClose }: HotelBookingModalProps) {
  // Start in "prebook" — immediately verify availability and get p-hash before showing the form.
  // This way the user is never surprised by price changes after filling in their details.
  const [step, setStep] = useState<Step>("prebook")
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "", lastName: "", email: "", phone: "", remarks: ""
  })
  const [additionalRoomGuests, setAdditionalRoomGuests] = useState<RoomGuest[]>(
    searchParams.roomConfigs && searchParams.roomConfigs.length > 1
      ? Array.from({ length: searchParams.roomConfigs.length - 1 }, () => ({ firstName: "", lastName: "" }))
      : []
  )
  const [childGuests, setChildGuests] = useState<ChildGuest[]>(
    searchParams.children.map(age => ({ firstName: "", lastName: "", age }))
  )
  const [prebookData, setPrebookData] = useState<any>(null)
  const [priceChangedInfo, setPriceChangedInfo] = useState<{ oldAmount: number; newAmount: number; currency: string } | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [error, setError] = useState("")

  const nights = (() => {
    const d1 = new Date(searchParams.checkIn)
    const d2 = new Date(searchParams.checkOut)
    return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
  })()

  // Always derive price from prebook data if available, otherwise from room
  const STRIPE_SUPPORTED = new Set([
    'usd','aed','afn','all','amd','ang','aoa','ars','aud','awg','azn','bam','bbd','bdt','bgn',
    'bif','bmd','bnd','bob','brl','bsd','bwp','byn','bzd','cad','cdf','chf','clp','cny','cop',
    'crc','cve','czk','djf','dkk','dop','dzd','egp','etb','eur','fjd','fkp','gbp','gel','gip',
    'gmd','gnf','gtq','gyd','hkd','hnl','hrk','htg','huf','idr','ils','inr','isk','jmd','jpy',
    'kes','kgs','khr','kmf','krw','kyd','kzt','lak','lbp','lkr','lrd','lsl','mad','mdl','mga',
    'mkd','mmk','mnt','mop','mur','mvr','mwk','mxn','myr','mzn','nad','ngn','nio','nok','npr',
    'nzd','pab','pen','pgk','php','pkr','pln','pyg','qar','ron','rsd','rub','rwf','sar','sbd',
    'scr','sek','sgd','shp','sle','sos','srd','std','szl','thb','tjs','top','try','ttd','twd',
    'tzs','uah','ugx','uyu','uzs','vnd','vuv','wst','xaf','xcd','xcg','xof','xpf','yer','zar','zmw',
  ])

  const getPrice = useCallback((prebookOverride?: any) => {
    const data = prebookOverride ?? prebookData

    // Hjelpefunksjon: hent beste pris fra en payment_types-liste
    const bestFrom = (types: any[]) => {
      const sorted = [...types].sort(
        (a: any, b: any) => parseFloat(a.amount || "999999") - parseFloat(b.amount || "999999")
      )
      return {
        amount: parseFloat(sorted[0].amount || "0"),
        currency: (sorted[0].currency_code || "NOK") as string,
        type: (sorted[0].type || "now") as "deposit" | "now",
      }
    }

    // Romets opprinnelige pris (hentet med currency=NOK fra hotel details)
    const roomPaymentTypes = room.payment_options?.payment_types
    const roomPrice = roomPaymentTypes?.length ? bestFrom(roomPaymentTypes) : null

    if (data?.payment_types?.length) {
      const prebookPrice = bestFrom(data.payment_types)
      // Hvis prebook-valutaen ikke støttes av Stripe-NO → bruk romets NOK-pris
      if (!STRIPE_SUPPORTED.has(prebookPrice.currency.toLowerCase()) && roomPrice) {
        return roomPrice
      }
      return prebookPrice
    }

    if (roomPrice) return roomPrice
    return { amount: 0, currency: "NOK", type: "now" as const }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prebookData, room.payment_options?.payment_types])

  const price = getPrice()
  const customerTotal = applyMarkup(price.amount)
  const pricePerNight = nights > 0 ? Math.round(customerTotal / nights) : Math.round(customerTotal)

  const updateGuest = (field: keyof GuestInfo, value: string) =>
    setGuestInfo(prev => ({ ...prev, [field]: value }))

  const updateAdditionalGuest = (idx: number, field: keyof RoomGuest, value: string) =>
    setAdditionalRoomGuests(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))

  const updateChild = (idx: number, field: keyof ChildGuest, value: string | number) =>
    setChildGuests(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))

  // Run prebook immediately on modal open to get the p-hash and check availability/price
  // before the user fills in the booking form (certifier recommendation).
  useEffect(() => {
    const runPrebook = async () => {
      try {
        const res = await fetch("/api/hotels/prebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookHash: room.book_hash,
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.adults,
            children: searchParams.children,
            currency: price.currency,
          }),
        })
        const data = await res.json()
        if (data.success) {
          const prebook = data.prebookData
          if (prebook.price_changed) {
            const newNetAmount = parseFloat(prebook.payment_types?.[0]?.amount || "0")
            setPriceChangedInfo({
              oldAmount: applyMarkup(price.amount),
              newAmount: applyMarkup(newNetAmount),
              currency: price.currency,
            })
            setPrebookData(prebook)
            setStep("price_changed")
          } else {
            setPrebookData(prebook)
            setStep("guest_info")
          }
        } else {
          setError(data.error || "Prebooking feilet")
          setStep("error")
        }
      } catch {
        setError("En feil oppsto. Prøv igjen.")
        setStep("error")
      }
    }
    runPrebook()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Steg: bruker har fylt inn gjestinfo → gå til betaling
  const handlePrebook = async () => {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      setError("Vennligst fyll inn all gjesteinformasjon")
      return
    }
    const missingAdditionalGuest = additionalRoomGuests.find(g => !g.firstName || !g.lastName)
    if (missingAdditionalGuest) {
      setError("Vennligst fyll inn navn på lead-gjest for hvert rom")
      return
    }
    const missingChildName = childGuests.find(c => !c.firstName || !c.lastName)
    if (missingChildName) {
      setError("Vennligst fyll inn navn på alle barn")
      return
    }
    setError("")
    await initializePayment(prebookData)
  }

  // Init Stripe PaymentIntent — kunden betaler nettopris + bestillingsgebyr
  const initializePayment = async (prebook: any) => {
    const confirmedPrice = getPrice(prebook)
    const customerAmount = applyMarkup(confirmedPrice.amount)
    try {
      const res = await fetch("/api/hotels/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: customerAmount,
          currency: confirmedPrice.currency,
          partnerOrderId: prebook.partner_order_id || `SYDENKLAR_${Date.now()}`,
          hotelName: hotel.name,
          guestEmail: guestInfo.email,
        }),
      })
      const data = await res.json()
      if (!data.clientSecret) throw new Error(data.error || "Kunne ikke opprette betaling")
      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setStep("payment")
    } catch (err: any) {
      setError(err.message || "Kunne ikke starte betaling. Prøv igjen.")
      setStep("error")
    }
  }

  // Accept price change → continue to payment
  const handleAcceptPriceChange = async () => {
    if (!prebookData) return
    await initializePayment(prebookData)
  }

  // Stripe payment succeeded → RateHawk finishBooking
  const handlePaymentSuccess = async (stripePaymentIntentId: string) => {
    setPaymentIntentId(stripePaymentIntentId)
    await handleFinishBooking(prebookData!, stripePaymentIntentId)
  }

  const handleFinishBooking = async (prebook: any, stripePaymentId: string) => {
    setStep("booking")
    try {
      const bookHash: string = prebook?.book_hash
      if (!bookHash || typeof bookHash !== "string" || bookHash.trim().length < 4) {
        setError("Booking-hash mangler. Prøv å velge rommet på nytt.")
        setStep("error")
        return
      }

      const confirmedPrice = getPrice(prebook)
      const partnerOrderId = prebook?.partner_order_id || `SYDENKLAR_${Date.now()}`

      // netAmount → trekkes fra RateHawk-deposit
      // customerAmount → hva kunden betalte via Stripe (lagres i DB og vises i e-post)
      const netAmount = confirmedPrice.amount
      const customerAmount = applyMarkup(netAmount)

      const res = await fetch("/api/hotels/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerOrderId,
          bookHash,
          guestInfo: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone,
          },
          additionalRoomGuests,
          childGuests: childGuests.map(c => ({ firstName: c.firstName, lastName: c.lastName, age: c.age })),
          roomConfigs: searchParams.roomConfigs ?? [],
          paymentType: {
            type: confirmedPrice.type,
            amount: netAmount.toFixed(2),         // nettopris → RateHawk
            currency_code: confirmedPrice.currency,
          },
          stripePaymentIntentId: stripePaymentId,
          remarks: guestInfo.remarks,
          hotelId: hotel.id,
          hotelName: hotel.name,
          hotelAddress: hotel.address,
          roomName: room.room_name,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          adults: searchParams.adults,
          children: searchParams.children.length,
          roomCount: searchParams.roomCount ?? 1,
          amount: customerAmount,                 // kundepris → DB og e-post
          currency: confirmedPrice.currency,
          upsellData: prebook?.upsell_data ?? null,
          nonFreeAmenities: room.non_free_amenities ?? [],
          keysPickupInstructions: room.keys_pickup_instructions ?? null,
          cancellationPolicy: (() => {
            const policies = room.cancellation_penalties?.policies
            if (!policies?.length) return undefined
            const first = policies[0]
            if (first.amount_charge === '0' || first.amount_charge === 0) {
              return first.deadline
                ? `Gratis avbestilling frem til ${new Date(first.deadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Gratis avbestilling'
            }
            return first.deadline
              ? `Ikke-refunderbar etter ${new Date(first.deadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Ikke-refunderbar'
          })(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        if (data.booking?.requires3DS && data.booking?.data3DS) {
          setBookingResult(data.booking)
          setStep("3ds")
        } else {
          setBookingResult(data.booking)
          setStep("success")
        }
      } else {
        setError(data.error || "Booking feilet")
        setStep("error")
      }
    } catch {
      setError("En feil oppsto under booking. Kontakt support.")
      setStep("error")
    }
  }

  const inputClass = "w-full border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--deep)] outline-none focus:border-[var(--coral)] transition-colors bg-white"

  const formattedAmount = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format(customerTotal)

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === "success" ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-display text-lg text-[var(--deep)]">
            {step === "success" ? "Booking bekreftet" :
             step === "error" ? "Booking feilet" :
             step === "price_changed" ? "Prisendring" :
             step === "payment" ? "Sikker betaling" :
             step === "3ds" ? "3D Secure påkrevd" :
             step === "prebook" || step === "booking" ? "Behandler..." :
             "Fullfør booking"}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[var(--sand-light)] hover:bg-[var(--sand)] flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[82vh]">
          {/* Booking-sammendrag (vises på alle steg unntatt success/error) */}
          {step !== "success" && step !== "error" && step !== "price_changed" && (
            <div className="bg-[var(--sand-light)] px-6 py-4 border-b border-[var(--border)]">
              <div className="flex flex-col sm:flex-row gap-3">
                {hotel.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hotel.image} alt={hotel.name} className="w-full sm:w-20 h-32 sm:h-16 rounded-xl object-cover shrink-0" />
                )}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--deep)] text-sm truncate">{hotel.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-[var(--muted)] truncate">{room.room_name}</p>
                      {room.allotment >= 2 && room.allotment <= 5 && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">
                          Kun {room.allotment} igjen!
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Calendar size={11} />
                        {new Date(searchParams.checkIn).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} –{" "}
                        {new Date(searchParams.checkOut).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Users size={11} />
                        {searchParams.roomConfigs && searchParams.roomConfigs.length > 1
                          ? `${searchParams.roomConfigs.length} rom · ${searchParams.roomConfigs.map(r => {
                              const total = r.adults + r.childAges.length
                              return `${total} gjest${total !== 1 ? "er" : ""}`
                            }).join(" + ")}`
                          : `${searchParams.adults} voksne${searchParams.children.length > 0 ? `, ${searchParams.children.length} barn` : ""}`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-display text-xl text-[var(--deep)]">{pricePerNight.toLocaleString("nb-NO")}</p>
                    <p className="text-xs text-[var(--muted)]">{price.currency}/natt</p>
                    <p className="text-xs font-semibold text-[var(--coral)] mt-0.5">{formattedAmount} tot.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEG: Gjesteinformasjon */}
          {step === "guest_info" && (
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Hovedgjest</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Fornavn *</label>
                  <input type="text" value={guestInfo.firstName} onChange={e => updateGuest("firstName", e.target.value)} placeholder="Kari" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Etternavn *</label>
                  <input type="text" value={guestInfo.lastName} onChange={e => updateGuest("lastName", e.target.value)} placeholder="Nordmann" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">E-post *</label>
                <input type="email" value={guestInfo.email} onChange={e => updateGuest("email", e.target.value)} placeholder="kari@eksempel.no" className={inputClass} />
                <p className="text-xs text-[var(--muted)] mt-1">Bookingbekreftelse sendes hit</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Telefon *</label>
                <input type="tel" value={guestInfo.phone} onChange={e => updateGuest("phone", e.target.value)} placeholder="+47 900 00 000" className={inputClass} />
              </div>

              {/* Lead-gjest per ekstra rom */}
              {additionalRoomGuests.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Gjester per rom</p>
                  <div className="p-3 bg-[var(--sand-light)] rounded-xl">
                    <p className="text-xs font-semibold text-[var(--deep)] mb-1">
                      Rom 1 — {searchParams.roomConfigs?.[0]?.adults ?? searchParams.adults} voksne
                      {searchParams.roomConfigs?.[0]?.childAges?.length ? `, ${searchParams.roomConfigs[0].childAges.length} barn` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{guestInfo.firstName || "–"} {guestInfo.lastName || ""} (Hovedgjest)</p>
                  </div>
                  {additionalRoomGuests.map((guest, idx) => {
                    const romConfig = searchParams.roomConfigs?.[idx + 1]
                    return (
                      <div key={idx} className="space-y-2 p-3 bg-[var(--sand-light)] rounded-xl">
                        <p className="text-xs font-semibold text-[var(--deep)]">
                          Rom {idx + 2} — {romConfig?.adults ?? "?"} voksne
                          {romConfig?.childAges?.length ? `, ${romConfig.childAges.length} barn` : ""}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-[var(--deep)] mb-1">Fornavn *</label>
                            <input
                              type="text"
                              value={guest.firstName}
                              onChange={e => updateAdditionalGuest(idx, "firstName", e.target.value)}
                              placeholder="Fornavn"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--deep)] mb-1">Etternavn *</label>
                            <input
                              type="text"
                              value={guest.lastName}
                              onChange={e => updateAdditionalGuest(idx, "lastName", e.target.value)}
                              placeholder="Etternavn"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {childGuests.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Barn</p>
                  {childGuests.map((child, idx) => (
                    <div key={idx} className="space-y-2 p-3 bg-[var(--sand-light)] rounded-xl">
                      <p className="text-xs font-medium text-[var(--muted)]">Barn {idx + 1} ({child.age} år)</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={child.firstName}
                          onChange={e => updateChild(idx, "firstName", e.target.value)}
                          placeholder="Fornavn"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={child.lastName}
                          onChange={e => updateChild(idx, "lastName", e.target.value)}
                          placeholder="Etternavn"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Spesielle ønsker (valgfritt)</label>
                <textarea
                  value={guestInfo.remarks}
                  onChange={e => updateGuest("remarks", e.target.value)}
                  placeholder="Allergier, spesielle ønsker..."
                  rows={2}
                  className={inputClass + " resize-none"}
                />
              </div>

              {room.non_free_amenities && room.non_free_amenities.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">Tillegg mot betaling</p>
                  <p className="text-xs text-amber-700 mb-2">Følgende tjenester er ikke inkludert i prisen og betales direkte på hotellet:</p>
                  <ul className="space-y-1">
                    {room.non_free_amenities.map((amenity, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-amber-900">
                        <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {room.keys_pickup_instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-800 mb-1.5">Nøkkelutlevering</p>
                  <p className="text-xs text-blue-900 leading-relaxed">{room.keys_pickup_instructions}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                onClick={handlePrebook}
                className="w-full bg-[var(--coral)] hover:opacity-90 text-white rounded-xl py-3.5 font-semibold text-sm transition-opacity"
              >
                Fortsett til betaling →
              </button>
            </div>
          )}

          {/* STEG: Laster / prebook */}
          {(step === "prebook" || step === "booking") && (
            <div className="px-6 py-12 text-center">
              <Loader2 size={36} className="animate-spin text-[var(--coral)] mx-auto mb-4" />
              <p className="text-[var(--deep)] font-medium">
                {step === "prebook" ? "Bekrefter tilgjengelighet..." : "Fullfører booking..."}
              </p>
              <p className="text-sm text-[var(--muted)] mt-2">Vennligst ikke lukk dette vinduet</p>
            </div>
          )}

          {/* STEG: Prisendring */}
          {step === "price_changed" && priceChangedInfo && (
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Prisen har endret seg</p>
                  <p className="text-amber-800 text-sm mt-1">
                    Siden du la inn søket har prisen endret seg fra{" "}
                    <span className="line-through">{priceChangedInfo.oldAmount.toLocaleString("nb-NO")} {priceChangedInfo.currency}</span>{" "}
                    til <span className="font-bold">{priceChangedInfo.newAmount.toLocaleString("nb-NO")} {priceChangedInfo.currency}</span>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-[var(--border)] text-[var(--deep)] rounded-xl py-3 text-sm font-medium hover:bg-[var(--sand-light)] transition-colors">
                  Avbryt
                </button>
                <button onClick={handleAcceptPriceChange} className="flex-1 bg-[var(--coral)] text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                  Godta ny pris
                </button>
              </div>
            </div>
          )}

          {/* STEG: Stripe betaling */}
          {step === "payment" && clientSecret && (
            <div className="px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Betalingsinformasjon</p>
              <Elements
                key={clientSecret}
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: "nb",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#c8623a",
                      borderRadius: "10px",
                      fontFamily: "inherit",
                    },
                  },
                }}
              >
                <StripeCheckoutForm
                  clientSecret={clientSecret}
                  amount={customerTotal}
                  currency={price.currency}
                  onSuccess={handlePaymentSuccess}
                  onError={(msg) => { setError(msg); setStep("error") }}
                />
              </Elements>
            </div>
          )}

          {/* STEG: 3DS påkrevd */}
          {step === "3ds" && bookingResult?.data3DS && (
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">3D Secure bekreftelses er påkrevd</p>
                  <p className="text-blue-800 text-sm mt-1">Banken din krever ekstra bekreftelse. Du vil bli sendt videre for å bekrefte betalingen.</p>
                </div>
              </div>
              {bookingResult.data3DS?.url && (
                <a
                  href={bookingResult.data3DS.url}
                  className="block w-full bg-blue-600 text-white text-center rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  Bekreft betaling →
                </a>
              )}
            </div>
          )}

          {/* STEG: Suksess */}
          {step === "success" && (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="font-display text-2xl text-[var(--deep)] mb-2">Booking bekreftet!</h3>
              <p className="text-[var(--muted)] text-sm mb-1">Bekreftelse sendes til <strong>{guestInfo.email}</strong></p>
              {bookingResult?.orderId && (
                <p className="text-xs text-[var(--muted)] mb-5">Ordrenr: <span className="font-mono font-semibold">{bookingResult.orderId}</span></p>
              )}

              <div className="bg-[var(--sand-light)] rounded-xl p-4 text-left mb-5 space-y-2">
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-[var(--muted)] shrink-0">Hotell</span>
                  <span className="font-medium text-[var(--deep)] text-right truncate max-w-[60%]">{hotel.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Innsjekk</span>
                  <span className="font-medium text-[var(--deep)]">
                    {new Date(searchParams.checkIn).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Utsjekk</span>
                  <span className="font-medium text-[var(--deep)]">
                    {new Date(searchParams.checkOut).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-[var(--border)] pt-2 mt-2">
                  <span className="text-[var(--muted)]">Totalt betalt</span>
                  <span className="font-semibold text-[var(--deep)]">{formattedAmount}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const ref = prebookData?.partner_order_id || bookingResult?.partnerOrderId
                  window.location.href = `/booking-bekreftelse${ref ? `?ref=${ref}` : ""}`
                }}
                className="w-full bg-[var(--coral)] text-white rounded-xl py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
              >
                Se bookingdetaljer
              </button>
              <button onClick={onClose} className="w-full text-[var(--muted)] text-sm hover:text-[var(--deep)] transition-colors">
                Lukk
              </button>
            </div>
          )}

          {/* STEG: Feil */}
          {step === "error" && (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="font-display text-xl text-[var(--deep)] mb-2">Noe gikk galt</h3>
              <p className="text-[var(--muted)] text-sm mb-6">{error || "Booking feilet. Prøv igjen eller kontakt support."}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("guest_info"); setError("") }}
                  className="flex-1 border border-[var(--border)] text-[var(--deep)] rounded-xl py-3 text-sm font-medium hover:bg-[var(--sand-light)] transition-colors"
                >
                  Prøv igjen
                </button>
                <button onClick={onClose} className="flex-1 bg-[var(--coral)] text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
