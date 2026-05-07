import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getBookingsByUserId, getUserById } from '@/lib/users-db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Min konto – Sydenklar.no',
  description: 'Se dine hotellbookinger og kontoinformasjon.',
  robots: { index: false, follow: false },
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: { label: 'Bekreftet', className: 'bg-green-100 text-green-700' },
    paid:      { label: 'Betalt',    className: 'bg-green-100 text-green-700' },
    pending:   { label: 'Venter',    className: 'bg-amber-100 text-amber-700' },
    failed:    { label: 'Feilet',    className: 'bg-red-100 text-red-600' },
    cancelled: { label: 'Kansellert', className: 'bg-gray-100 text-gray-500' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export default async function KontoPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/logg-inn?redirect=/konto')
  }

  const userId = (session.user as any).id
  const [user, bookings] = await Promise.all([
    getUserById(userId),
    getBookingsByUserId(userId),
  ])

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <Header solid />
      <main className="min-h-screen bg-[var(--sand-light)] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--deep)] text-white flex items-center justify-center text-xl font-display shrink-0">
              {user?.firstName?.[0] ?? session.user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="font-display text-xl text-[var(--deep)]">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : session.user?.name ?? 'Min konto'}
              </h1>
              <p className="text-[var(--muted)] text-sm">{session.user?.email}</p>
            </div>
            <form action="/api/auth/signout" method="post" className="ml-auto">
              <button
                type="submit"
                className="text-sm text-[var(--muted)] hover:text-[var(--deep)] transition-colors border border-[var(--border)] px-4 py-2 rounded-xl"
              >
                Logg ut
              </button>
            </form>
          </div>

          {/* Bookings */}
          <h2 className="font-display text-xl text-[var(--deep)] mb-4">Mine bookinger</h2>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--sand-light)] flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[var(--muted)]" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
              </div>
              <h3 className="font-display text-lg text-[var(--deep)] mb-2">Ingen bookinger ennå</h3>
              <p className="text-[var(--muted)] text-sm mb-6">Dine hotellbookinger vises her etter at du har bestilt.</p>
              <Link
                href="/hoteller"
                className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Søk etter hoteller
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
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

                const isActive = booking.status === 'confirmed' || booking.status === 'paid'

                return (
                  <div key={booking.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
                    <Link
                      href={`/booking-bekreftelse?ref=${booking.partnerOrderId}`}
                      className="block p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[var(--deep)] truncate">{booking.hotelName || 'Hotell'}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          {booking.roomName && (
                            <p className="text-sm text-[var(--muted)] truncate mb-2">{booking.roomName}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                            {booking.checkIn && (
                              <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                            )}
                            {nights && <span>{nights} netter</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {formattedAmount && (
                            <p className="font-display text-lg text-[var(--deep)]">{formattedAmount}</p>
                          )}
                          <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">{booking.partnerOrderId.slice(-8)}</p>
                        </div>
                      </div>
                    </Link>
                    {isActive && (
                      <div className="border-t border-[var(--border)] px-5 py-2.5 flex justify-end">
                        <Link
                          href={`/avbestill?ref=${booking.partnerOrderId}`}
                          className="text-xs text-[var(--muted)] hover:text-red-600 transition-colors underline underline-offset-2"
                        >
                          Avbestill
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
