import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Destinasjoner – Sydenklar.no',
  description: 'Nordmenns mest populære reisemål — Gran Canaria, Kreta, Oslo, Tromsø, Tenerife, Antalya og mange flere. Finn og sammenlign hoteller på Sydenklar.no.',
}

interface Destination {
  name: string
  country: string
  hotels: string
  image: string
  tag: string
  description: string
  highlights: string[]
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Gran Canaria',
    country: 'Spania',
    hotels: '1 180',
    image: 'https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=900&q=80',
    tag: 'Nordmenns favoritt',
    description: 'Nordmenns desiderte vinterfavoritt — sol, sand og Maspalomas-klittene hele året.',
    highlights: ['Maspalomas-klittene', 'Puerto de Mogán', 'Las Canteras-stranden'],
  },
  {
    name: 'Kreta',
    country: 'Hellas',
    hotels: '1 640',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80',
    tag: 'Charter-kongen',
    description: 'Hellas sin største øy — historiske ruiner, turkise bukter og verdens beste retsina.',
    highlights: ['Knosos-palasset', 'Balos-lagune', 'Elafonisi-stranden'],
  },
  {
    name: 'Oslo',
    country: 'Norge',
    hotels: '980',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80',
    tag: 'Citybreak',
    description: 'Fjord, natur og pulserende storbyliv side om side — Oslo er en by som overrasker.',
    highlights: ['Operahuset', 'Vigelandsparken', 'Aker Brygge'],
  },
  {
    name: 'Tromsø',
    country: 'Norge',
    hotels: '210',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900&q=80',
    tag: 'Nordlysparadiset',
    description: 'Verdens beste sted for nordlys — og midnattssol om sommeren. Arktisk eventyrlighet.',
    highlights: ['Nordlys-jakt', 'Ishavskatedralen', 'Hundekjøring'],
  },
  {
    name: 'Tenerife',
    country: 'Spania',
    hotels: '890',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80',
    tag: 'Sol & Strand',
    description: 'Kanarisk sol hele året, vulkanske landskap og strender for alle smak.',
    highlights: ['Teide nasjonalpark', 'Playa de las Américas', 'Los Gigantes'],
  },
  {
    name: 'Antalya',
    country: 'Tyrkia',
    hotels: '2 100',
    image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=900&q=80',
    tag: 'Sommerens hit',
    description: 'Turkias solkyst med krystallklart hav, all-inclusive-resorts og tusenårig historie.',
    highlights: ['Lara-stranden', 'Oldebyen Perge', 'Düden-fossene'],
  },
  {
    name: 'Barcelona',
    country: 'Spania',
    hotels: '1 240',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80',
    tag: 'Populær bytur',
    description: 'Arkitektur, strand og fantastisk gastronomi — Barcelona har noe for enhver reisende.',
    highlights: ['Sagrada Família', 'La Rambla', 'Barceloneta-stranden'],
  },
  {
    name: 'Bergen',
    country: 'Norge',
    hotels: '340',
    image: 'https://images.unsplash.com/photo-1601439892716-dc3d6dc4e5c9?w=900&q=80',
    tag: 'Norsk perle',
    description: 'Porten til fjordene — Bryggen, fiskemarkedet og Fløibanen er bare starten.',
    highlights: ['Bryggen verdensarv', 'Fløibanen', 'Hardangerfjorden'],
  },
  {
    name: 'Dubai',
    country: 'UAE',
    hotels: '3 600',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
    tag: 'Luksus',
    description: 'Verdensrekorder, luksusshopping og ørkenopplevelser — Dubai er en by uten grenser.',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari'],
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    hotels: '3 200',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=900&q=80',
    tag: 'Rekordvekst 2025',
    description: 'Templenes by — street food, pulstrende nattliv og en av Asias mest spennende storbyer.',
    highlights: ['Stor-palasset', 'Wat Pho-tempelet', 'Chatuchak-markedet'],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    hotels: '1 320',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80',
    tag: 'Eksotisk paradis',
    description: 'Ricesterrasser, tempelkomplekser og yogaretreat — Bali er som ingen annen plass.',
    highlights: ['Ubud riceterrasser', 'Uluwatu-tempelet', 'Seminyak-stranden'],
  },
  {
    name: 'Paris',
    country: 'Frankrike',
    hotels: '2 800',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
    tag: 'Romantisk bytur',
    description: 'Lyenes by — Eiffeltårnet, haute cuisine, mote og museer av verdensklasse.',
    highlights: ['Eiffeltårnet', 'Louvre', 'Montmartre'],
  },
]

export default function DestinasjonsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--sand-light)]">

        {/* Hero */}
        <div className="bg-[var(--deep)] pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-[var(--coral)] text-xs font-semibold uppercase tracking-widest mb-4">
              Populære reisemål
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
              Drømmesteder{' '}
              <em className="italic text-[var(--sand)]">venter på deg</em>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Fra europeiske storbyer til eksotiske øyparadiser — finn din neste reise blant {DESTINATIONS.length} håndplukkede destinasjoner.
            </p>
          </div>
        </div>

        {/* Destinations grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map(dest => (
              <Link
                key={dest.name}
                href={`/hoteller?destinasjon=${encodeURIComponent(dest.name)}`}
                className="group bg-white rounded-2xl ring-1 ring-[var(--border)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: '200px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={`Hoteller i ${dest.name}, ${dest.country}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-full">
                      {dest.tag}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="font-display text-white text-2xl">{dest.name}</p>
                      <p className="text-white/70 text-xs">{dest.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-sm">{dest.hotels}</p>
                      <p className="text-white/60 text-xs">hoteller</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">
                    {dest.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dest.highlights.map(h => (
                      <span key={h} className="text-[10px] font-medium bg-[var(--sand-light)] text-[var(--muted)] px-2 py-1 rounded-full">
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className="text-xs text-[var(--muted)]">Se ledige hoteller</span>
                    <span className="text-xs font-semibold text-[var(--coral)] group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
