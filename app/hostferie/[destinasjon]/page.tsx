import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

interface DestinationData {
  slug: string
  name: string
  country: string
  temp: string
  waterTemp: string
  image: string
  heroDescription: string
  whyVisit: string[]
  tips: string[]
  highlights: string[]
  searchQuery: string
}

const DESTINATIONS: Record<string, DestinationData> = {
  "gran-canaria": {
    slug: "gran-canaria",
    name: "Gran Canaria",
    country: "Spania",
    temp: "24–27°C",
    waterTemp: "22–23°C",
    image: "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=1200&q=80",
    heroDescription: "Gran Canaria er nordmenns desiderte favorittdestinasjon for høstferien. Med stabil sol, vakre strender og et enormt utvalg av hoteller passer øya perfekt for både familier, par og vennegjenger.",
    whyVisit: [
      "Garantert sol og 24–27 grader i oktober — perfekt flukt fra norsk høst",
      "Maspalomas-klittene og kilometerlange strender for hele familien",
      "Kort flytid (ca. 5 timer) fra Oslo, Bergen og Stavanger",
      "Bredt utvalg av all-inclusive, boutique-hoteller og leiligheter",
      "Fantastisk natur — fra fjell og kløfter til tropiske hager",
    ],
    tips: [
      "Book hotell i Playa del Inglés for strandliv eller Puerto de Mogán for sjarm",
      "Lei bil og utforsk innlandet — Roque Nublo og Tejeda er verdt turen",
      "Las Palmas har flott shopping, kultur og bystranden Las Canteras",
      "Bestill tidlig for uke 40 — nordmenn fyller opp de beste hotellene",
    ],
    highlights: ["Maspalomas-klittene", "Puerto de Mogán", "Roque Nublo", "Las Canteras", "Amadores Beach"],
    searchQuery: "Gran Canaria",
  },
  kreta: {
    slug: "kreta",
    name: "Kreta",
    country: "Hellas",
    temp: "22–26°C",
    waterTemp: "23–24°C",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80",
    heroDescription: "Kreta er den perfekte blandingen av strand, kultur og gastronomi. I oktober er turistmassene borte, men solen og varmen er der fortsatt — ideelt for en avslappende høstferie.",
    whyVisit: [
      "Behagelig varme (22–26°C) uten sommerens intense hete",
      "Fantastisk mat — gresk salat, raki og fersk sjømat rett fra havet",
      "Historiske severdigheter som Knosos-palasset og Spinalonga",
      "Vakre strender som Elafonisi, Balos og Vai — uten køene",
      "Hyggelige landsbyer i fjellene med autentisk gresk atmosfære",
    ],
    tips: [
      "Velg Chania-området for sjarm og nærhet til Balos og Elafonisi",
      "Oktober er lavere sesong — du får flotte hoteller til lavere priser",
      "Lei bil for å utforske øyas mange skjulte strender og fjelllandsbyer",
      "Prøv lokale tavernaer fremfor turistrestaurantene langs vannet",
    ],
    highlights: ["Balos-lagunen", "Elafonisi", "Chania gamleby", "Knosos", "Samariá-kløften"],
    searchQuery: "Kreta",
  },
  tenerife: {
    slug: "tenerife",
    name: "Tenerife",
    country: "Spania",
    temp: "24–28°C",
    waterTemp: "22–23°C",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80",
    heroDescription: "Tenerife er den største av Kanariøyene og byr på alt fra vulkanlandskap til tropiske strender. Oktober gir perfekt badevær uten sommerens folkemasser.",
    whyVisit: [
      "Stabil varme året rundt — 24–28°C i oktober",
      "Teide nasjonalpark — Spanias høyeste fjell og spektakulær natur",
      "Familievennlige resorts med vannparker og aktiviteter",
      "Variert — fra rolige Los Gigantes til livlige Playa de las Américas",
      "Direkte fly fra flere norske byer, ca. 5 timer",
    ],
    tips: [
      "Sør-Tenerife har mest sol — velg Costa Adeje eller Los Cristianos",
      "Ta taubanen opp til Teide for utrolig utsikt (book på forhånd)",
      "Siam Park regnes som verdens beste vannpark — perfekt for familier",
      "Puerto de la Cruz i nord er roligere og mer autentisk",
    ],
    highlights: ["Teide nasjonalpark", "Siam Park", "Los Gigantes", "Costa Adeje", "Masca-dalen"],
    searchQuery: "Tenerife",
  },
  antalya: {
    slug: "antalya",
    name: "Antalya",
    country: "Tyrkia",
    temp: "25–30°C",
    waterTemp: "24–25°C",
    image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1200&q=80",
    heroDescription: "Antalya-regionen langs den tyrkiske rivieraen er kjent for luksuriøse all-inclusive-hoteller, varmt badevann langt utover høsten, og priser som gjør at du får mye ferie for pengene.",
    whyVisit: [
      "Blant de varmeste destinasjonene i oktober — ofte over 28°C",
      "All-inclusive til en brøkdel av prisen sammenlignet med Kanariøyene",
      "Historiske Kaleiçi (gamlebyen) med sjarmerende gater og restauranter",
      "Krystallklart Middelhav med lange sandstrender",
      "Kultur, natur og basar-shopping i verdensklasse",
    ],
    tips: [
      "Lara Beach og Kundu har de flotteste resort-hotellene",
      "Besøk Side eller Alanya som dagstur for mer historisk sjarm",
      "Prut i Grand Bazaar — det forventes, og du kan spare mye",
      "Book all-inclusive — maten og drikke er verdt det på tyrkiske hoteller",
    ],
    highlights: ["Kaleiçi gamleby", "Düden-fossefallet", "Lara Beach", "Aspendos", "Konyaaltı-stranden"],
    searchQuery: "Antalya",
  },
  alanya: {
    slug: "alanya",
    name: "Alanya",
    country: "Tyrkia",
    temp: "25–29°C",
    waterTemp: "24–25°C",
    image: "https://images.unsplash.com/photo-1596403828927-2e4e8e2e85c9?w=1200&q=80",
    heroDescription: "Alanya er et av Tyrkias mest populære feriedestinasjoner blant skandinaver. Kleopatra-stranden, den historiske festningen og rimelige luksushoteller gjør byen til et opplagt høstferie-valg.",
    whyVisit: [
      "Svært prisgunstig — all-inclusive fra under 1000 kr per natt",
      "Kleopatra-stranden er kåret til en av Middelhavskysten beste",
      "Varmt nok til bading helt til november",
      "Alanya-festningen gir fantastisk utsikt og historisk atmosfære",
      "Stor skandinavisk koloni — lett å finne norsktalende service",
    ],
    tips: [
      "Velg hotell langs Kleopatra-stranden for best beliggenhet",
      "Ta båttur langs kysten — inkluderer grotter og bading i bukter",
      "Tirsdagsmarkedet i sentrum er et must for lokale produkter",
      "Dim Çay-dalen (20 min med bil) har flotte elverestauranter",
    ],
    highlights: ["Kleopatra-stranden", "Alanya festning", "Dim-grotten", "Red Tower", "Damlataş-grotten"],
    searchQuery: "Alanya",
  },
  bangkok: {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    temp: "30–33°C",
    waterTemp: "—",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80",
    heroDescription: "Bangkok er en eksplosjon av smaker, farger og opplevelser. Kombinér storbyens templer og street food med en forlengelse til Thailands øyer — og du har den ultimate høstferien.",
    whyVisit: [
      "Eksotisk storbyopplevelse med templer, markeder og street food",
      "Luksushoteller til en brøkdel av europeiske priser",
      "Enkel kombinasjon med strandparadiser som Koh Samui eller Phuket",
      "Oktober er slutten av regntiden — færre turister og lavere priser",
      "Utrolig matkultur — fra Michelin-gatemat til rooftop-dining",
    ],
    tips: [
      "Bo i Sukhumvit eller Silom for enkel tilgang til BTS Skytrain",
      "Grand Palace og Wat Pho bør besøkes tidlig på dagen (åpner 08:30)",
      "Chatuchak Weekend Market er verdens største utemarked — avsett en halv dag",
      "Fly videre til øyene etter 2–3 dager i Bangkok for strand og avslapping",
    ],
    highlights: ["Grand Palace", "Wat Arun", "Chatuchak Market", "Khao San Road", "Chinatown"],
    searchQuery: "Bangkok",
  },
}

