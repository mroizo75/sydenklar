import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Påmelding bekreftet | Sydenklar',
  robots: { index: false, follow: false },
}

export default function NyhetsbrevBekreftelsePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-[var(--sand-light)] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-[var(--deep)] mb-3">
            Du er påmeldt!
          </h1>
          <p className="text-[var(--muted)] mb-2">
            Takk for at du meldte deg på Sydenklar-nyhetsbrevet.
          </p>
          <p className="text-[var(--muted)] text-sm mb-8">
            Vi sender deg ukentlig reiseinspirasjon, utvalgte hoteller og eksklusive tilbud — rett i innboksen din.
          </p>
          <Link
            href="/hoteller"
            className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            Utforsk hoteller nå
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--deep)] transition-colors">
              Tilbake til forsiden
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
