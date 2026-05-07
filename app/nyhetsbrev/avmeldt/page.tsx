import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avmeldt nyhetsbrev | Sydenklar',
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AvmeldtPage({ searchParams }: Props) {
  const { status } = await searchParams

  const isOk = status === 'ok'
  const isAlready = status === 'allerede'

  return (
    <main className="min-h-screen flex flex-col">
      <Header solid />
      <div className="flex-1 bg-[var(--sand-light)] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--sand)] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-[var(--deep)] mb-3">
            {isAlready ? 'Allerede avmeldt' : 'Du er avmeldt'}
          </h1>

          <p className="text-[var(--muted)] mb-8">
            {isOk
              ? 'Du vil ikke lenger motta nyhetsbrev fra Sydenklar. Du kan melde deg på igjen når som helst.'
              : isAlready
                ? 'Denne e-postadressen er allerede avmeldt nyhetsbrevet.'
                : 'Noe gikk galt. Lenken kan ha utløpt.'}
          </p>

          <div className="flex flex-col gap-3 items-center">
            <Link
              href="/hoteller"
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-8 py-3 rounded-full transition-colors"
            >
              Utforsk hoteller
            </Link>
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
