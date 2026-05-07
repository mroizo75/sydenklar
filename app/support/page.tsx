import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kundestøtte | Sydenklar',
  description: 'Få hjelp med booking, avbestilling eller andre spørsmål. Sydenklar kundestøtte svarer deg raskt.',
  alternates: { canonical: 'https://www.sydenklar.no/support' },
}

const QUICK_LINKS = [
  { title: 'Bestillingsveiledning', desc: 'Slik bestiller du hotell steg for steg', href: '/hjelp/bestilling' },
  { title: 'Avbestilling', desc: 'Regler og prosedyre for å avbestille', href: '/hjelp/avbestilling' },
  { title: 'Ofte stilte spørsmål', desc: 'Svar på de vanligste spørsmålene', href: '/faq' },
  { title: 'Personvern', desc: 'Dine rettigheter og vår datapraksis', href: '/personvern' },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header solid />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Hjelp</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Kundestøtte</h1>
          <p className="text-white/55 text-base max-w-xl">Vi er her for å hjelpe deg. Ta kontakt via e-post eller telefon — vi svarer innen én virkedag.</p>
        </div>
      </div>

      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Contact cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <a
              href="mailto:post@sydenklar.no"
              className="group bg-white rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--coral)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--sea-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--sea)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-semibold text-[var(--deep)] mb-1">E-post</p>
              <p className="text-[var(--muted)] text-sm mb-2">Vi svarer innen én virkedag</p>
              <p className="text-[var(--sea)] text-sm font-medium group-hover:text-[var(--coral)] transition-colors">post@sydenklar.no</p>
            </a>

            <a
              href="tel:+4791540824"
              className="group bg-white rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--coral)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--sea-light)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[var(--sea)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="font-semibold text-[var(--deep)] mb-1">Telefon</p>
              <p className="text-[var(--muted)] text-sm mb-2">Mandag–fredag kl. 09–16</p>
              <p className="text-[var(--sea)] text-sm font-medium group-hover:text-[var(--coral)] transition-colors">915 40 824</p>
            </a>
          </div>

          {/* Quick links */}
          <h2 className="font-display text-2xl text-[var(--deep)] mb-4">Selvhjelp</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white rounded-xl border border-[var(--border)] p-5 hover:border-[var(--coral)] transition-colors flex items-start gap-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--deep)] mb-1 group-hover:text-[var(--coral)] transition-colors">{link.title}</p>
                  <p className="text-[var(--muted)] text-sm">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-[var(--muted)] mt-0.5 shrink-0 group-hover:text-[var(--coral)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          {/* Address */}
          <div className="mt-10 bg-[var(--sand)] rounded-2xl p-6">
            <h3 className="font-display text-lg text-[var(--deep)] mb-2">Postadresse</h3>
            <p className="text-[var(--muted)] text-sm">Sydenklar AS<br />Horgenveien 75<br />3303 Hokksund<br />Norge</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
