import Image from "next/image"
import NewsletterSignup from "@/components/NewsletterSignup"

const footerLinks = {
  Søk: [
    { label: "Hoteller", href: "/hoteller" },
    { label: "Destinasjoner", href: "/destinasjoner" },
    { label: "Tilbud", href: "/tilbud" },
    { label: "Pakkereiser", href: "/pakkereiser" },
    { label: "Reisetips", href: "/reisetips" },
  ],
  Selskap: [
    { label: "Om oss", href: "/om-oss" },
    { label: "Karriere", href: "/karriere" },
    { label: "Presse", href: "/presse" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  Hjelp: [
    { label: "Kundestøtte", href: "/support" },
    { label: "Bestillingsveiledning", href: "/hjelp/bestilling" },
    { label: "Avbestilling", href: "/hjelp/avbestilling" },
    { label: "FAQ", href: "/faq" },
  ],
  Juridisk: [
    { label: "Personvern", href: "/personvern" },
    { label: "Vilkår", href: "/vilkar" },
    { label: "Cookies", href: "/cookies" },
    { label: "Tilgjengelighet", href: "/tilgjengelighet" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--deep)] border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="flex items-start mb-5">
              <Image
                src="/logo-hvit.png"
                alt="Sydenklar.no"
                width={500}
                height={200}
                className="w-full max-w-[320px] h-auto object-contain"
              />
            </a>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Din tryggeste vei til verdens beste hoteller. Sammenlign, velg og
              bestill — alt på ett sted.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                { name: "Instagram", icon: "IG" },
                { name: "Facebook", icon: "FB" },
                { name: "TikTok", icon: "TT" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={`https://www.${s.name.toLowerCase()}.com/sydenklar`}
                  aria-label={`Sydenklar på ${s.name}`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-xs font-bold transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-white/90 text-sm font-semibold mb-4">{category}</p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/45 hover:text-white/80 text-sm transition-colors animated-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
            <div className="shrink-0">
              <p className="text-white/90 text-sm font-semibold mb-1">Ukentlig reiseinspirasjon</p>
              <p className="text-white/40 text-xs max-w-xs">Hoteller og destinasjoner rett i innboksen — gratis.</p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <NewsletterSignup variant="dark" />
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Payment bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

            {/* Security badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
              {/* SSL / Sikker forbindelse */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="#4ade80" strokeWidth="2"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-white/50 text-xs font-medium">SSL-sikret</span>
              </div>

              {/* 3D Secure */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M12 2L4 6v6c0 5 3.6 9.7 8 11 4.4-1.3 8-6 8-11V6L12 2z" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white/50 text-xs font-medium">3D Secure</span>
              </div>

              {/* Kryptert betaling */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white/50 text-xs font-medium">Kryptert</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[
                { src: "/payments/visa.png", alt: "Visa" },
                { src: "/payments/Mastercard_Yuhu.svg.png", alt: "Mastercard" },
                { src: "/payments/Klarna_Payment_Badge.svg.png", alt: "Klarna" },
                { src: "/payments/apple-pay.svg", alt: "Apple Pay" },
                { src: "/payments/Google_Pay_Acceptance_Mark.svg.png", alt: "Google Pay" },
              ].map((p) => (
                <Image
                  key={p.alt}
                  src={p.src}
                  alt={p.alt}
                  width={52}
                  height={32}
                  className="h-7 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Sydenklar AS. Alle rettigheter reservert.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/20 text-xs">Norsk</span>
            <span className="text-white/20 text-xs">NOK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
