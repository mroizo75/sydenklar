"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

function LoggInnForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/konto"

  const [mode, setMode] = useState<"login" | "register">("login")
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Registrering feilet")
        setLoading(false)
        return
      }
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError(mode === "register" ? "Konto opprettet, men innlogging feilet. Prøv å logge inn manuelt." : "Feil e-post eller passord")
    } else {
      router.push(redirectTo)
      router.refresh()
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--deep)] outline-none focus:border-[var(--coral)] transition-colors bg-white"

  return (
    <div className="min-h-screen bg-[var(--sand-light)] flex items-start sm:items-center justify-center px-4 pt-8 pb-12 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-4">
          <Link href="/">
            <Image src="/logo-svart.png" alt="Sydenklar" width={400} height={150} className="h-20 sm:h-32 lg:h-46 w-auto mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-[var(--border)]">
            <button
              onClick={() => { setMode("login"); setError("") }}
              className={`py-4 text-sm font-medium transition-colors ${mode === "login" ? "text-[var(--deep)] border-b-2 border-[var(--coral)]" : "text-[var(--muted)] hover:text-[var(--deep)]"}`}
            >
              Logg inn
            </button>
            <button
              onClick={() => { setMode("register"); setError("") }}
              className={`py-4 text-sm font-medium transition-colors ${mode === "register" ? "text-[var(--deep)] border-b-2 border-[var(--coral)]" : "text-[var(--muted)] hover:text-[var(--deep)]"}`}
            >
              Opprett konto
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Fornavn *</label>
                  <input type="text" required value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="Kari" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Etternavn *</label>
                  <input type="text" required value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Nordmann" className={inputClass} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">E-post *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update("email", e.target.value)}
                placeholder="kari@eksempel.no"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Telefon</label>
                <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+47 900 00 000" className={inputClass} />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Passord *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder={mode === "register" ? "Minst 8 tegn" : "Ditt passord"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={inputClass + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--deep)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--coral)] text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Behandler...</>
              ) : mode === "login" ? (
                "Logg inn"
              ) : (
                "Opprett konto"
              )}
            </button>

            {mode === "register" && (
              <p className="text-xs text-[var(--muted)] text-center">
                Ved å opprette konto godtar du våre{" "}
                <Link href="/vilkar" className="text-[var(--coral)] hover:underline">vilkår</Link>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Vil du booke uten konto?{" "}
          <Link href="/hoteller" className="text-[var(--coral)] hover:underline font-medium">
            Søk etter hoteller
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoggInnPage() {
  return (
    <Suspense>
      <LoggInnForm />
    </Suspense>
  )
}
