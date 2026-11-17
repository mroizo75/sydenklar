import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InquiryForm from './InquiryForm'

export const metadata: Metadata = {
  title: 'Planlegg reisen',
  description: 'Be om hotellkatalog, transfer, leiebil og tog, eller ring 915 40 824 så bestiller vi for deg.',
  alternates: { canonical: 'https://www.sydenklar.no/skreddersy' },
}

export default function SkreddersyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header solid />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-3">Vi hjelper deg å bestille reisen</h1>
          <p className="text-white/60 text-base leading-relaxed max-w-2xl">
            Send en forespørsel, eller ring oss. Du får en hotellkatalog som PDF, og vi kan ta med transfer, leiebil og tog.
          </p>
        </div>
      </div>

      <div className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <InquiryForm />
          </div>
          <aside className="lg:col-span-2 space-y-4">
            <a href="tel:+4791540824" className="block bg-[var(--deep)] text-white rounded-2xl p-6">
              <p className="text-[var(--gold)] text-xs tracking-[2px] uppercase font-semibold mb-2">Ring inn</p>
              <p className="font-display text-3xl mb-1">915 40 824</p>
              <p className="text-white/60 text-sm">Man–fre 09–16. Si hvor dere skal, så bestiller vi.</p>
            </a>
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
              <h2 className="font-semibold text-[var(--deep)] mb-3">Som en reisekatalog</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Hotellene samler vi i en PDF du kan se gjennom, slik man før bladde i en katalog. Deretter bestiller vi det du velger, sammen med transfer, leiebil eller tog om du trenger det.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-sm text-[var(--muted)] leading-relaxed">
              Transfer, leiebil og tog er egne bestillinger. Flybilletter selger vi ikke. Trenger du fly, formidler vi deg videre når du ringer eller skriver det i forespørselen.
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  )
}
