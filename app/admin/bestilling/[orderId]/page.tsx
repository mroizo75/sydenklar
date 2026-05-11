'use client'

import { useEffect, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PrebookData {
  keysPickupInstructions?: string | null
  nonFreeAmenities?: string[]
  upsellData?: object[]
}

interface Booking {
  id: string
  partnerOrderId: string
  guestFirstName: string
  guestLastName: string
  guestEmail: string
  guestPhone: string | null
  hotelName: string | null
  hotelId: string | null
  roomName: string | null
  checkIn: string | null
  checkOut: string | null
  adults: number | null
  children: number | null
  rooms: number | null
  amount: number | null
  currency: string | null
  status: string
  stripePaymentId: string | null
  ratehawkOrderId: number | null
  cancellationInfo: string | null
  cancellationPolicy: string | null
  hotelAddress: string | null
  prebookData: PrebookData | null
  createdAt: string
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  confirmed:      { label: 'Bekreftet',       bg: '#DCFCE7', color: '#15803D' },
  pending:        { label: 'Venter',           bg: '#FEF9C3', color: '#A16207' },
  in_progress:    { label: 'Behandles',        bg: '#DBEAFE', color: '#1D4ED8' },
  cancelled:      { label: 'Avbestilt',        bg: '#FEE2E2', color: '#B91C1C' },
  failed:         { label: 'Feilet',           bg: '#FEE2E2', color: '#B91C1C' },
  paid:           { label: 'Betalt',           bg: '#DCFCE7', color: '#15803D' },
  payment_failed: { label: 'Betalingsfeil',    bg: '#FEE2E2', color: '#B91C1C' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmt(amount: number | null, currency: string | null) {
  if (!amount) return '—'
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: currency ?? 'NOK', maximumFractionDigits: 0 }).format(amount)
}

function nights(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return null
  return Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
}

export default function AdminBookingDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch(`/api/admin/bookings/${orderId}`)
      .then(r => r.json())
      .then(d => { setBooking(d.booking ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [orderId])

  function showMsg(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 5000)
  }

  function handleResend() {
    startTransition(async () => {
      const r = await fetch(`/api/admin/bookings/${orderId}/resend`, { method: 'POST' })
      const d = await r.json()
      showMsg(d.success ? 'ok' : 'err', d.success ? 'Bekreftelsesmail re-sendt!' : d.error ?? 'Feil')
    })
  }

  function handleCancel() {
    if (!confirm('Er du sikker på at du vil avbestille denne bestillingen?')) return
    startTransition(async () => {
      const r = await fetch(`/api/admin/bookings/${orderId}/cancel`, { method: 'POST' })
      const d = await r.json()
      if (d.success) {
        showMsg('ok', 'Bestilling avbestilt.')
        setBooking(prev => prev ? { ...prev, status: 'cancelled' } : prev)
      } else {
        showMsg('err', d.error ?? 'Avbestilling feilet')
      }
    })
  }

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>Laster…</div>
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <p style={{ color: '#6B7280', marginBottom: '16px' }}>Bestilling ikke funnet</p>
        <Link href="/admin" style={{ color: '#E5623E', fontWeight: 600 }}>← Tilbake</Link>
      </div>
    )
  }

  const s = STATUS_LABEL[booking.status] ?? { label: booking.status, bg: '#F3F4F6', color: '#374151' }
  const n = nights(booking.checkIn, booking.checkOut)
  const canCancel = ['confirmed', 'pending', 'in_progress', 'paid'].includes(booking.status)

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Back + heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <Link href="/admin" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}>
          ← Alle bestillinger
        </Link>
        <span style={{ color: '#E5E7EB' }}>|</span>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F1923', fontFamily: 'monospace' }}>
          {booking.partnerOrderId}
        </h1>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          backgroundColor: s.bg,
          color: s.color,
        }}>
          {s.label}
        </span>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: msg.type === 'ok' ? '#DCFCE7' : '#FEE2E2',
          color: msg.type === 'ok' ? '#15803D' : '#B91C1C',
          fontWeight: 500,
          fontSize: '14px',
        }}>
          {msg.text}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button
          onClick={handleResend}
          disabled={isPending}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#0F1923',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          📧 Re-send bekreftelsesmail
        </button>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#B91C1C',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid #FCA5A5',
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            ✕ Avbestill bestilling
          </button>
        )}
        <a
          href={`mailto:${booking.guestEmail}?subject=Ang. bestilling ${booking.partnerOrderId}`}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#374151',
            fontSize: '14px',
            fontWeight: 600,
            border: '1px solid #E5E7EB',
            textDecoration: 'none',
          }}
        >
          ✉️ E-post til gjest
        </a>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Gjestinfo */}
        <Card title="Gjest">
          <Row label="Navn" value={`${booking.guestFirstName} ${booking.guestLastName}`} />
          <Row label="E-post" value={<a href={`mailto:${booking.guestEmail}`} style={{ color: '#E5623E' }}>{booking.guestEmail}</a>} />
          <Row label="Telefon" value={booking.guestPhone ?? '—'} />
        </Card>

        {/* Hotell */}
        <Card title="Hotell">
          <Row label="Hotellnavn" value={booking.hotelName ?? '—'} />
          <Row label="Romtype" value={booking.roomName ?? '—'} />
          {booking.hotelAddress && <Row label="Adresse" value={booking.hotelAddress} />}
          <Row label="Innsjekk" value={fmtDate(booking.checkIn)} />
          <Row label="Utsjekk" value={fmtDate(booking.checkOut)} />
          {n && <Row label="Netter" value={`${n} netter`} />}
          <Row label="Gjester" value={`${booking.adults ?? 0} voksne${(booking.children ?? 0) > 0 ? `, ${booking.children} barn` : ''}`} />
          {booking.cancellationPolicy && (
            <Row label="Avbestilling" value={
              <span style={{ color: booking.cancellationPolicy.startsWith('Gratis') ? '#15803D' : '#B91C1C', fontSize: '12px' }}>
                {booking.cancellationPolicy}
              </span>
            } />
          )}
        </Card>

        {/* Betaling */}
        <Card title="Betaling">
          <Row label="Beløp" value={<strong>{fmt(booking.amount, booking.currency)}</strong>} />
          <Row label="Valuta" value={booking.currency ?? '—'} />
          <Row label="Stripe Payment ID" value={
            booking.stripePaymentId
              ? <a href={`https://dashboard.stripe.com/payments/${booking.stripePaymentId}`} target="_blank" rel="noreferrer" style={{ color: '#635BFF', fontFamily: 'monospace', fontSize: '12px' }}>
                  {booking.stripePaymentId.slice(0, 20)}…
                </a>
              : '—'
          } />
        </Card>

        {/* Referanser */}
        <Card title="Referanser">
          <Row label="Bestillingsnr." value={
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{booking.partnerOrderId}</span>
          } />
          <Row label="RateHawk Order ID" value={
            booking.ratehawkOrderId
              ? <span style={{ fontFamily: 'monospace' }}>{booking.ratehawkOrderId}</span>
              : '—'
          } />
          <Row label="Intern ID" value={<span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9CA3AF' }}>{booking.id}</span>} />
          <Row label="Bestilt" value={fmtDateTime(booking.createdAt)} />
          {booking.hotelId && (
            <Row label="Hotelllenkje" value={
              <Link href={`/hotell/${booking.hotelId}`} target="_blank" style={{ color: '#E5623E', fontSize: '13px' }}>
                Åpne hotellside ↗
              </Link>
            } />
          )}
        </Card>

      </div>

      {/* Nøkkelutlevering + tillegg fra prebookData */}
      {(booking.prebookData?.keysPickupInstructions || (booking.prebookData?.nonFreeAmenities?.length ?? 0) > 0) && (
        <div style={{ marginTop: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tilleggsinformasjon fra RateHawk
            </p>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {booking.prebookData?.keysPickupInstructions && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nøkkelutlevering</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#111827', lineHeight: 1.5 }}>{booking.prebookData.keysPickupInstructions}</p>
              </div>
            )}
            {booking.prebookData?.nonFreeAmenities && booking.prebookData.nonFreeAmenities.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tillegg betales på hotellet</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {booking.prebookData.nonFreeAmenities.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {booking.prebookData?.upsellData && booking.prebookData.upsellData.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valgte tilleggstjenester (upsells)</p>
                <pre style={{ margin: 0, fontSize: '12px', color: '#374151', backgroundColor: '#F9FAFB', borderRadius: '6px', padding: '8px', overflow: 'auto' }}>
                  {JSON.stringify(booking.prebookData.upsellData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation info */}
      {booking.cancellationInfo && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#FFF7ED', borderRadius: '10px', border: '1px solid #FED7AA' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '13px', color: '#92400E' }}>Avbestillingsinformasjon</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#78350F' }}>{booking.cancellationInfo}</p>
        </div>
      )}

    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
      <span style={{ color: '#6B7280', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#111827', fontSize: '13px', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
