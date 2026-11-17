import { supabase } from './supabase'
import { isFacilityId } from './hotel-preferences'

export type OfferKind = 'hotell' | 'transfer' | 'leiebil' | 'tog' | 'annet'
export type InquiryStatus = 'ny' | 'tilbud_sendt' | 'avsluttet'
export type Gear = 'automat' | 'manuell' | ''

export interface InquiryServices {
  hotell: boolean
  transfer: boolean
  transferPersons: number
  transferBags: number
  transferFrom: string
  transferTo: string
  leiebil: boolean
  leiebilPickup: string
  leiebilDropoff: string
  leiebilGear: Gear
  parkering: boolean
  aktivitet: boolean
  tog: boolean
  starsMin: number
  facilities: string[]
}

export interface TripInquiryInput {
  name: string
  email: string
  phone: string
  destination: string
  hotelName: string
  checkIn: string
  checkOut: string
  flexibleDates: boolean
  adults: number
  children: number
  childAges: string
  rooms: number
  budgetNok: number | null
  services: InquiryServices
  flightHelp: boolean
  departureAirport: string
  notes: string
}

export interface OfferLine {
  kind: OfferKind
  title: string
  detail: string
  priceNok: number
}

export interface TripOffer {
  intro: string
  validUntil: string
  lines: OfferLine[]
  flightNote: string
}

export interface TripInquiry extends TripInquiryInput {
  id: string
  status: InquiryStatus
  offer: TripOffer | null
  offerSentAt: string | null
  createdAt: string
}

export interface InquiryError {
  code: string
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const KINDS = new Set<OfferKind>(['hotell', 'transfer', 'leiebil', 'tog', 'annet'])

function clip(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function asBool(value: unknown): boolean {
  return value === true
}

function asInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseInquiryBody(body: unknown): { ok: true; data: TripInquiryInput } | { ok: false; error: InquiryError } {
  if (!isRecord(body)) {
    return { ok: false, error: { code: 'invalid_body', message: 'Ugyldig forespørsel' } }
  }

  const name = clip(body.name, 120)
  const email = clip(body.email, 200).toLowerCase()
  const phone = clip(body.phone, 40)
  const destination = clip(body.destination, 160)
  const hotelName = clip(body.hotelName, 160)
  const checkIn = clip(body.checkIn, 10)
  const checkOut = clip(body.checkOut, 10)
  const childAges = clip(body.childAges, 80)
  const notes = clip(body.notes, 4000)
  const departureAirport = clip(body.departureAirport, 80)

  if (!name || !email || !phone || !destination) {
    return { ok: false, error: { code: 'missing_fields', message: 'Navn, e-post, telefon og destinasjon er påkrevd' } }
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: { code: 'invalid_email', message: 'Ugyldig e-postadresse' } }
  }
  if (phone.replace(/\D/g, '').length < 8) {
    return { ok: false, error: { code: 'invalid_phone', message: 'Skriv et gyldig telefonnummer' } }
  }
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut) || checkOut <= checkIn) {
    return { ok: false, error: { code: 'invalid_dates', message: 'Utsjekk må være etter innsjekk' } }
  }

  const servicesRaw = isRecord(body.services) ? body.services : {}
  const gearRaw = clip(servicesRaw.leiebilGear, 20)
  const gear: Gear = gearRaw === 'automat' || gearRaw === 'manuell' ? gearRaw : ''
  const leiebil = asBool(body.leiebil) || asBool(servicesRaw.leiebil)
  const transfer = asBool(body.transfer) || asBool(servicesRaw.transfer)
  const tog = asBool(body.tog) || asBool(servicesRaw.tog)
  const starsMin = [3, 4, 5].includes(Number(body.starsMin ?? servicesRaw.starsMin))
    ? Number(body.starsMin ?? servicesRaw.starsMin)
    : 0
  const facilitySource = Array.isArray(body.facilities) ? body.facilities : servicesRaw.facilities
  const facilities = Array.isArray(facilitySource)
    ? facilitySource.filter((item): item is string => typeof item === 'string' && isFacilityId(item)).slice(0, 8)
    : []
  const hotell = body.hotell === undefined && servicesRaw.hotell === undefined
    ? true
    : asBool(body.hotell) || asBool(servicesRaw.hotell)

  const services: InquiryServices = {
    hotell,
    transfer,
    transferPersons: asInt(servicesRaw.transferPersons, 1, 1, 30),
    transferBags: asInt(servicesRaw.transferBags, 0, 0, 40),
    transferFrom: clip(servicesRaw.transferFrom, 160),
    transferTo: clip(servicesRaw.transferTo, 160),
    leiebil,
    leiebilPickup: clip(servicesRaw.leiebilPickup, 160),
    leiebilDropoff: clip(servicesRaw.leiebilDropoff, 160),
    leiebilGear: gear,
    parkering: asBool(servicesRaw.parkering),
    aktivitet: asBool(servicesRaw.aktivitet),
    tog,
    starsMin,
    facilities,
  }

  if (!services.hotell && !services.transfer && !services.leiebil && !services.tog) {
    return { ok: false, error: { code: 'no_service', message: 'Velg minst én ting vi skal hjelpe deg med' } }
  }

  let budgetNok: number | null = null
  if (body.budgetNok === '' || body.budgetNok === null || body.budgetNok === undefined) {
    return { ok: false, error: { code: 'invalid_budget', message: 'Skriv et budsjett' } }
  }
  const budget = asInt(body.budgetNok, 0, 0, 10_000_000)
  if (budget < 1000) {
    return { ok: false, error: { code: 'invalid_budget', message: 'Budsjettet må være minst 1 000 kr' } }
  }
  budgetNok = budget

  const flightHelp = asBool(body.flightHelp)
  const persons = asInt(body.persons ?? body.adults, 2, 1, 20)

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      destination,
      hotelName,
      checkIn,
      checkOut,
      flexibleDates: asBool(body.flexibleDates),
      adults: persons,
      children: body.persons == null ? asInt(body.children, 0, 0, 12) : 0,
      childAges,
      rooms: asInt(body.rooms, 1, 1, 8),
      budgetNok,
      services,
      flightHelp,
      departureAirport: flightHelp ? departureAirport : '',
      notes,
    },
  }
}

