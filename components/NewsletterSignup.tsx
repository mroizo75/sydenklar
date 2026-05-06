'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  variant?: 'light' | 'dark'
  className?: string
}

export default function NewsletterSignup({ variant = 'light', className = '' }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isDark = variant === 'dark'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Noe gikk galt. Prøv igjen.')
        setStatus('error')
        return
      }

      router.push('/nyhetsbrev/bekreftelse')
    } catch {
      setErrorMsg('Nettverksfeil. Prøv igjen.')
      setStatus('error')
    }
  }

  const inputBase =
    'w-full rounded-full px-4 py-3 text-sm outline-none border focus:ring-2 transition-all'
  const inputLight =
    'bg-white border-[var(--border)] text-[var(--deep)] placeholder-[var(--muted)] focus:ring-[var(--coral)]/30 focus:border-[var(--coral)]'
  const inputDark =
    'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/20 focus:border-white/40'

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            placeholder="Fornavn (valgfritt)"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className={`${inputBase} ${isDark ? inputDark : inputLight} sm:max-w-[160px]`}
            autoComplete="given-name"
          />
          <input
            type="email"
            placeholder="Din e-postadresse"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={`${inputBase} ${isDark ? inputDark : inputLight} flex-1`}
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex-shrink-0 bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-60 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm whitespace-nowrap"
          >
            {status === 'loading' ? 'Sender…' : 'Meld meg på'}
          </button>
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-1 px-2">{errorMsg}</p>
        )}

        <p className={`text-xs mt-1 px-2 ${isDark ? 'text-white/35' : 'text-[var(--muted)]'}`}>
          Gratis · Avmeld når som helst · Ingen spam
        </p>
      </form>
    </div>
  )
}
