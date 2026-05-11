import { getBookingByPartnerOrderId } from '@/lib/users-db'
import { stripe } from '@/lib/stripe'
import { PaymentForm } from './PaymentForm'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function BetalPage({ params }: Props) {
  const { orderId } = await params

  const booking = await getBookingByPartnerOrderId(orderId)

  if (!booking) return notFound()

  // Allerede betalt/bekreftet
  if (booking.status === 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FB', fontFamily: "'Helvetica Neue', Arial, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, color: '#0F1923' }}>Booking allerede bekreftet</h1>
          <p style={{ margin: '0 0 6px', color: '#374151', fontSize: '15px' }}>
            Bekreftelse er sendt til <strong>{booking.guestEmail}</strong>
          </p>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            Bestillingsnr: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{booking.partnerOrderId}</span>
          </p>
        </div>
      </div>
    )
  }

  if (booking.status !== 'pending_payment' && booking.status !== 'paid') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FB', fontFamily: "'Helvetica Neue', Arial, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#0F1923' }}>Betalingslinken er ikke lenger aktiv</h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            Kontakt oss på <a href="mailto:post@sydenklar.no" style={{ color: '#E5623E' }}>post@sydenklar.no</a>
          </p>
        </div>
      </div>
    )
  }

  if (!booking.stripePaymentId) {
    return notFound()
  }

  // Hent client_secret fra Stripe server-side
  const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId)
  const clientSecret = paymentIntent.client_secret

  if (!clientSecret) return notFound()

  return <PaymentForm booking={booking} clientSecret={clientSecret} />
}
