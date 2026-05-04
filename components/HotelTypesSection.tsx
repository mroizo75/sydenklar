const hotelTypes = [
  {
    label: "Strandhotell",
    emoji: "🏖️",
    description: "Sol, sand og bølger",
    href: "/hoteller?destinasjon=Mallorca",
  },
  {
    label: "Byhotell",
    emoji: "🏙️",
    description: "Midt i hjertet av byen",
    href: "/hoteller?destinasjon=Paris",
  },
  {
    label: "Resort & Spa",
    emoji: "🌿",
    description: "Avslapping og velvære",
    href: "/hoteller?destinasjon=Bali",
  },
  {
    label: "Boutique",
    emoji: "✨",
    description: "Unikt og med personlighet",
    href: "/hoteller?destinasjon=Barcelona",
  },
  {
    label: "Familievennlig",
    emoji: "👨‍👩‍👧",
    description: "Perfekt for hele familien",
    href: "/hoteller?destinasjon=Roma",
  },
  {
    label: "Luksushotell",
    emoji: "🏆",
    description: "Førsteklasses opplevelser",
    href: "/hoteller?destinasjon=Dubai",
  },
];

export default function HotelTypesSection() {
  return (
    <section className="bg-[var(--deep)] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[var(--gold)] text-xs font-semibold uppercase tracking-widest opacity-80">
              Alle typer overnattinger
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-white mt-2">
              Finn din <em className="italic text-[var(--gold)]">stil</em>
            </h2>
          </div>
          <a
            href="/hoteller"
            className="text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 animated-link"
          >
            Alle kategorier
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {hotelTypes.map((type) => (
            <a
              key={type.label}
              href={type.href}
              className="group flex flex-col items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl px-4 py-6 text-center transition-all duration-300"
            >
              <span className="text-3xl">{type.emoji}</span>
              <div>
                <p className="text-white text-sm font-semibold">{type.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{type.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
