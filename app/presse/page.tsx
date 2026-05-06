import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Presserom | Sydenklar',
  description: 'Pressekontakt, om Sydenklar og selskapsfakta for journalister og medier.',
  alternates: { canonical: 'https://www.sydenklar.no/presse' },
}

const FACTS = [
  { label: 'Etablert', value: '2026' },
  { label: 'Lokasjon', value: 'Hokksund, Norge' },
  { label: 'Hoteller', value: '2 000 000+' },
  { label: 'Land dekket', value: '190+' },
  { label: 'Språk', value: 'Norsk' },
]

export default function PressePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Presse</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Presserom</h1>
          <p className="text-white/55 text-base max-w-xl">Er du journalist eller jobber i medier? Her finner du informasjon om Sydenklar, kontaktdetaljer og ressurser.</p>
        </div>
      </div>

      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* About */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
            <h2 className="font-display text-xl text-[var(--deep)] mb-4">Om Sydenklar</h2>
            <p className="text-[#4A4F5A] text-sm leading-relaxed">
              Sydenklar er en norsk reiseportal som tilbyr søk, sammenligning og bestilling av hoteller i over 190 land. Selskapet ble etablert i 2026 med mål om å gi norske reisende en enkel, trygg og oversiktlig plattform for å planlegge opphold — med norsk kundestøtte og priser i norske kroner. Selskapet er registrert i Hokksund, Numedal.
            </p>
          </div>

          {/* Facts */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
            <h2 className="font-display text-xl text-[var(--deep)] mb-5">Nøkkeldata</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              {FACTS.map(f => (
                <div key={f.label} className="bg-[var(--sand-light)] rounded-xl p-4">
                  <dt className="text-[var(--muted)] text-xs uppercase tracking-wide mb-1">{f.label}</dt>
                  <dd className="font-semibold text-[var(--deep)] text-base">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Press contact */}
          <div className="bg-[var(--deep)] rounded-2xl p-8">
            <h2 className="font-display text-xl text-white mb-4">Pressekontakt</h2>
            <p className="text-white/55 text-sm mb-5">For presseforespørsler, intervjuer og annet medierelatert innhold:</p>
            <div className="space-y-2">
              <a href="mailto:post@sydenklar.no" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                post@sydenklar.no
              </a>
              <a href="tel:+4791540824" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                915 40 824
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
