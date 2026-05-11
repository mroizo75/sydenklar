import { getAllBookings, getBookingStats } from '@/lib/users-db'
import { requireAdminUser } from '@/lib/admin-auth'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:   { label: 'Bekreftet',  bg: '#DCFCE7', color: '#15803D' },
  pending:     { label: 'Venter',     bg: '#FEF9C3', color: '#A16207' },
  in_progress: { label: 'Behandles', bg: '#DBEAFE', color: '#1D4ED8' },
  cancelled:   { label: 'Avbestilt', bg: '#FEE2E2', color: '#B91C1C' },
  failed:      { label: 'Feilet',    bg: '#FEE2E2', color: '#B91C1C' },
  paid:        { label: 'Betalt',    bg: '#DCFCE7', color: '#15803D' },
  payment_failed: { label: 'Betalingsfeil', bg: '#FEE2E2', color: '#B91C1C' },
}

function statusBadge(status: string) {
  const s = STATUS_LABEL[status] ?? { label: status, bg: '#F3F4F6', color: '#374151' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: s.bg,
      color: s.color,
    }}>
      {s.label}
    </span>
  )
}

function fmt(amount: number | null | undefined, currency: string | null | undefined) {
  if (!amount) return '—'
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: currency ?? 'NOK', maximumFractionDigits: 0 }).format(amount)
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AdminPage({ searchParams }: Props) {
  const user = await requireAdminUser()
  const params = await searchParams
  const search = params.search?.trim() ?? ''
  const status = params.status ?? 'all'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 25
  const offset = (page - 1) * pageSize

  const [{ bookings, total }, stats] = await Promise.all([
    getAllBookings({ search: search || undefined, status: status !== 'all' ? status : undefined, limit: pageSize, offset }),
    getBookingStats(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>

      {/* Heading */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>Bestillingsoversikt</h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {total.toLocaleString('nb-NO')} bestillinger totalt
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Totalt" value={stats.total} color="#0F1923" />
        <StatCard label="Bekreftet" value={stats.confirmed} color="#15803D" />
        <StatCard label="Venter" value={stats.pending} color="#A16207" />
        <StatCard label="Avbestilt" value={stats.cancelled} color="#B91C1C" />
        <StatCard label="Feilet" value={stats.failed} color="#9CA3AF" />
        {user.isAdmin && (
          <StatCard
            label="Inntekt"
            value={new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(stats.revenue)}
            color="#C9A84C"
            wide
          />
        )}
      </div>

      {/* Search + filter bar */}
      <form method="GET" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          name="search"
          defaultValue={search}
          placeholder="Søk på bestillingsnr, e-post, hotell, gjest…"
          style={{
            flex: '1',
            minWidth: '280px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '14px',
            backgroundColor: '#fff',
            outline: 'none',
          }}
        />
        <select
          name="status"
          defaultValue={status}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#fff' }}
        >
          <option value="all">Alle statuser</option>
          <option value="confirmed">Bekreftet</option>
          <option value="pending">Venter</option>
          <option value="in_progress">Behandles</option>
          <option value="cancelled">Avbestilt</option>
          <option value="failed">Feilet</option>
        </select>
        <button type="submit" style={{
          padding: '10px 20px',
          borderRadius: '8px',
          backgroundColor: '#0F1923',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
        }}>
          Søk
        </button>
        {(search || status !== 'all') && (
          <Link href="/admin" style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            color: '#6B7280',
            fontSize: '14px',
            textDecoration: 'none',
            backgroundColor: '#fff',
          }}>
            Nullstill
          </Link>
        )}
      </form>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Bestillingsnr.', 'Gjest', 'Hotell', 'Inn/ut', ...(user.isAdmin ? ['Beløp'] : []), 'Status', 'Bestilt', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={user.isAdmin ? 8 : 7} style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                  Ingen bestillinger funnet
                </td>
              </tr>
            )}
            {bookings.map((b, i) => (
              <tr key={b.id} style={{
                borderBottom: i < bookings.length - 1 ? '1px solid #F3F4F6' : 'none',
                transition: 'background 0.1s',
              }}>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>
                    {b.partnerOrderId}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>
                    {b.guestFirstName} {b.guestLastName}
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '12px' }}>{b.guestEmail}</p>
                </td>
                <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                  <p style={{ margin: 0, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.hotelName ?? '—'}
                  </p>
                  {b.roomName && (
                    <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.roomName}
                    </p>
                  )}
                </td>
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#374151' }}>
                  {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                  <p style={{ margin: '2px 0 0', color: '#9CA3AF', fontSize: '12px' }}>
                    {b.adults ?? 0} voksne{(b.children ?? 0) > 0 ? `, ${b.children} barn` : ''}
                  </p>
                </td>
                {user.isAdmin && (
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontWeight: 600, color: '#111827' }}>
                    {fmt(b.amount, b.currency)}
                  </td>
                )}
                <td style={{ padding: '14px 16px' }}>
                  {statusBadge(b.status)}
                </td>
                <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {fmtDate(b.createdAt)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Link href={`/admin/bestilling/${b.partnerOrderId}`} style={{
                    color: '#E5623E',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    Se detaljer →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {page > 1 && (
            <PaginationLink href={buildHref({ search, status, page: page - 1 })} label="← Forrige" />
          )}
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p = i + 1
            return (
              <PaginationLink
                key={p}
                href={buildHref({ search, status, page: p })}
                label={String(p)}
                active={p === page}
              />
            )
          })}
          {page < totalPages && (
            <PaginationLink href={buildHref({ search, status, page: page + 1 })} label="Neste →" />
          )}
        </div>
      )}

    </div>
  )
}

function StatCard({ label, value, color, wide }: { label: string; value: number | string; color: string; wide?: boolean }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '10px',
      border: '1px solid #E5E7EB',
      padding: '20px',
      gridColumn: wide ? 'span 2' : undefined,
    }}>
      <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color }}>{typeof value === 'number' ? value.toLocaleString('nb-NO') : value}</p>
    </div>
  )
}

function PaginationLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '36px',
      height: '36px',
      padding: '0 12px',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: active ? '#0F1923' : '#E5E7EB',
      backgroundColor: active ? '#0F1923' : '#fff',
      color: active ? '#fff' : '#374151',
      fontSize: '14px',
      fontWeight: active ? 600 : 400,
      textDecoration: 'none',
    }}>
      {label}
    </Link>
  )
}

function buildHref({ search, status, page }: { search: string; status: string; page: number }) {
  const p = new URLSearchParams()
  if (search) p.set('search', search)
  if (status !== 'all') p.set('status', status)
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return `/admin${qs ? `?${qs}` : ''}`
}
