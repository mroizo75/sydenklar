'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { BookingRecord } from '@/lib/users-db'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function CheckoutForm({ booking }: { booking: BookingRecord }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/betal/${booking.partnerOrderId}?status=paid` },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Betalingen mislyktes')
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Finaliser booking mot RateHawk
      const res = await fetch(`/api/betal/${booking.partnerOrderId}/finalize`, { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setDone(true)
      } else {
        setError(data.error ?? 'Betalingen gikk gjennom, men bookingen mislyktes. Kontakt oss på post@sydenklar.no')
      }
    }

    setProcessing(false)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#0F1923' }}>Booking bekreftet!</h2>
        <p style={{ margin: '0 0 8px', color: '#374151', fontSize: '15px' }}>
          Bekreftelse er sendt til <strong>{booking.guestEmail}</strong>
        </p>
        <p style={{ margin: '0', color: '#6B7280', fontSize: '14px' }}>
          Bestillingsnr: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{booking.partnerOrderId}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <p style={{ margin: '16px 0 0', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '14px' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        style={{
          marginTop: '24px',
          width: '100%',
          padding: '16px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: processing ? '#9CA3AF' : '#E5623E',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 700,
          cursor: processing ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {processing ? 'Behandler…' : `Betal ${fmtAmount(booking.amount ?? 0, booking.currency ?? 'NOK')} og bekreft reisen`}
      </button>
      <p style={{ margin: '12px 0 0', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>
        🔒 Sikker betaling via Stripe — kort, Klarna og andre metoder
      </p>
    </form>
  )
}

export function PaymentForm({ booking, clientSecret }: { booking: BookingRecord; clientSecret: string }) {
  const nights = booking.checkIn && booking.checkOut
    ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
    : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FB', fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: '32px 16px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ color: '#C9A84C', fontWeight: 800, fontSize: '20px', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase' }}>
            SYDENKLAR
          </a>
        </div>

        {/* Booking summary */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '28px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Din reise
          </p>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#0F1923' }}>{booking.hotelName}</h2>
          {booking.roomName && (
            <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '14px' }}>{booking.roomName}</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <DetailBox label="Innsjekk" value={booking.checkIn ? fmtDate(booking.checkIn) : '—'} />
            <DetailBox label="Utsjekk" value={booking.checkOut ? fmtDate(booking.checkOut) : '—'} />
            <DetailBox label="Netter" value={String(nights)} />
            <DetailBox label="Gjester" value={`${booking.adults ?? 0} voksen${(booking.adults ?? 0) !== 1 ? 'e' : ''}`} />
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#374151', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F1923' }}>
              {fmtAmount(booking.amount ?? 0, booking.currency ?? 'NOK')}
            </span>
          </div>
        </div>

        {/* Stripe form */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '28px' }}>
          <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Betaling
          </p>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#E5623E',
                  borderRadius: '8px',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                },
              },
            }}
          >
            <CheckoutForm booking={booking} />
          </Elements>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#9CA3AF', fontSize: '12px' }}>
          Bestillingsnr: <span style={{ fontFamily: 'monospace' }}>{booking.partnerOrderId}</span>
          {' · '}Spørsmål? <a href="mailto:post@sydenklar.no" style={{ color: '#E5623E' }}>post@sydenklar.no</a>
        </p>

      </div>
    </div>
  )
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '12px 14px' }}>
      <p style={{ margin: '0 0 2px', color: '#9CA3AF', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
      <p style={{ margin: 0, color: '#111827', fontSize: '14px', fontWeight: 600 }}>{value}</p>
    </div>
  )
}
