"use client";

import { useEffect, useState } from "react";
import SearchWidget from "./SearchWidget";

const heroBgs = [
  {
    url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80",
    alt: "Luksuriøst strandhotell i Hellas",
  },
  {
    url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80",
    alt: "Moderne hotell med basseng",
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920&q=80",
    alt: "Sjarmerende boutique-hotell",
  },
];

const popularSearches = [
  "Barcelona", "Roma", "Kreta", "Tenerife", "Dubai", "Mallorca",
];

export default function HeroSection() {
  const [bgIndex, setBgIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % heroBgs.length);
        setFading(false);
      }, 800);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col">
      {/* Background Images — overflow-hidden kun her så dropdowns ikke klippes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {heroBgs.map((bg, i) => (
        <div
          key={bg.url}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === bgIndex ? (fading ? 0 : 1) : 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bg.url}
            alt={bg.alt}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Overlay gradient */}
      <div className="absolute inset-0 hero-gradient opacity-80" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      </div>{/* /overflow-hidden wrapper */}

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col flex-1">
          {/* Badge */}
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium tracking-wider uppercase px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
              Over 2 millioner hoteller verden over
            </span>
          </div>

          {/* Headline */}
          <div
            className={`mt-6 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl text-white leading-[1.05] max-w-3xl">
              Finn hotellet
              <br />
              <em className="italic text-[var(--gold)]">du drømmer om</em>
            </h1>
          </div>

          {/* Subheadline */}
          <div
            className={`mt-5 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
              Sammenlign tusenvis av hoteller — fra sjarmerende butikkhoteller
              til eksklusive resorter. Alltid best pris, alltid enkelt.
            </p>
          </div>

          {/* Search Widget */}
          <div
            className={`mt-10 transition-all duration-700 relative z-10 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <SearchWidget />
          </div>

          {/* Popular searches */}
          <div
            className={`mt-5 flex flex-wrap items-center gap-2 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "650ms" }}
          >
            <span className="text-white/50 text-xs font-medium">
              Populære:
            </span>
            {popularSearches.map((place) => (
              <a
                key={place}
                href={`/hoteller?destinasjon=${encodeURIComponent(place)}`}
                className="text-xs font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm"
              >
                {place}
              </a>
            ))}
          </div>

          {/* Stats bar */}
          <div
            className={`mt-auto pb-10 pt-16 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="flex flex-wrap gap-8">
              {[
                { value: "2M+", label: "Hoteller" },
                { value: "190+", label: "Land" },
                { value: "4.8★", label: "Snittkarakter" },
                { value: "24/7", label: "Kundestøtte" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display text-2xl text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-white/50 tracking-wide uppercase font-medium mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5">
        {heroBgs.map((_, i) => (
          <button
            key={i}
            onClick={() => setBgIndex(i)}
            className={`h-2.5 min-w-[10px] rounded-full transition-all duration-300 ${
              i === bgIndex ? "w-6 bg-white" : "w-2.5 bg-white/40"
            }`}
            aria-label={`Bakgrunnsbilde ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-5 h-9 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
