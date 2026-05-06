'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SUBJECTS = [
  'Spørsmål om booking',
  'Avbestilling',
  'Betaling og refusjon',
  'Teknisk problem',
  'Presse og media',
  'Partnerskap og B2B',
  'Annet',
]

export default function KontaktPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setFeedback(data.error || 'Noe gikk galt. Prøv igjen.')
        setStatus('error')
      } else {
        setFeedback(data.message)
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      }
    } catch {
      setFeedback('Nettverksfeil. Prøv igjen eller send e-post direkte.')
      setStatus('error')
    }
  }

  const inputBase = 'w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--deep)] placeholder-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--coral)]/25 focus:border-[var(--coral)] transition-all'

  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Selskap</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Ta kontakt</h1>
          <p className="text-white/55 text-base max-w-xl">Vi svarer innen én virkedag. Du kan også nå oss direkte på e-post eller telefon.</p>
        </div>
      </div>

      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* Form */}
            <div className="lg:col-span-3">
              {status === 'success' ? (
                <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl text-[var(--deep)] mb-2">Melding sendt!</h2>
                  <p className="text-[var(--muted)] text-sm">{feedback}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Navn *</label>
                      <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ditt navn" className={inputBase} autoComplete="name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">E-post *</label>
                      <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="din@epost.no" className={inputBase} autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Emne</label>
                    <select value={form.subject} onChange={e => update('subject', e.target.value)} className={inputBase}>
                      <option value="">Velg emne...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--deep)] mb-1.5">Melding *</label>
                    <textarea required value={form.message} onChange={e => update('message', e.target.value)} placeholder="Skriv din melding her..." rows={5} className={`${inputBase} resize-none`} />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{feedback}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors text-sm"
                  >
                    {status === 'loading' ? 'Sender...' : 'Send melding'}
                  </button>
                </form>
              )}
            </div>

            {/* Info panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-semibold text-[var(--deep)] text-sm mb-4">Direkte kontakt</h3>
                <div className="space-y-3">
                  <a href="mailto:post@sydenklar.no" className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-[var(--sea-light)] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-[var(--sea)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">E-post</p>
                      <p className="text-sm text-[var(--sea)] group-hover:text-[var(--deep)] transition-colors">post@sydenklar.no</p>
                    </div>
                  </a>
                  <a href="tel:+4791540824" className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-[var(--sea-light)] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-[var(--sea)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted)]">Telefon (man–fre 09–16)</p>
                      <p className="text-sm text-[var(--sea)] group-hover:text-[var(--deep)] transition-colors">915 40 824</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
                <h3 className="font-semibold text-[var(--deep)] text-sm mb-3">Adresse</h3>
                <address className="not-italic text-[var(--muted)] text-sm leading-relaxed">
                  Sydenklar AS<br />
                  Horgenveien 75<br />
                  3303 Hokksund<br />
                  Norge
                </address>
              </div>

              <div className="bg-[var(--sea-light)] rounded-2xl border border-[var(--sea)]/20 p-5">
                <p className="text-[var(--sea)] text-xs font-medium mb-1">Svartid</p>
                <p className="text-[var(--deep)] text-sm">Vi svarer normalt innen <strong>én virkedag</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
