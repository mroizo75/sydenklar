import { Suspense } from 'react'
import Link from 'next/link'
import { getBookingByPartnerOrderId } from '@/lib/users-db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CancelForm from './CancelForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avbestill booking – Sydenklar.no',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ ref?: string; token?: string }>
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function CancelContent({ partnerOrderId, cancelToken }: { partnerOrderId: string; cancelToken?: string }) {
  const booking = await getBookingByPartnerOrderId(partnerOrderId)

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Booking ikke funnet</h2>
        <p className="text-[var(--muted)] mb-6">
          Vi finner ikke booking med referanse <strong>{partnerOrderId}</strong>.
        </p>
        <Link href="/konto" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
          Mine bookinger
        </Link>
      </div>
    )
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-400" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Allerede kansellert</h2>
        <p className="text-[var(--muted)] mb-6">Denne bookingen er allerede kansellert.</p>
        <Link href="/konto" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
          Mine bookinger
        </Link>
      </div>
    )
  }

  const isActive = booking.status === 'confirmed' || booking.status === 'paid'
  if (!isActive) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Kan ikke avbestilles</h2>
        <p className="text-[var(--muted)] mb-6">
          Bookingen har status <strong>{booking.status}</strong> og kan ikke avbestilles her.
          Kontakt oss på{' '}
          <a href="mailto:hjelp@sydenklar.no" className="text-[var(--coral)] hover:underline">
            hjelp@sydenklar.no
          </a>{' '}
          hvis du trenger hjelp.
        </p>
        <Link href="/konto" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
          Mine bookinger
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-500" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-display text-3xl text-[var(--deep)] mb-2">Avbestill booking</h1>
        <p className="text-[var(--muted)] text-sm">
          Bestillingsnr.{' '}
          <span className="font-mono font-semibold text-[var(--deep)]">{booking.partnerOrderId}</span>
        </p>
      </div>

      <CancelForm
        partnerOrderId={booking.partnerOrderId}
        hotelName={booking.hotelName ?? 'Hotell'}
        checkIn={formatDate(booking.checkIn)}
        checkOut={formatDate(booking.checkOut)}
        cancellationPolicy={booking.cancellationPolicy ?? booking.cancellationInfo ?? null}
        cancelToken={cancelToken}
      />
    </div>
  )
}

export default async function AvbestillPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ref = params?.ref
  const token = params?.token

  return (
    <>
      <Header solid />
      <main className="min-h-screen bg-[var(--sand-light)] pt-24 pb-16">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[var(--coral)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {ref ? (
            <CancelContent partnerOrderId={ref} cancelToken={token} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-16 px-6">
              <h1 className="font-display text-3xl text-[var(--deep)] mb-4">Avbestill booking</h1>
              <p className="text-[var(--muted)] mb-6">Mangler bestillingsreferanse. Sjekk lenken fra e-posten din.</p>
              <Link href="/konto" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                Mine bookinger
              </Link>
            </div>
          )}
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
