const testimonials = [
  {
    name: "Marte L.",
    from: "Oslo",
    text: "Fant det perfekte strandhotellet på Kreta på under 5 minutter. Prisene var langt bedre enn alt jeg hadde sett andre steder. Kommer definitivt tilbake!",
    rating: 5,
    avatar: "ML",
    color: "#E8714A",
  },
  {
    name: "Jonas R.",
    from: "Bergen",
    text: "Enkelt, raskt og oversiktlig. Filtreringen er super — filtrerte på 'gratis avbestilling' og fant et nydelig hotell i Roma til akkurat budsjettet mitt.",
    rating: 5,
    avatar: "JR",
    color: "#2E7EA6",
  },
  {
    name: "Silje M.",
    from: "Trondheim",
    text: "Vi var en gruppe på 12 fra jobben som trengte to netter i Barcelona. Sydenklar ordnet alt for oss uten stress. Glimrende service.",
    rating: 5,
    avatar: "SM",
    color: "#7C6AF5",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[var(--coral)] text-xs font-semibold uppercase tracking-widest">
            Hva gjestene sier
          </span>
          <h2 className="font-display text-4xl lg:text-5xl text-[var(--deep)] mt-3">
            Ekte opplevelser,
            <br />
            <em className="italic">ekte historier</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[var(--sand-light)] rounded-2xl p-7 flex flex-col gap-5 border border-[var(--border)] card-hover"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="var(--gold)">
                    <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1L2 5.3l4.2-.7L8 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[var(--deep)] text-sm leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--deep)]">{t.name}</p>
                  <p className="text-xs text-[var(--muted)]">{t.from}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {[
            { value: "4.8/5", label: "Snittkarakter fra 120 000+ anmeldelser" },
            { value: "800K+", label: "Norske brukere" },
            { value: "98%", label: "Vil anbefale Sydenklar" },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <p className="font-display text-3xl text-[var(--deep)]">{badge.value}</p>
              <p className="text-[var(--muted)] text-xs mt-1 max-w-[140px]">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