interface Props {
  params: Promise<{ destinasjon: string }>
}

export async function generateStaticParams() {
  return Object.keys(DESTINATIONS).map((slug) => ({ destinasjon: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destinasjon } = await params
  const dest = DESTINATIONS[destinasjon]
  if (!dest) return {}
  return {
    title: `Høstferie ${dest.name} 2026 – Hoteller & tips | Sydenklar`,
    description: `Planlegg høstferie til ${dest.name}, ${dest.country}. ${dest.temp} i oktober. Finn de beste hotellene og få tips for en perfekt ferie.`,
    alternates: { canonical: `https://www.sydenklar.no/hostferie/${dest.slug}` },
  }
}

export default async function HostferieDestinasjonPage({ params }: Props) {
  const { destinasjon } = await params
  const dest = DESTINATIONS[destinasjon]
  if (!dest) return notFound()

  const checkIn = "2026-10-03"
  const checkOut = "2026-10-10"

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="absolute inset-0 h-[420px]">
          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep)]/70 to-[var(--deep)]/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <Link href="/hostferie" className="inline-flex items-center gap-1 text-white/60 text-sm mb-4 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Alle høstferie-destinasjoner
          </Link>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">
            Høstferie på {dest.name}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
            {dest.heroDescription}
          </p>
          <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
            <span>🌡️ {dest.temp}</span>
            <span>🌊 Havtemp: {dest.waterTemp}</span>
            <span>📍 {dest.country}</span>
          </div>
        </div>
      </section>

      <section className="bg-[var(--sand-light)] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* CTA */}
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--sand)] p-8 mb-12 text-center">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-3">
              Finn hotell i {dest.name} for høstferien
            </h2>
            <p className="text-[var(--muted)] mb-6">
              Søk blant hundrevis av hoteller — sammenlign priser og bestill direkte.
            </p>
            <Link
              href={`/hoteller?destinasjon=${encodeURIComponent(dest.searchQuery)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=2&rooms=1`}
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Søk hoteller i {dest.name}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Hvorfor */}
          <div className="mb-12">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-6">
              Hvorfor velge {dest.name} i høstferien?
            </h2>
            <ul className="space-y-3">
              {dest.whyVisit.map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[var(--coral)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-[var(--coral)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </span>
                  <span className="text-[var(--deep)]/80">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="mb-12">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-6">
              Reisetips for {dest.name}
            </h2>
            <div className="bg-white rounded-xl border border-[var(--sand)] divide-y divide-[var(--sand)]">
              {dest.tips.map((tip, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-3">
                  <span className="text-[var(--coral)] font-bold">{i + 1}.</span>
                  <span className="text-[var(--deep)]/80 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-12">
            <h2 className="font-display text-2xl text-[var(--deep)] mb-4">Ting å se og gjøre</h2>
            <div className="flex flex-wrap gap-3">
              {dest.highlights.map((h) => (
                <span key={h} className="bg-white border border-[var(--sand)] px-4 py-2 rounded-full text-sm text-[var(--deep)] font-medium">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Link
              href={`/hoteller?destinasjon=${encodeURIComponent(dest.searchQuery)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=2&rooms=1`}
              className="inline-flex items-center gap-2 bg-[var(--deep)] hover:bg-[var(--deep)]/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Se alle hoteller i {dest.name}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
