import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Karriere | Sydenklar',
  description: 'Bli en del av Sydenklar — en norsk reiseportal i vekst. Se ledige stillinger eller send åpen søknad.',
  alternates: { canonical: 'https://www.sydenklar.no/karriere' },
}

export default function KarrierePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Karriere</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Jobb med oss</h1>
          <p className="text-white/55 text-base max-w-xl">Vi er et ungt selskap i vekst, og leter alltid etter dyktige folk som vil bidra til å bygge fremtidens norske reiseportal.</p>
        </div>
      </div>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* No open positions */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-10 text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-[var(--sand)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-[var(--deep)] mb-2">Ingen ledige stillinger akkurat nå</h2>
            <p className="text-[var(--muted)] text-sm max-w-xs mx-auto">Vi jobber aktivt med å vokse. Send gjerne en åpen søknad — vi leser alle henvendelser.</p>
          </div>

          {/* Open application */}
          <div className="bg-[var(--deep)] rounded-2xl p-8">
            <h2 className="font-display text-2xl text-white mb-2">Send åpen søknad</h2>
            <p className="text-white/55 text-sm mb-6 max-w-md">Er du dyktig innen teknologi, design, markedsføring eller reiseliv? Vi vil gjerne høre fra deg.</p>
            <div className="space-y-2 text-sm text-white/50 mb-6">
              <p>Vi ser etter folk med interesse for:</p>
              <ul className="list-disc list-inside space-y-1 text-white/40 mt-2">
                <li>Frontend- og backend-utvikling (Next.js, TypeScript)</li>
                <li>Produkt og design</li>
                <li>Digital markedsføring og SEO</li>
                <li>Reise og reiseliv</li>
                <li>Salg og partnerskap (B2B)</li>
              </ul>
            </div>
            <a
              href="mailto:post@sydenklar.no?subject=Åpen søknad til Sydenklar"
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
            >
              Send søknad på e-post
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[var(--muted)] text-sm">
              Les mer om oss på <Link href="/om-oss" className="text-[var(--sea)] hover:text-[var(--deep)] transition-colors">Om Sydenklar</Link>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
