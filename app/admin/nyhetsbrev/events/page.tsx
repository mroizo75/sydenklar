import { requireAdminUser } from '@/lib/admin-auth'
import { listEvents } from '@/lib/newsletter-db'
import { createEvent, updateEvent, deleteEvent } from '@/lib/newsletter-db'
import { revalidatePath } from 'next/cache'
import type { NewsletterEvent } from '@/lib/newsletter-types'
import Link from 'next/link'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function handleCreate(formData: FormData) {
  'use server'
  const name     = (formData.get('name') as string).trim()
  const slug     = (formData.get('slug') as string).trim()
  const start    = formData.get('startDate') as string
  const end      = formData.get('endDate') as string
  const color    = formData.get('themeColor') as string
  const heroUrl  = (formData.get('heroImageUrl') as string).trim()
  const tagline  = (formData.get('tagline') as string).trim()

  await createEvent({
    name, slug, startDate: start, endDate: end,
    themeColor: color || '#E5623E',
    heroImageUrl: heroUrl || undefined,
    tagline: tagline || undefined,
    active: false,
  })
  revalidatePath('/admin/nyhetsbrev/events')
}

async function handleToggleActive(formData: FormData) {
  'use server'
  const id     = formData.get('id') as string
  const active = formData.get('active') === 'true'
  await updateEvent(id, { active: !active })
  revalidatePath('/admin/nyhetsbrev/events')
}

async function handleDelete(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await deleteEvent(id)
  revalidatePath('/admin/nyhetsbrev/events')
}

export default async function EventsPage() {
  await requireAdminUser()
  const events = await listEvents()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <Link href="/admin/nyhetsbrev" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}>← Nyhetsbrev</Link>
          <h1 style={{ margin: '8px 0 4px', fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>🎉 Events</h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            Store events som OL, VM, Pride osv. Aktive events vises på forsiden og kan brukes i kampanjer.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* Event list */}
        <div>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0F1923' }}>
            Alle events ({events.length})
          </h2>

          {events.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: '28px' }}>🎉</p>
              <p style={{ margin: '0 0 4px', color: '#374151', fontWeight: 600 }}>Ingen events ennå</p>
              <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px' }}>Opprett ditt første event til høyre</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Create form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', position: 'sticky', top: '76px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F1923' }}>+ Nytt event</h3>
          </div>
          <form action={handleCreate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Navn">
              <input name="name" required placeholder="OL Paris 2024" style={inputStyle} />
            </Field>
            <Field label="Slug (URL-vennlig)" hint="Brukes internt og på forsiden">
              <input name="slug" required placeholder="ol-paris-2024" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Field label="Startdato">
                <input name="startDate" type="date" required style={inputStyle} />
              </Field>
              <Field label="Sluttdato">
                <input name="endDate" type="date" required style={inputStyle} />
              </Field>
            </div>
            <Field label="Temafarge">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" name="themeColor" defaultValue="#E5623E"
                  style={{ width: '40px', height: '34px', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '2px', cursor: 'pointer' }} />
                <input name="themeColorHex" placeholder="#E5623E" style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Field>
            <Field label="Hero-bilde URL (valgfritt)">
              <input name="heroImageUrl" placeholder="https://..." style={inputStyle} />
            </Field>
            <Field label="Tagline (valgfritt)">
              <input name="tagline" placeholder="Opplev lekene fra..." style={inputStyle} />
            </Field>
            <button type="submit" style={{ padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: '#0F1923', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Opprett event
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

function EventCard({ event }: { event: NewsletterEvent }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: `1px solid ${event.active ? event.themeColor + '44' : '#E5E7EB'}`,
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      {/* Color dot */}
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: event.themeColor + '22', border: `2px solid ${event.themeColor}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
        🎉
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '15px' }}>{event.name}</p>
          {event.active && (
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D' }}>AKTIV</span>
          )}
        </div>
        <p style={{ margin: 0, color: '#9CA3AF', fontSize: '12px' }}>
          {fmtDate(event.startDate)} → {fmtDate(event.endDate)}
          {event.tagline && ` · ${event.tagline}`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {/* Toggle active */}
        <form action={handleToggleActive}>
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="active" value={String(event.active)} />
          <button type="submit" style={{
            padding: '7px 14px', borderRadius: '6px', border: '1px solid',
            borderColor: event.active ? '#FCA5A5' : '#86EFAC',
            backgroundColor: event.active ? '#FEF2F2' : '#F0FDF4',
            color: event.active ? '#B91C1C' : '#15803D',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}>
            {event.active ? 'Deaktiver' : 'Aktiver'}
          </button>
        </form>

        {/* Delete */}
        <form action={handleDelete}>
          <input type="hidden" name="id" value={event.id} />
          <button type="submit" style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '12px', cursor: 'pointer' }}>
            Slett
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, color: '#111827', fontSize: '12px', marginBottom: '4px' }}>{label}</label>
      {hint && <p style={{ margin: '0 0 4px', color: '#9CA3AF', fontSize: '11px' }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB',
  fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none',
}
