'use client'

import { useState } from 'react'
import { HOTEL_FACILITIES, type FacilityId } from '@/lib/hotel-preferences'

const inputBase =
  'w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--deep)] placeholder-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--coral)]/25 focus:border-[var(--coral)] transition-all'

const SERVICES = [
  { key: 'hotell', title: 'Hotellkatalog', text: 'En PDF du blar i og velger hotell fra.' },
  { key: 'transfer', title: 'Transfer', text: 'Transport mellom flyplass og hotell.' },
  { key: 'leiebil', title: 'Leiebil', text: 'Bil i prisen, hentes der det passer.' },
  { key: 'tog', title: 'Tog', text: 'Togbilletter på strekningen du trenger.' },
] as const

type ServiceKey = (typeof SERVICES)[number]['key']

export default function InquiryForm() {
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [flexibleDates, setFlexibleDates] = useState(true)
  const [persons, setPersons] = useState('2')
  const [budgetNok, setBudgetNok] = useState('')
  const [picked, setPicked] = useState<Record<ServiceKey, boolean>>({
    hotell: true,
    transfer: false,
    leiebil: false,
    tog: false,
  })
  const [starsMin, setStarsMin] = useState<0 | 3 | 4 | 5>(0)
  const [facilities, setFacilities] = useState<FacilityId[]>([])
  const [notes, setNotes] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  function toggle(key: ServiceKey) {
    setPicked(current => ({ ...current, [key]: !current[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/foresporsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          checkIn,
          checkOut,
          flexibleDates,
          persons: Number(persons),
          budgetNok: Number(budgetNok),
          hotell: picked.hotell,
          transfer: picked.transfer,
          leiebil: picked.leiebil,
          tog: picked.tog,
          starsMin: picked.hotell ? starsMin : 0,
          facilities: picked.hotell ? facilities : [],
          notes,
          name,
          email,
          phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.message || 'Noe gikk galt. Prøv igjen.')
        setStatus('error')
        return
      }
      setFeedback(data.message)
      setStatus('success')
    } catch {
      setFeedback('Nettverksfeil. Prøv igjen, eller ring 915 40 824.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Forespørselen er sendt</h2>
        <p className="text-[var(--muted)] text-sm">{feedback}</p>
        <p className="text-[var(--muted)] text-sm mt-3">Du kan også ringe 915 40 824, man–fre 09–16.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-[var(--border)] p-6 sm:p-8 space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="destination">Hvor *</label>
        <input id="destination" required value={destination} onChange={e => setDestination(e.target.value)} placeholder="Italia" className={inputBase} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="checkIn">Fra *</label>
          <input id="checkIn" type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inputBase} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="checkOut">Til *</label>
          <input id="checkOut" type="date" required value={checkOut} min={checkIn || undefined} onChange={e => setCheckOut(e.target.value)} className={inputBase} />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[var(--deep)] mb-2">Er dagene låst?</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFlexibleDates(false)}
            className={`text-left rounded-2xl border p-3 ${flexibleDates ? 'border-[var(--border)] bg-white' : 'border-[var(--deep)] bg-[var(--deep)] text-white'}`}
          >
            <span className="block text-sm font-medium">Datoene er viktige</span>
            <span className={`block text-xs mt-0.5 ${flexibleDates ? 'text-[var(--muted)]' : 'text-white/70'}`}>Vi priser akkurat disse dagene.</span>
          </button>
          <button
            type="button"
            onClick={() => setFlexibleDates(true)}
            className={`text-left rounded-2xl border p-3 ${flexibleDates ? 'border-[var(--coral)] bg-[var(--coral)]/5' : 'border-[var(--border)] bg-white'}`}
          >
            <span className="block text-sm font-medium text-[var(--deep)]">Omtrentlige datoer</span>
            <span className="block text-xs mt-0.5 text-[var(--muted)]">Vi flytter noen dager om det gir mer for pengene.</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="persons">Personer *</label>
          <input id="persons" type="number" min={1} max={20} required value={persons} onChange={e => setPersons(e.target.value)} className={inputBase} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="budget">Budsjett, kr *</label>
          <input id="budget" inputMode="numeric" required value={budgetNok} onChange={e => setBudgetNok(e.target.value.replace(/[^\d]/g, ''))} placeholder="40000" className={inputBase} />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-[var(--deep)] mb-1.5">Dette kan vi bestille</legend>
        {SERVICES.map(service => (
          <label key={service.key} className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer ${picked[service.key] ? 'border-[var(--coral)] bg-[var(--coral)]/5' : 'border-[var(--border)]'}`}>
            <input type="checkbox" checked={picked[service.key]} onChange={() => toggle(service.key)} className="mt-0.5 accent-[var(--coral)]" />
            <span>
              <span className="block text-sm font-medium text-[var(--deep)]">{service.title}</span>
              <span className="block text-xs text-[var(--muted)]">{service.text}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {picked.hotell && (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] p-4">
          <div>
            <p className="text-xs font-medium text-[var(--deep)] mb-2">Stjerner</p>
            <div className="flex flex-wrap gap-2">
              {([
                [0, 'Alle'],
                [3, 'Fra 3'],
                [4, 'Fra 4'],
                [5, '5'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStarsMin(value)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${starsMin === value ? 'bg-[var(--deep)] text-white border-[var(--deep)]' : 'bg-white text-[var(--deep)] border-[var(--border)]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--deep)] mb-2">Fasiliteter som er viktige</p>
            <div className="flex flex-wrap gap-2">
              {HOTEL_FACILITIES.map(facility => {
                const on = facilities.includes(facility.id)
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => setFacilities(current => on ? current.filter(id => id !== facility.id) : [...current, facility.id])}
                    className={`px-3 py-1.5 rounded-full text-sm border ${on ? 'bg-[var(--coral)] text-white border-[var(--coral)]' : 'bg-white text-[var(--deep)] border-[var(--border)]'}`}
                  >
                    {facility.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="notes">Detaljer</label>
        <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Flyplass, togstrekning, hentested, barnesete" className={`${inputBase} resize-none`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="name">Navn *</label>
          <input id="name" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputBase} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="phone">Telefon *</label>
          <input id="phone" type="tel" required autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputBase} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--deep)] mb-1.5" htmlFor="email">E-post *</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputBase} />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{feedback}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[var(--coral)] hover:bg-[var(--coral-dark)] disabled:opacity-60 text-white font-medium py-3.5 rounded-full transition-colors text-sm"
      >
        {status === 'loading' ? 'Sender…' : 'Send forespørsel'}
      </button>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Hver tjeneste er en egen bestilling. Flybilletter selger vi ikke — si fra hvis du vil bli formidlet videre.
      </p>
    </form>
  )
}