export function parseOfferBody(body: unknown): { ok: true; data: TripOffer } | { ok: false; error: InquiryError } {
  if (!isRecord(body) || !Array.isArray(body.lines)) {
    return { ok: false, error: { code: 'invalid_body', message: 'Ugyldig tilbud' } }
  }

  const lines: OfferLine[] = []
  for (const raw of body.lines) {
    if (!isRecord(raw)) continue
    const kind = clip(raw.kind, 20) as OfferKind
    if (!KINDS.has(kind)) {
      return { ok: false, error: { code: 'invalid_line', message: 'Fly kan ikke prises i tilbudet. Bruk feltet for formidling.' } }
    }
    const title = clip(raw.title, 160)
    const detail = clip(raw.detail, 500)
    const priceNok = asInt(raw.priceNok, 0, 0, 10_000_000)
    if (!title || priceNok < 1) {
      return { ok: false, error: { code: 'invalid_line', message: 'Hver linje trenger navn og pris over 0 kr' } }
    }
    lines.push({ kind, title, detail, priceNok })
  }

  if (lines.length === 0) {
    return { ok: false, error: { code: 'no_lines', message: 'Legg inn minst én tjeneste med pris' } }
  }

  const validUntil = clip(body.validUntil, 10)
  if (!DATE_RE.test(validUntil)) {
    return { ok: false, error: { code: 'invalid_valid_until', message: 'Velg en gyldig dato for tilbudet' } }
  }

  return {
    ok: true,
    data: {
      intro: clip(body.intro, 2000),
      validUntil,
      lines,
      flightNote: clip(body.flightNote, 1000),
    },
  }
}

export function offerTotal(offer: TripOffer): number {
  return offer.lines.reduce((sum, line) => sum + line.priceNok, 0)
}

function mapRow(row: Record<string, unknown>): TripInquiry {
  const services = isRecord(row.services) ? row.services : {}
  const offer = isRecord(row.offer) ? (row.offer as unknown as TripOffer) : null
  return {
    id: String(row.id),
    status: (row.status as InquiryStatus) || 'ny',
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    destination: String(row.destination ?? ''),
    hotelName: String(row.hotel_name ?? ''),
    checkIn: String(row.check_in ?? ''),
    checkOut: String(row.check_out ?? ''),
    flexibleDates: row.flexible_dates === true,
    adults: Number(row.adults ?? 2),
    children: Number(row.children ?? 0),
    childAges: String(row.child_ages ?? ''),
    rooms: Number(row.rooms ?? 1),
    budgetNok: row.budget_nok == null ? null : Number(row.budget_nok),
    services: {
      hotell: services.hotell === true,
      transfer: services.transfer === true,
      transferPersons: Number(services.transferPersons ?? 1),
      transferBags: Number(services.transferBags ?? 0),
      transferFrom: String(services.transferFrom ?? ''),
      transferTo: String(services.transferTo ?? ''),
      leiebil: services.leiebil === true,
      leiebilPickup: String(services.leiebilPickup ?? ''),
      leiebilDropoff: String(services.leiebilDropoff ?? ''),
      leiebilGear: services.leiebilGear === 'automat' || services.leiebilGear === 'manuell' ? services.leiebilGear : '',
      parkering: services.parkering === true,
      aktivitet: services.aktivitet === true,
      tog: services.tog === true,
      starsMin: [3, 4, 5].includes(Number(services.starsMin)) ? Number(services.starsMin) : 0,
      facilities: Array.isArray(services.facilities) ? services.facilities.filter((item): item is string => typeof item === 'string') : [],
    },
    flightHelp: row.flight_help === true,
    departureAirport: String(row.departure_airport ?? ''),
    notes: String(row.notes ?? ''),
    offer,
    offerSentAt: row.offer_sent_at ? String(row.offer_sent_at) : null,
    createdAt: String(row.created_at ?? ''),
  }
}

