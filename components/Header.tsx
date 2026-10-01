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

interface SessionUser {
  firstName?: string
  name?: string | null
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

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen])

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const sessionUser = session?.user as SessionUser | undefined
  const firstName = sessionUser?.firstName ?? sessionUser?.name?.split(" ")[0]
  const showSolidHeader = scrolled || menuOpen

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-visible ${
        showSolidHeader ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src={showSolidHeader ? "/logo-svart.png" : "/logo-hvit.png"}
              alt="Sydenklar.no"
              width={500}
              height={200}
              className="w-[172px] sm:w-[200px] lg:w-[240px] h-auto max-h-14 lg:max-h-20 object-contain transition-opacity duration-300 group-hover:opacity-80"
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
            className={`lg:hidden w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
              showSolidHeader
                ? "text-[var(--deep)] bg-[var(--sand-light)]"
                : "text-white bg-black/15 backdrop-blur-sm"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full h-[calc(100svh-4rem)] bg-white border-t border-[var(--border)] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Hovedmeny">
          <div className="px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-14 flex items-center justify-between px-4 py-3 rounded-2xl text-[var(--deep)] text-lg font-medium hover:bg-[var(--sand-light)] transition-colors"
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
            <div className="border-t border-[var(--border)] mt-3 pt-5 flex flex-col gap-3">
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
                    href="/logg-inn?tab=register"
                    className="min-h-12 px-4 py-3 text-center bg-[var(--deep)] text-white font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registrer deg
                  </Link>
                  <Link
                    href="/logg-inn"
                    className="min-h-12 px-4 py-3 text-center text-[var(--deep)] font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--sand-light)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Logg inn
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
