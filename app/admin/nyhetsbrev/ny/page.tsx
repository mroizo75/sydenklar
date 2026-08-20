import { requireAdminUser } from '@/lib/admin-auth'
import { listEvents, createCampaign } from '@/lib/newsletter-db'
import { redirect } from 'next/navigation'
import type { NewsletterEvent, CampaignType, Section } from '@/lib/newsletter-types'

interface Props {
  searchParams: Promise<{ type?: string }>
}

const DEFAULT_WEEKLY_SECTIONS: Section[] = [
  {
    type: 'hero',
    destinationName: 'Barcelona',
    countryName: 'Spania',
    hotelCount: 1240,
  },
  {
    type: 'hotel_grid',
    title: 'Ukens topphotell',
    subtitle: 'Vår fremhevede anbefaling',
    hotels: [
      { name: 'Hotel Arts Barcelona', city: 'Barcelona', country: 'Spania', starRating: 5, pageUrl: 'https://www.sydenklar.no' },
      { name: 'W Barcelona', city: 'Barcelona', country: 'Spania', starRating: 5, pageUrl: 'https://www.sydenklar.no' },
      { name: 'Grand Hotel Central', city: 'Barcelona', country: 'Spania', starRating: 5, pageUrl: 'https://www.sydenklar.no' },
    ],
  },
  { type: 'trending_dests' },
  {
    type: 'travel_tip',
    headline: '💡 Bestill tidlig — spar opptil 30 %',
    body: 'Hoteller fyller seg raskt i høysesong. Bestiller du 60+ dager i forveien, kan du typisk spare mellom 20–30 % sammenlignet med siste liten-priser.',
  },
  {
    type: 'cta_block',
    title: 'Klar for neste reise?',
    description: 'Søk blant over 2 millioner hoteller i hele verden og finn den beste prisen for din neste reise.',
    ctaUrl: 'https://www.sydenklar.no/hoteller',
    ctaText: 'Søk hoteller nå',
    note: '✅ Ingen skjulte avgifter · 🔒 Sikker betaling · 📧 Bekreftelse på e-post',
  },
  { type: 'social_proof' },
]

const DEFAULT_EVENT_SECTIONS: Section[] = [
  {
    type: 'event_banner',
    eventName: 'OL Paris 2024',
    tagline: 'Opplev lekene fra beste utsiktspunkt — finn ditt hotell nær arenaene',
    heroImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85',
    themeColor: '#003087',
    ctaUrl: 'https://www.sydenklar.no/hoteller?destinasjon=Paris',
    ctaText: 'Se hoteller i Paris →',
  },
  {
    type: 'offer_highlight',
    title: 'Eksklusivt OL-tilbud: Paris sentrum',
    description: 'Begrenset antall rom nær Trocadéro og Place du Trocadéro. Inkluderer tidlig innsjekk og gratis frokost.',
    price: 'fra kr 1 490/natt',
    ctaUrl: 'https://www.sydenklar.no/hoteller?destinasjon=Paris',
    ctaText: 'Book nå →',
    badgeText: '🔥 Eksklusivt tilbud',
  },
  {
    type: 'hotel_grid',
    title: 'Anbefalte OL-hoteller',
    subtitle: 'Kuratert med tanke på beliggenhet og pris',
    hotels: [
      { name: 'Hôtel de Crillon', city: 'Paris', country: 'Frankrike', starRating: 5, pageUrl: 'https://www.sydenklar.no' },
      { name: 'Le Marais Hotel', city: 'Paris', country: 'Frankrike', starRating: 4, pageUrl: 'https://www.sydenklar.no' },
    ],
  },
  {
    type: 'cta_block',
    title: 'Ikke gå glipp av OL i Paris',
    description: 'Rommene går fort. Sikre deg et godt hotell nær arenaene mens det ennå er tilgjengelig.',
    ctaUrl: 'https://www.sydenklar.no/hoteller?destinasjon=Paris',
    ctaText: 'Finn hotell til OL →',
    note: '✅ Gratis avbestilling på utvalgte rom',
  },
  { type: 'social_proof' },
]

export default async function NyKampanjePage({ searchParams }: Props) {
  await requireAdminUser()
  const sp     = await searchParams
  const type   = (sp.type === 'event' ? 'event' : 'weekly') as CampaignType
  const events = await listEvents()

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }}>
        <a href="/admin/nyhetsbrev" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}>← Tilbake</a>
        <h1 style={{ margin: '12px 0 4px', fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>
          {type === 'event' ? '🎉 Ny event-kampanje' : '📅 Nytt ukentlig nyhetsbrev'}
        </h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
          {type === 'event'
            ? 'En skreddersydd kampanje for et spesielt event. Du kan redigere alle seksjoner og tema etterpå.'
            : 'Standard ukentlig nyhetsbrev med forhåndsutfylte seksjoner. Tilpass alt i editoren.'}
        </p>
      </div>

      <CreateCampaignForm type={type} events={events} defaultSections={type === 'event' ? DEFAULT_EVENT_SECTIONS : DEFAULT_WEEKLY_SECTIONS} />
    </div>
  )
}

async function handleCreate(formData: FormData) {
  'use server'
  const type     = formData.get('type') as CampaignType
  const name     = (formData.get('name') as string).trim()
  const subject  = (formData.get('subject') as string).trim()
  const eventId  = formData.get('eventId') as string | null
  const sections = JSON.parse(formData.get('sections') as string) as Section[]

  const campaign = await createCampaign({
    type,
    name,
    subject,
    sections,
    eventId:   eventId || undefined,
  })

  redirect(`/admin/nyhetsbrev/${campaign.id}`)
}

function CreateCampaignForm({ type, events, defaultSections }: { type: CampaignType; events: NewsletterEvent[]; defaultSections: Section[] }) {
  const now   = new Date()
  const week  = Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)
  const year  = now.getFullYear()

  const defaultName    = type === 'weekly' ? `Uke ${week + 1} · ${year}` : 'Event-kampanje'
  const defaultSubject = type === 'weekly'
    ? `Ukens reiseinspirasjon – uke ${week + 1}`
    : 'Spesialtilbud: [Event-navn]'

  return (
    <form action={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="sections" value={JSON.stringify(defaultSections)} />

      <Field label="Internt navn" hint="Brukes kun i admin-panelet">
        <input
          name="name"
          defaultValue={defaultName}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="E-post emne" hint="Emnefeltet abonnentene ser i innboksen">
        <input
          name="subject"
          defaultValue={defaultSubject}
          required
          style={inputStyle}
        />
      </Field>

      {type === 'event' && events.length > 0 && (
        <Field label="Koble til event (valgfritt)" hint="Kobler kampanjen til et event for statistikk">
          <select name="eventId" style={inputStyle}>
            <option value="">— Ikke koblet —</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </Field>
      )}

      <div style={{ paddingTop: '8px' }}>
        <button type="submit" style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          backgroundColor: '#0F1923', color: '#fff', fontSize: '15px', fontWeight: 700,
          border: 'none', cursor: 'pointer',
        }}>
          Opprett og gå til editor →
        </button>
      </div>
    </form>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#111827', fontSize: '14px', marginBottom: '4px' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 8px', color: '#6B7280', fontSize: '12px' }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontSize: '14px',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}
