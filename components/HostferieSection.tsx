import Image from "next/image"
import Link from "next/link"

const DESTINATIONS = [
  {
    slug: "gran-canaria",
    name: "Gran Canaria",
    temp: "24–27°C",
    image: "https://images.unsplash.com/photo-1567942712661-82b9b407abbf?w=800&q=80",
  },
  {
    slug: "kreta",
    name: "Kreta",
    temp: "22–26°C",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
  },
  {
    slug: "tenerife",
    name: "Tenerife",
    temp: "24–28°C",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
  },
  {
    slug: "antalya",
    name: "Antalya",
    temp: "25–30°C",
    image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80",
  },
]

export default function HostferieSection() {
  return (
    <section className="bg-[var(--sand-light)] py-14 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 sm:mb-12">
          <div>
            <span className="text-[var(--coral)] text-xs font-semibold uppercase tracking-widest">
              Høstferie 2026
            </span>
            <h2 className="font-display text-[2rem] sm:text-4xl lg:text-5xl text-[var(--deep)] leading-tight mt-2">
              Slipper du unna
              <br />
              <em className="italic">den norske høsten?</em>
            </h2>
          </div>
          <Link
            href="/hostferie"
            className="min-h-11 text-sm font-semibold text-[var(--sea)] hover:text-[var(--deep)] transition-colors flex items-center gap-1.5 shrink-0"
          >
            Se alle høstferie-mål
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.slug}
              href={`/hostferie/${dest.slug}`}
              className="group relative overflow-hidden rounded-2xl flex-none w-[78vw] sm:w-auto min-h-[230px] sm:min-h-[260px] snap-start"
            >
              <div className="absolute inset-0">
                <Image
                  src={dest.image}
                  alt={`Høstferie ${dest.name}`}
                  fill
                  sizes="(max-width: 639px) 78vw, (max-width: 1023px) 50vw, 25vw"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20 px-3 py-1.5 rounded-full">
                  {dest.temp}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-display text-white text-2xl">{dest.name}</p>
                <p className="text-white/70 text-sm mt-0.5">Finn hoteller for uke 40</p>
              </div>
              <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[var(--muted)] text-sm mb-4">
            Uke 40 nærmer seg — bestill tidlig for best utvalg og pris.
          </p>
          <Link
            href="/hoteller?destinasjon=Gran%20Canaria&checkIn=2026-10-03&checkOut=2026-10-10&adults=2&rooms=1"
            className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Søk høstferie-hoteller
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