export async function createTripInquiry(input: TripInquiryInput): Promise<{ inquiry: TripInquiry | null; error: InquiryError | null }> {
  const { data, error } = await supabase
    .from('trip_inquiries')
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      destination: input.destination,
      hotel_name: input.hotelName || null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      flexible_dates: input.flexibleDates,
      adults: input.adults,
      children: input.children,
      child_ages: input.childAges || null,
      rooms: input.rooms,
      budget_nok: input.budgetNok,
      services: input.services,
      flight_help: input.flightHelp,
      departure_airport: input.departureAirport || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error || !data) {
    const missing = error?.code === '42P01' || error?.message?.includes('trip_inquiries')
    return {
      inquiry: null,
      error: {
        code: missing ? 'missing_table' : 'db_error',
        message: missing
          ? 'Forespørselstabellen er ikke opprettet ennå'
          : 'Kunne ikke lagre forespørselen',
      },
    }
  }

  return { inquiry: mapRow(data as Record<string, unknown>), error: null }
}

export async function listTripInquiries(): Promise<TripInquiry[]> {
  const { data, error } = await supabase
    .from('trip_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error || !data) return []
  return data.map(row => mapRow(row as Record<string, unknown>))
}

export async function getTripInquiry(id: string): Promise<TripInquiry | null> {
  const { data, error } = await supabase.from('trip_inquiries').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapRow(data as Record<string, unknown>)
}

export async function saveTripOffer(id: string, offer: TripOffer): Promise<TripInquiry | null> {
  const { data, error } = await supabase
    .from('trip_inquiries')
    .update({
      offer,
      status: 'tilbud_sendt',
      offer_sent_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return null
  return mapRow(data as Record<string, unknown>)
}

export function personCount(inquiry: Pick<TripInquiry, 'adults' | 'children'>): number {
  return inquiry.adults + inquiry.children
}

export function suggestedOfferLines(inquiry: TripInquiry): OfferLine[] {
  const lines: OfferLine[] = []
  const stay = `${inquiry.checkIn} til ${inquiry.checkOut}, ${personCount(inquiry)} personer`
  if (inquiry.services.hotell) {
    lines.push({
      kind: 'hotell',
      title: inquiry.hotelName || `Hotell i ${inquiry.destination}`,
      detail: stay,
      priceNok: 0,
    })
  }
  if (inquiry.services.transfer) {
    const bags = inquiry.services.transferBags ? `, ${inquiry.services.transferBags} kolli` : ''
    lines.push({
      kind: 'transfer',
      title: 'Flyplasstransfer',
      detail: `${inquiry.services.transferFrom || 'Flyplass'} → ${inquiry.services.transferTo || inquiry.hotelName || 'hotell'}, ${inquiry.services.transferPersons} personer${bags}`,
      priceNok: 0,
    })
  }
  if (inquiry.services.leiebil) {
    lines.push({
      kind: 'leiebil',
      title: 'Leiebil',
      detail: `${personCount(inquiry)} personer, ${inquiry.destination}`,
      priceNok: 0,
    })
  }
  if (inquiry.services.parkering) {
    lines.push({ kind: 'annet', title: 'Parkering', detail: inquiry.destination, priceNok: 0 })
  }
  if (inquiry.services.aktivitet) {
    lines.push({ kind: 'annet', title: 'Aktivitet', detail: 'Etter avtale', priceNok: 0 })
  }
  return lines
}

export function suggestedFlightNote(inquiry: TripInquiry): string {
  if (!inquiry.flightHelp) return ''
  const from = inquiry.departureAirport ? ` fra ${inquiry.departureAirport}` : ''
  return `Vi kan formidle fly${from} til ${inquiry.destination}. Flybilletten er en egen avtale med flyselskap eller reisebyrå og inngår ikke i beløpet under.`
}
