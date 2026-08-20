import { requireAdminUser } from '@/lib/admin-auth'
import { listCampaigns } from '@/lib/newsletter-db'
import Link from 'next/link'
import type { NewsletterCampaign } from '@/lib/newsletter-types'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Utkast',    bg: '#F3F4F6', color: '#374151' },
  scheduled: { label: 'Planlagt', bg: '#DBEAFE', color: '#1D4ED8' },
  sent:      { label: 'Sendt',    bg: '#DCFCE7', color: '#15803D' },
  cancelled: { label: 'Kansellert', bg: '#FEE2E2', color: '#B91C1C' },
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  weekly: { label: 'Ukentlig', bg: '#FEF9C3', color: '#A16207' },
  event:  { label: 'Event',    bg: '#EDE9FE', color: '#7C3AED' },
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Badge({ value, map }: { value: string; map: Record<string, { label: string; bg: string; color: string }> }) {
  const c = map[value] ?? { label: value, bg: '#F3F4F6', color: '#374151' }
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

function statsFor(campaigns: NewsletterCampaign[]) {
  return {
    total:     campaigns.length,
    drafts:    campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    sent:      campaigns.filter(c => c.status === 'sent').length,
    reached:   campaigns.filter(c => c.status === 'sent').reduce((s, c) => s + (c.recipientCount ?? 0), 0),
  }
}

export default async function NyhetsbrevPage() {
  await requireAdminUser()
  const campaigns = await listCampaigns()
  const stats     = statsFor(campaigns)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>Nyhetsbrev</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>{stats.total} kampanjer totalt</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/nyhetsbrev/events" style={{
            padding: '10px 18px', borderRadius: '8px', border: '1px solid #E5E7EB',
            backgroundColor: '#fff', color: '#374151', fontSize: '14px', fontWeight: 500,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            🎉 Events
          </Link>
          <Link href="/admin/nyhetsbrev/ny?type=weekly" style={{
            padding: '10px 18px', borderRadius: '8px', backgroundColor: '#0F1923',
            color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            + Ny kampanje
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Totalt" value={stats.total}     color="#0F1923" />
        <StatCard label="Utkast" value={stats.drafts}    color="#6B7280" />
        <StatCard label="Planlagt" value={stats.scheduled} color="#1D4ED8" />
        <StatCard label="Sendt"  value={stats.sent}      color="#15803D" />
        <StatCard label="Abonnenter nådd" value={stats.reached.toLocaleString('nb-NO')} color="#C9A84C" wide />
      </div>

      {/* Quick create */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <QuickCreateCard
          href="/admin/nyhetsbrev/ny?type=weekly"
          icon="📅"
          title="Ukentlig nyhetsbrev"
          description="Standard ukentlig utsendelse med destinasjon, hoteller og tips. Standardseksjoner legges til automatisk."
          accent="#C9A84C"
        />
        <QuickCreateCard
          href="/admin/nyhetsbrev/ny?type=event"
          icon="🎉"
          title="Event-kampanje"
          description="Skreddersydd for store events som OL, VM, Pride. Eget tema, egne seksjoner og valgfri dato."
          accent="#7C3AED"
        />
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
          <p style={{ margin: 0, color: '#374151', fontSize: '16px', fontWeight: 600 }}>Ingen kampanjer ennå</p>
          <p style={{ margin: '6px 0 24px', color: '#9CA3AF', fontSize: '14px' }}>Opprett din første kampanje for å komme i gang</p>
          <Link href="/admin/nyhetsbrev/ny?type=weekly" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: '8px',
            backgroundColor: '#0F1923', color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
          }}>
            Opprett kampanje
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Navn', 'Type', 'Emne', 'Seksjoner', 'Planlagt', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < campaigns.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{c.name}</p>
                    {c.sentAt && (
                      <p style={{ margin: '2px 0 0', color: '#9CA3AF', fontSize: '12px' }}>
                        Sendt til {c.recipientCount?.toLocaleString('nb-NO') ?? '?'} abonnenter
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge value={c.type} map={TYPE_CONFIG} />
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151', maxWidth: '220px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {c.subject}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {c.sections.length} seksjon{c.sections.length !== 1 ? 'er' : ''}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151', whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {c.status === 'sent' ? fmtDate(c.sentAt) : fmtDate(c.scheduledAt)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge value={c.status} map={STATUS_CONFIG} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.status !== 'sent' ? (
                      <Link href={`/admin/nyhetsbrev/${c.id}`} style={{ color: '#E5623E', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Rediger →
                      </Link>
                    ) : (
                      <Link href={`/admin/nyhetsbrev/${c.id}`} style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Se detaljer →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, wide }: { label: string; value: number | string; color: string; wide?: boolean }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '20px', gridColumn: wide ? 'span 2' : undefined }}>
      <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color }}>{typeof value === 'number' ? value.toLocaleString('nb-NO') : value}</p>
    </div>
  )
}

function QuickCreateCard({ href, icon, title, description, accent }: { href: string; icon: string; title: string; description: string; accent: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${accent}33`, padding: '24px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
        <p style={{ margin: '0 0 8px', fontSize: '28px' }}>{icon}</p>
        <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0F1923', fontSize: '16px' }}>{title}</p>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>{description}</p>
        <span style={{ display: 'inline-block', backgroundColor: accent, color: '#fff', fontSize: '13px', fontWeight: 600, padding: '8px 18px', borderRadius: '20px' }}>
          Opprett →
        </span>
      </div>
    </Link>
  )
}
