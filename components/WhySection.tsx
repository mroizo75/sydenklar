import { Shield, Zap, HeartHandshake, Star } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Søk på sekunder",
    description:
      "Vår lynraske motor søker gjennom millioner av hoteller og finner de beste prisene i sanntid — ingen venting, bare resultater.",
    color: "var(--coral)",
    bg: "var(--sand-light)",
  },
  {
    icon: Shield,
    title: "Trygg bestilling",
    description:
      "All betaling er kryptert og sikret. Du har full oversikt, full fleksibilitet og tilgang til gratis avbestilling på tusenvis av hoteller.",
    color: "var(--sea)",
    bg: "var(--sea-light)",
  },
  {
    icon: Star,
    title: "Ekte anmeldelser",
    description:
      "Kun verifiserte gjester kan anmelde. Ingen falske vurderinger — bare ærlige opplevelser som hjelper deg velge riktig hotell.",
    color: "var(--gold)",
    bg: "#FDF8EC",
  },
  {
    icon: HeartHandshake,
    title: "Vi er her for deg",
    description:
      "Noe gikk galt? Trenger du hjelp? Vårt støtteteam er tilgjengelig 24/7 på chat, telefon og e-post — på norsk.",
    color: "#7C6AF5",
    bg: "#F5F3FF",
  },
];

export default function WhySection() {
  return (
    <section className="bg-[var(--sand-light)] py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[var(--coral)] text-xs font-semibold uppercase tracking-widest">
            Hvorfor Sydenklar
          </span>
          <h2 className="font-display text-4xl lg:text-5xl text-[var(--deep)] mt-3">
            Reise gjort <em className="italic">enkelt</em>
          </h2>
          <p className="text-[var(--muted)] mt-4 text-base leading-relaxed">
            Vi tror at å finne det perfekte hotellet ikke skal være en jobb. Det
            skal være begynnelsen på noe fantastisk.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-7 flex flex-col gap-4 group card-hover border border-[var(--border)]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: f.bg }}
                >
                  <Icon
                    size={22}
                    style={{ color: f.color }}
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--deep)] text-base">
                    {f.title}
                  </h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed mt-2">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-3xl bg-[var(--deep)] overflow-hidden relative">
          {/* Background accent */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-10"
            style={{
              background: "radial-gradient(ellipse at 80% 50%, var(--coral) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 lg:p-12">
            <div>
              <h3 className="font-display text-3xl lg:text-4xl text-white">
                Klar for din neste ferie?
              </h3>
              <p className="text-white/60 mt-2 text-sm max-w-md">
                Over 800 000 nordmenn bruker Sydenklar til å finne sitt perfekte
                hotell. Bli med du også.
              </p>
            </div>
            <a
              href="#søk"
              className="shrink-0 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[var(--coral)]/30 whitespace-nowrap"
            >
              Søk hoteller nå
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
