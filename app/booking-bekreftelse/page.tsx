import { Suspense } from 'react'
import Link from 'next/link'
import { getBookingByPartnerOrderId, linkBookingToUser } from '@/lib/users-db'
import { auth } from '@/lib/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Booking bekreftet – Sydenklar.no',
  description: 'Din hotellbooking er bekreftet.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ ref?: string }>
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

async function BookingDetails({ partnerOrderId }: { partnerOrderId: string }) {
  const [booking, session] = await Promise.all([
    getBookingByPartnerOrderId(partnerOrderId),
    auth(),
  ])

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-amber-600" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Booking ikke funnet</h2>
        <p className="text-[var(--muted)] mb-6">Vi finner ikke booking med referanse <strong>{partnerOrderId}</strong>. Sjekk e-posten din for bekreftelse.</p>
        <Link href="/hoteller" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
          Søk etter hoteller
        </Link>
      </div>
    )
  }

  // Koble booking til innlogget bruker automatisk hvis den ikke allerede er koblet
  const userId = (session?.user as { id?: string })?.id ?? null
  if (userId && !booking.userId) {
    await linkBookingToUser(partnerOrderId, userId)
  }

  const isLoggedIn = !!session?.user
  const guestEmail = booking.guestEmail

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(1, Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const formattedAmount = booking.amount != null
    ? new Intl.NumberFormat('nb-NO', {
        style: 'currency',
        currency: booking.currency || 'NOK',
        minimumFractionDigits: 0,
      }).format(booking.amount)
    : null

  const isConfirmed = booking.status === 'confirmed' || booking.status === 'paid'

  const registerUrl = `/logg-inn?mode=register&email=${encodeURIComponent(guestEmail)}&ref=${encodeURIComponent(partnerOrderId)}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Status header */}
      <div className="text-center mb-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isConfirmed ? 'bg-green-500' : 'bg-amber-400'}`}>
          {isConfirmed ? <CheckIcon /> : (
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--deep)] mb-2">
          {isConfirmed ? 'Booking bekreftet!' : 'Booking under behandling'}
        </h1>
        <p className="text-[var(--muted)]">
          {isConfirmed
            ? `Bekreftelse er sendt til ${booking.guestEmail}`
            : 'Vi behandler bookingen din. Du mottar e-post når det er klart.'}
        </p>
      </div>

      {/* Registrering-banner — kun til ikke-innloggede gjester */}
      {!isLoggedIn && (
        <div className="bg-[var(--deep)] text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-sm mb-0.5">Lagre bookingen på kontoen din</p>
            <p className="text-white/70 text-xs">
              Opprett en gratis konto med <span className="text-white font-medium">{guestEmail}</span> — bookingen kobles automatisk.
            </p>
          </div>
          <Link
            href={registerUrl}
            className="shrink-0 bg-[var(--coral)] hover:opacity-90 transition-opacity text-white text-sm font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap"
          >
            Opprett konto
          </Link>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm mb-6">
        {/* Hotel header */}
        <div className="bg-[var(--deep)] px-6 py-5">
          <p className="text-[var(--sand)] text-xs font-medium uppercase tracking-widest mb-1">Hotell</p>
          <h2 className="text-white font-display text-xl">{booking.hotelName || 'Hotell'}</h2>
          {booking.roomName && (
            <p className="text-[var(--sand)]/70 text-sm mt-1">{booking.roomName}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-b border-[var(--border)]">
          <div className="px-6 py-4">
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1.5">
              <CalendarIcon />
              Innsjekk
            </div>
            <p className="font-semibold text-[var(--deep)] text-sm">{formatDate(booking.checkIn)}</p>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1.5">
              <CalendarIcon />
              Utsjekk
            </div>
            <p className="font-semibold text-[var(--deep)] text-sm">{formatDate(booking.checkOut)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3">
          {nights && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Antall netter</span>
              <span className="font-medium text-[var(--deep)]">{nights}</span>
            </div>
          )}
          {booking.adults && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Gjester</span>
              <span className="font-medium text-[var(--deep)]">
                {booking.adults} voksne{booking.children ? `, ${booking.children} barn` : ''}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Gjest</span>
            <span className="font-medium text-[var(--deep)]">{booking.guestFirstName} {booking.guestLastName}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-[var(--border)] pt-3 mt-1">
            <span className="text-[var(--muted)]">Bestillingsnr.</span>
            <span className="font-mono font-semibold text-[var(--deep)] text-xs">{booking.partnerOrderId}</span>
          </div>
          {booking.ratehawkOrderId && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Hotell-ref.</span>
              <span className="font-mono text-xs text-[var(--deep)]">{booking.ratehawkOrderId}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        {formattedAmount && (
          <div className="bg-[var(--sand-light)] px-6 py-4 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-[var(--muted)] text-sm">Totalt betalt</span>
            <span className="font-display text-xl text-[var(--deep)]">{formattedAmount}</span>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        <p className="font-semibold mb-1">Viktig informasjon</p>
        <ul className="space-y-1 text-blue-700 list-disc list-inside">
          <li>Husk gyldig ID ved innsjekk</li>
          <li>Ta vare på bestillingsnummeret</li>
          <li>Avbestillingsvilkår gjelder fra bekreftelsestidspunktet</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/hoteller"
          className="flex-1 text-center border border-[var(--border)] text-[var(--deep)] rounded-xl py-3.5 font-medium text-sm hover:bg-[var(--sand-light)] transition-colors"
        >
          Søk etter flere hoteller
        </Link>
        <Link
          href="/konto"
          className="flex-1 text-center bg-[var(--coral)] text-white rounded-xl py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Mine bookinger
        </Link>
      </div>
    </div>
  )
}

export default async function BookingBekreftelsePage({ searchParams }: PageProps) {
  const params = await searchParams
  const ref = params?.ref

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--sand-light)] pt-24 pb-16">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[var(--coral)] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {ref ? (
            <BookingDetails partnerOrderId={ref} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-16 px-6">
              <h1 className="font-display text-3xl text-[var(--deep)] mb-4">Booking bekreftet</h1>
              <p className="text-[var(--muted)] mb-6">Sjekk e-posten din for bookingdetaljer.</p>
              <Link href="/hoteller" className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                Søk etter hoteller
              </Link>
            </div>
          )}
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
