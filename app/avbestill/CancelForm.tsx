'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CancelFormProps {
  partnerOrderId: string
  hotelName: string
  checkIn: string
  checkOut: string
  cancellationPolicy: string | null
}

export default function CancelForm({
  partnerOrderId,
  hotelName,
  checkIn,
  checkOut,
  cancellationPolicy,
}: CancelFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleCancel() {
    setStep('loading')
    try {
      const res = await fetch('/api/hotels/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerOrderId }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
        const hasPayable = data.amountPayable?.amount && parseFloat(data.amountPayable.amount) > 0
        if (data.refundError) {
          setErrorMessage(`Booking kansellert, men tilbakebetaling feilet: ${data.refundError}. Kontakt oss på hjelp@sydenklar.no.`)
        } else if (hasPayable && !data.refundId) {
          setErrorMessage(`Booking kansellert med gebyr ${data.amountPayable.amount} ${data.amountPayable.currency_code}. Ingen tilbakebetaling utbetales.`)
        }
      } else {
        setErrorMessage(data.error || 'Kansellering feilet. Kontakt oss på hjelp@sydenklar.no')
        setStep('error')
      }
    } catch {
      setErrorMessage('Noe gikk galt. Prøv igjen eller kontakt oss.')
      setStep('error')
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-500" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Booking kansellert</h2>
        <p className="text-[var(--muted)] mb-3">
          Bookingen din på <strong>{hotelName}</strong> er kansellert.
        </p>
        {errorMessage ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5 text-sm text-green-800">
            Tilbakebetaling er sendt til ditt betalingskort. Det kan ta 3–5 virkedager.
          </div>
        )}
        <button
          onClick={() => router.push('/konto')}
          className="inline-block bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Se mine bookinger
        </button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-500" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl text-[var(--deep)] mb-2">Kansellering feilet</h2>
        <p className="text-[var(--muted)] mb-6">{errorMessage}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setStep('confirm')}
            className="border border-[var(--border)] text-[var(--deep)] px-6 py-3 rounded-xl font-medium text-sm hover:bg-[var(--sand-light)] transition-colors"
          >
            Prøv igjen
          </button>
          <a
            href="mailto:hjelp@sydenklar.no"
            className="bg-[var(--coral)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity text-center"
          >
            Kontakt oss
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {cancellationPolicy && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">Avbestillingsvilkår</p>
          <p className="text-amber-700 leading-relaxed">{cancellationPolicy}</p>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
        <p className="font-semibold mb-1">Dette kan ikke angres</p>
        <p className="text-red-700">
          Avbestillingen er endelig. Eventuelle gebyrer belastes i henhold til avbestillingsvilkårene.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] p-4 mb-6 text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-[var(--muted)]">Hotell</span>
          <span className="font-medium text-[var(--deep)]">{hotelName}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[var(--muted)]">Innsjekk</span>
          <span className="font-medium text-[var(--deep)]">{checkIn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Utsjekk</span>
          <span className="font-medium text-[var(--deep)]">{checkOut}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 border border-[var(--border)] text-[var(--deep)] rounded-xl py-3.5 font-medium text-sm hover:bg-[var(--sand-light)] transition-colors"
        >
          Avbryt
        </button>
        <button
          onClick={handleCancel}
          disabled={step === 'loading'}
          className="flex-1 bg-red-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {step === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Kansellerer…
            </span>
          ) : (
            'Bekreft avbestilling'
          )}
        </button>
      </div>
    </div>
  )
}
