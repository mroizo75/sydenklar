'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function HotelPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Hotel page error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--sand-light)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="font-display text-2xl text-[var(--deep)] mb-2">Hotellsiden kunne ikke lastes</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Det oppsto en feil ved lasting av dette hotellet. Prøv igjen, eller gå tilbake til søket.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Prøv igjen
          </button>
          <Link
            href="/hoteller"
            className="border border-[var(--border)] bg-transparent text-[var(--deep)] hover:bg-[var(--sand-light)] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Tilbake til søk
          </Link>
        </div>
      </div>
    </div>
  )
}
