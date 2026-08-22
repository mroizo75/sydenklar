import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Høstferie 2026 – Populære reisemål | Sydenklar.no",
  description:
    "Planlegg høstferien 2026! Gran Canaria, Kreta, Tenerife, Antalya og flere solrike reisemål. Finn og sammenlign hoteller med Sydenklar.",
  alternates: { canonical: "https://www.sydenklar.no/hostferie" },
}

interface Destination {
  slug: string
  name: string
  country: string
  temp: string
  image: string
  description: string
}

const DESTINATIONS: Destination[] = [
  {
    slug: "gran-canaria",
    name: "Gran Canaria",
    country: "Spania",
    temp: "24–27°C",
    image: "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=900&q=80",
    description: "Nordmenns desiderte høstferie-favoritt. Sol, sand og badevann hele oktober.",
  },
  {
    slug: "kreta",
    name: "Kreta",
    country: "Hellas",
    temp: "22–26°C",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80",
    description: "Turkise bukter, historiske ruiner og fantastisk mat — perfekt i oktober.",
  },
  {
    slug: "tenerife",
    name: "Tenerife",
    country: "Spania",
    temp: "24–28°C",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=900&q=80",
    description: "Kanarisk sol, vulkanlandskap og familievennlige strender året rundt.",
  },
  {
    slug: "antalya",
    name: "Antalya",
    country: "Tyrkia",
    temp: "25–30°C",
    image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=900&q=80",
    description: "Tyrkisk riviera med all-inclusive, historiske Kaleici og krystallklart vann.",
  },
  {
    slug: "alanya",
    name: "Alanya",
    country: "Tyrkia",
    temp: "25–29°C",
    image: "https://images.unsplash.com/photo-1596403828927-2e4e8e2e85c9?w=900&q=80",
    description: "Prisgunstig ferieparadis med lange strender, festning og Kleopatra-stranden.",
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    temp: "30–33°C",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80",
    description: "Eksotisk storby med templer, street food og luksushoteller til norsk budsjett.",
  },
]

export default function HostferiePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-[var(--deep)] pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[var(--coral)]/10 text-[var(--coral)] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Høstferie 2026
          </span>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">
            Populære reisemål for høstferien
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Slipper du unna den norske høsten? Her er de mest populære destinasjonene blant nordmenn
            i uke 40 — med garantert sol og varme.
          </p>
        </div>
      </section>

      <section className="flex-1 bg-[var(--sand-light)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.slug}
                href={`/hostferie/${dest.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--sand)] hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={dest.image}
                    alt={`Høstferie ${dest.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-display text-xl text-[var(--deep)]">{dest.name}</h2>
                    <span className="text-sm text-[var(--coral)] font-semibold">{dest.temp}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mb-3">{dest.country}</p>
                  <p className="text-sm text-[var(--deep)]/80 leading-relaxed">{dest.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-[var(--coral)] text-sm font-semibold">
                    Se hoteller
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-4">Hvorfor høstferie i syden?</h2>
            <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-2">☀️</div>
                <h3 className="font-semibold text-[var(--deep)] mb-1">Garantert sol</h3>
                <p className="text-sm text-[var(--muted)]">Mens Norge er grått og vått, er det 25–30 grader i Syden.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-[var(--deep)] mb-1">Gode priser</h3>
                <p className="text-sm text-[var(--muted)]">Oktober er lavsesong mange steder — du får mer for pengene.</p>
              </div>
              <div>
                <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                <h3 className="font-semibold text-[var(--deep)] mb-1">Perfekt for familier</h3>
                <p className="text-sm text-[var(--muted)]">Barnevennlige hoteller med basseng, strand og aktiviteter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
