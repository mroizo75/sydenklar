import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Destinasjoner – Sydenklar.no',
  description: 'Utforsk populære reisemål i Europa, Midtøsten og Asia. Finn hotell i Barcelona, Roma, Dubai, Bali og mange flere.',
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
    name: 'Barcelona',
    country: 'Spania',
    hotels: '1 240',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80',
    tag: 'Populær',
    description: 'Arkitektur, strand og fantastisk gastronomi — Barcelona har noe for enhver reisende.',
    highlights: ['Sagrada Família', 'La Rambla', 'Barceloneta-stranden'],
  },
  {
    name: 'Roma',
    country: 'Italia',
    hotels: '2 100',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80',
    tag: 'Kulturfavoritt',
    description: 'Den evige by byr på 2 500 års historisk arv, verdsklasse mat og uovertruffen stemning.',
    highlights: ['Colosseum', 'Vatikanet', 'Piazza Navona'],
  },
  {
    name: 'Santorini',
    country: 'Hellas',
    hotels: '480',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=80',
    tag: 'Romantisk',
    description: 'Hvite hus med blå kupler, dramatisk kaldera-utsikt og solnedganger som stopper pusten.',
    highlights: ['Oia solnedgang', 'Sort sandstrand', 'Vulkankrater'],
  },
  {
    name: 'Dubai',
    country: 'UAE',
    hotels: '3 600',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80',
    tag: 'Luksus',
    description: 'Verden rekord, luksus shopping og ørkenopplevelser — Dubai er en by uten grenser.',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari'],
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
    name: 'Mallorca',
    country: 'Spania',
    hotels: '1 050',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=900&q=80',
    tag: 'Familievennlig',
    description: 'Det perfekte ferieøyet med krystallklart vann, sjarmerende landsbyer og god mat.',
    highlights: ['Cala Deià', 'Palma gamlebyen', 'Tramuntana-fjellene'],
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
    name: 'Amsterdam',
    country: 'Nederland',
    hotels: '1 180',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=900&q=80',
    tag: 'Kulturby',
    description: 'Kanalromantikk, verdens beste museer og en avslappet atmosfære som er unikt Amsterdam.',
    highlights: ['Rijksmuseum', 'Anne Franks hus', 'Vondelparken'],
  },
  {
    name: 'Lisboa',
    country: 'Portugal',
    hotels: '920',
    image: 'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=900&q=80',
    tag: 'Skjult perle',
    description: 'Fargerike azulejo-fliser, historiske trikker og fortryllende fado-musikk.',
    highlights: ['Alfama-bydelen', 'Belém-tårnet', 'Sintra dagtur'],
  },
  {
    name: 'Phuket',
    country: 'Thailand',
    hotels: '2 400',
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=900&q=80',
    tag: 'Strandparadis',
    description: 'Turkist hav, jungelkledte fjell og et pulserende nattliv — Phuket har det hele.',
    highlights: ['Patong Beach', 'Phi Phi-øyene', 'Big Buddha'],
  },
  {
    name: 'Marrakech',
    country: 'Marokko',
    hotels: '680',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&q=80',
    tag: 'Eksotisk',
    description: 'Labyrintiske souker, storslåtte riad-hotell og den pulserende Jemaa el-Fna-plassen.',
    highlights: ['Medina-souken', 'Majorelle-hagen', 'Saadian-gravkamrene'],
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
