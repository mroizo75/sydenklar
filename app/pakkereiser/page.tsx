import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterSignup from '@/components/NewsletterSignup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pakkereiser — Fly og hotell | Sydenklar',
  description: 'Snart kan du bestille pakkereiser med fly og hotell samlet på Sydenklar.no. Meld deg på for å bli varslet ved lansering.',
  alternates: { canonical: 'https://www.sydenklar.no/pakkereiser' },
}

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Bedre pris samlet',
    text: 'Fly og hotell i én bestilling gir deg som regel bedre totalpris enn å kjøpe separat.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Alt på ett sted',
    text: 'Én bekreftelse, én betaling og full oversikt over hele reisen — uansett destinasjon.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Pakkereiseloven gjelder',
    text: 'Pakkereiser gir deg ekstra lovmessig beskyttelse etter norsk Pakkereiseloven ved forsinkelser og endringer.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Norsk support',
    text: 'Noe skjer under reisen? Vår norsktalende kundestøtte er tilgjengelig for å hjelpe deg.',
  },
]

export default function PakkereiserPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      {/* Hero */}
      <div
        className="relative pt-28 pb-20 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1923 0%, #1a3a5c 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block bg-[var(--coral)]/20 border border-[var(--coral)]/40 text-[var(--coral)] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
            Kommer snart
          </span>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-5">
            Fly og hotell — pakket<br />for norske reisende
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Vi lanserer snart pakkereiser der du kan bestille fly og hotell samlet til de beste prisene — enkelt, trygt og alltid på norsk.
          </p>

          {/* Signup */}
          <div className="max-w-lg mx-auto">
            <p className="text-white/45 text-sm mb-3">Bli varslet ved lansering:</p>
            <NewsletterSignup variant="dark" />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl text-[var(--deep)] text-center mb-10">Hvorfor velge pakkereise?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <div className="w-10 h-10 rounded-full bg-[var(--sea-light)] text-[var(--sea)] flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <p className="font-semibold text-[var(--deep)] mb-1">{b.title}</p>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular destinations teaser */}
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[var(--sand)] rounded-2xl p-8 text-center">
            <p className="text-[var(--muted)] text-xs uppercase tracking-[2px] font-semibold mb-3">Planlagte destinasjoner</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {['Spania', 'Italia', 'Hellas', 'Tyrkia', 'Thailand', 'Portugal', 'Kroatia', 'Dubai', 'New York', 'London'].map(d => (
                <span key={d} className="bg-white border border-[var(--border)] text-[var(--deep)] text-sm px-4 py-1.5 rounded-full">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-[var(--muted)] text-sm">... og mange flere destinasjoner ved lansering.</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
