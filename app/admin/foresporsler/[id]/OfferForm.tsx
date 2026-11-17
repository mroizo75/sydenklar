'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OfferKind } from '@/lib/inquiries'

interface PriceField {
  kind: OfferKind
  label: string
  title: string
  detail: string
  price: string
}

export default function OfferForm({
  inquiryId,
  budgetNok,
  fields,
  initialValidUntil,
}: {
  inquiryId: string
  budgetNok: number | null
  fields: PriceField[]
  initialValidUntil: string
}) {
  const router = useRouter()
  const [lines, setLines] = useState(fields)
  const [validUntil, setValidUntil] = useState(initialValidUntil)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const total = lines.reduce((sum, line) => sum + (Number(line.price) || 0), 0)
  const overBudget = budgetNok != null && total > budgetNok

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priced = lines.filter(line => Number(line.price) > 0)
    if (priced.length === 0) {
      setStatus('error')
      setFeedback('Skriv inn minst én pris. Hotellkatalogen skriver du ut ved siden av.')
      return
    }
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch(`/api/admin/foresporsler/${inquiryId}/tilbud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intro: note,
          validUntil,
          flightNote: '',
          lines: priced.map(line => ({
            kind: line.kind,
            title: line.title,
            detail: line.detail,
            priceNok: Number(line.price),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.message || 'Kunne ikke sende tilbudet')
        setStatus('error')
        return
      }
      router.refresh()
      setStatus('idle')
      setFeedback(data.message)
    } catch {
      setFeedback('Nettverksfeil')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', maxWidth: '420px' }}>
      {lines.map((line, index) => (
        <label key={line.kind} style={labelStyle}>
          {line.label}
          <input
            inputMode="numeric"
            value={line.price}
            onChange={e => {
              const price = e.target.value.replace(/[^\d]/g, '')
              setLines(current => current.map((item, i) => (i === index ? { ...item, price } : item)))
            }}
            placeholder="0"
            style={{ ...fieldStyle, fontSize: '18px', fontWeight: 600 }}
          />
        </label>
      ))}

      <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: overBudget ? '#B45309' : '#0F1923' }}>
        Sum {total.toLocaleString('nb-NO')} kr
        {budgetNok != null ? ` · budsjett ${budgetNok.toLocaleString('nb-NO')} kr` : ''}
      </p>

      <label style={labelStyle}>
        Melding til kunden
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Valgfritt. Katalogen sender du som PDF." style={fieldStyle} />
      </label>

      <label style={labelStyle}>
        Tilbudet gjelder til
        <input type="date" required value={validUntil} onChange={e => setValidUntil(e.target.value)} style={fieldStyle} />
      </label>

      {feedback && (
        <p style={{ margin: 0, color: status === 'error' ? '#B91C1C' : '#15803D', fontSize: '14px' }}>{feedback}</p>
      )}

      <button type="submit" disabled={status === 'loading'} style={{
        background: '#E5623E',
        color: '#fff',
        border: 'none',
        borderRadius: '999px',
        padding: '12px 20px',
        fontWeight: 700,
        cursor: 'pointer',
        justifySelf: 'start',
      }}>
        {status === 'loading' ? 'Sender…' : 'Send tilbud'}
      </button>
    </form>
  )
}

const labelStyle: React.CSSProperties = { display: 'grid', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0F1923' }
const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontSize: '14px',
  fontWeight: 400,
  background: '#fff',
}
