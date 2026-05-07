"use client";

import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Hoteller", href: "/hoteller" },
  { label: "Pakkereiser", href: "/pakkereiser", badge: "Snart" },
  { label: "Tilbud", href: "/tilbud" },
  { label: "Destinasjoner", href: "/destinasjoner" },
];

interface HeaderProps {
  solid?: boolean
}

export default function Header({ solid = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(solid);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (solid) return
    const handler = () => setScrolled(window.scrollY > 40);
    handler()
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [solid]);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const firstName = (session?.user as any)?.firstName ?? session?.user?.name?.split(" ")[0];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-visible ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src={scrolled ? "/logo-svart.png" : "/logo-hvit.png"}
              alt="Sydenklar.no"
              width={500}
              height={200}
              className="h-24 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium tracking-wide animated-link flex items-center gap-2 transition-colors ${
                  scrolled
                    ? "text-[var(--deep)] hover:text-[var(--coral)]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-body font-600 uppercase tracking-wider bg-[var(--coral)] text-white px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/konto"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    scrolled ? "text-[var(--deep)] hover:text-[var(--coral)]" : "text-white/90 hover:text-white"
                  }`}
                >
                  <User size={16} />
                  {firstName || "Min konto"}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
                    scrolled
                      ? "bg-[var(--sand-light)] text-[var(--deep)] hover:bg-[var(--sand)]"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  Logg ut
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/logg-inn"
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? "text-[var(--deep)] hover:text-[var(--coral)]" : "text-white/90 hover:text-white"
                  }`}
                >
                  Logg inn
                </Link>
                <Link
                  href="/logg-inn?tab=register"
                  className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all ${
                    scrolled
                      ? "bg-[var(--deep)] text-white hover:bg-[var(--coral)]"
                      : "bg-white text-[var(--deep)] hover:bg-[var(--sand)]"
                  }`}
                >
                  Registrer deg
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? "text-[var(--deep)]" : "text-white"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Åpne meny"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--border)] shadow-lg" role="dialog" aria-modal="true">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-[var(--deep)] font-medium hover:bg-[var(--sand-light)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--coral)] text-white px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] mt-2 pt-4 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/konto"
                    className="px-4 py-3 text-center text-[var(--deep)] font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--sand-light)] transition-colors flex items-center justify-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={16} /> Min konto
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }) }}
                    className="px-4 py-3 text-center text-[var(--muted)] font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--sand-light)] transition-colors"
                  >
                    Logg ut
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/logg-inn"
                    className="px-4 py-3 text-center text-[var(--deep)] font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--sand-light)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Logg inn
                  </Link>
                  <Link
                    href="/logg-inn"
                    className="px-4 py-3 text-center bg-[var(--deep)] text-white font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registrer deg
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
