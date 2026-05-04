const destinations = [
  {
    name: "Barcelona",
    country: "Spania",
    hotels: "1 240",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
    tag: "Populær",
  },
  {
    name: "Roma",
    country: "Italia",
    hotels: "2 100",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    tag: "Kulturfavoritt",
  },
  {
    name: "Santorini",
    country: "Hellas",
    hotels: "480",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    tag: "Romantisk",
  },
  {
    name: "Dubai",
    country: "UAE",
    hotels: "3 600",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    tag: "Luksus",
  },
  {
    name: "Tenerife",
    country: "Spania",
    hotels: "890",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
    tag: "Sol & Strand",
  },
  {
    name: "Mallorca",
    country: "Spania",
    hotels: "1 050",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
    tag: "Familievennlig",
  },
  {
    name: "Paris",
    country: "Frankrike",
    hotels: "2 800",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    tag: "Romantisk bytur",
  },
  {
    name: "Bali",
    country: "Indonesia",
    hotels: "1 320",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    tag: "Eksotisk paradis",
  },
];

export default function DestinationsSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[var(--coral)] text-xs font-semibold uppercase tracking-widest">
              Populære destinasjoner
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-[var(--deep)] mt-2">
              Drømmesteder
              <br />
              <em className="italic">venter på deg</em>
            </h2>
          </div>
          <a
            href="/destinasjoner"
            className="text-sm font-semibold text-[var(--sea)] hover:text-[var(--deep)] transition-colors flex items-center gap-1.5 shrink-0 animated-link"
          >
            Se alle destinasjoner
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((dest, i) => (
            <a
              key={dest.name}
              href={`/hoteller?destinasjon=${encodeURIComponent(dest.name)}`}
              className={`group relative overflow-hidden rounded-2xl card-hover ${
                i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
              style={{ minHeight: i === 0 ? "420px" : "220px" }}
            >
              {/* Image */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dest.image}
                  alt={`Hoteller i ${dest.name}, ${dest.country}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/15 backdrop-blur-sm text-white border border-white/20 px-3 py-1.5 rounded-full">
                  {dest.tag}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-white text-2xl lg:text-3xl">
                      {dest.name}
                    </p>
                    <p className="text-white/70 text-sm mt-0.5">{dest.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">
                      {dest.hotels}
                    </p>
                    <p className="text-white/60 text-xs">hoteller</p>
                  </div>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
