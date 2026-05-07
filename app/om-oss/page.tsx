import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Om Sydenklar | Norsk reiseportal for hoteller',
  description: 'Sydenklar er en norsk reiseportal som hjelper deg å finne og bestille de beste hotellene i Norge og verden. Les mer om oss og vår misjon.',
  alternates: { canonical: 'https://www.sydenklar.no/om-oss' },
}

const VALUES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Trygghet',
    text: 'Sikker betaling, tydelige vilkår og alltid tilgjengelig kundestøtte.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Oversikt',
    text: 'Millioner av hoteller samlet på ett sted — enkelt å sammenligne og velge.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Norsk fokus',
    text: 'Vi er norske og bygger for norske reisende — med norsk kundestøtte og priser i NOK.',
  },
]

export default function OmOssPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header solid />

      {/* Hero */}
      <div className="bg-[var(--deep)] pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Om oss</p>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-6">
            En norsk reiseportal<br />bygget for norske reisende
          </h1>
          <p className="text-white/60 text-lg max-w-xl leading-relaxed">
            Vi gjør det enkelt å finne og bestille de beste hotellene — i Norge og resten av verden. Alltid trygt, alltid oversiktlig.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-[var(--deep)] mb-4">Vår historie</h2>
          <div className="space-y-4 text-[#4A4F5A] text-base leading-relaxed">
            <p>
              Sydenklar ble startet med et enkelt mål: å gi norske reisende et bedre utgangspunkt for å planlegge og bestille overnatting. For mange erfarer at det er vanskelig å navigere i jungelen av utenlandske reiseplattformer — priser i fremmed valuta, vilkår på engelsk, og lite lokal kundestøtte.
            </p>
            <p>
              Vi er et norsk selskap, og vi snakker samme språk som deg. Hos Sydenklar finner du hoteller i over 190 land, men alltid med norsk betjening, priser i kroner og vilkår du forstår.
            </p>
            <p>
              Snart lanserer vi pakkereiser med fly og hotell — alt samlet på ett sted, til de beste prisene.
            </p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="w-10 h-10 rounded-full bg-[var(--sea-light)] text-[var(--sea)] flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <p className="font-semibold text-[var(--deep)] mb-1">{v.title}</p>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div className="bg-[var(--sand)] rounded-2xl p-8 mt-10">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-4">Kontakt oss</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-24 shrink-0">Selskap</dt>
                <dd className="text-[var(--deep)]">Sydenklar AS (under registrering)</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-24 shrink-0">Adresse</dt>
                <dd className="text-[var(--deep)]">Horgenveien 75, 3303 Hokksund</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-24 shrink-0">E-post</dt>
                <dd><a href="mailto:post@sydenklar.no" className="text-[var(--sea)] hover:text-[var(--deep)] transition-colors">post@sydenklar.no</a></dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-24 shrink-0">Telefon</dt>
                <dd><a href="tel:+4791540824" className="text-[var(--sea)] hover:text-[var(--deep)] transition-colors">915 40 824</a></dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/kontakt" className="inline-flex items-center justify-center bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-6 py-3 rounded-full transition-colors text-sm">
              Kontakt oss
            </Link>
            <Link href="/karriere" className="inline-flex items-center justify-center bg-transparent border border-[var(--border)] hover:border-[var(--coral)] text-[var(--deep)] font-medium px-6 py-3 rounded-full transition-colors text-sm">
              Se ledige stillinger
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
