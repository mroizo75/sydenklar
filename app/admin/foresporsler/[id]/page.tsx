import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTripInquiry, personCount, type OfferKind } from '@/lib/inquiries'
import { facilityLabel } from '@/lib/hotel-preferences'
import OfferForm from './OfferForm'

function nok(amount: number | null): string {
  if (!amount) return 'Ikke oppgitt'
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount)
}

function wanted(inquiry: { services: { hotell: boolean; transfer: boolean; leiebil: boolean; tog: boolean } }): string {
  return [
    inquiry.services.hotell && 'Hotellkatalog',
    inquiry.services.transfer && 'Transfer',
    inquiry.services.leiebil && 'Leiebil',
    inquiry.services.tog && 'Tog',
  ].filter(Boolean).join(' · ') || 'Ingen tjenester valgt'
}

export default async function ForesporselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const inquiry = await getTripInquiry(id)
  if (!inquiry) notFound()

  const persons = personCount(inquiry)
  const stay = `${inquiry.checkIn} – ${inquiry.checkOut}`
  const fields = buildFields(inquiry, persons, stay)

  return (
    <div style={{ maxWidth: '720px' }}>
      <Link href="/admin/foresporsler" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}>← Forespørsler</Link>
      <h1 style={{ margin: '12px 0 8px', fontSize: '28px', color: '#0F1923' }}>{inquiry.destination}</h1>
      <p style={{ margin: '0 0 6px', fontSize: '16px', color: '#0F1923' }}>
        {persons} personer · {stay} · {inquiry.flexibleDates ? 'omtrentlige datoer' : 'datoene er viktige'} · budsjett {nok(inquiry.budgetNok)}
      </p>
      <p style={{ margin: '0 0 6px', fontSize: '16px', color: '#0F1923' }}>{wanted(inquiry)}</p>
      {inquiry.services.hotell && (
        <p style={{ margin: '0 0 6px', fontSize: '16px', color: '#0F1923' }}>
          {inquiry.services.starsMin ? `Fra ${inquiry.services.starsMin} stjerner` : 'Alle stjerner'}
          {inquiry.services.facilities.length ? ` · ${inquiry.services.facilities.map(facilityLabel).join(', ')}` : ' · ingen fasiliteter valgt'}
        </p>
      )}
      <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#374151' }}>
        {inquiry.name} · {inquiry.email} · {inquiry.phone}
      </p>
      {inquiry.notes ? <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#374151' }}>{inquiry.notes}</p> : null}
      <p style={{ margin: '8px 0 20px', fontSize: '13px', color: '#6B7280' }}>
        {inquiry.status === 'tilbud_sendt' ? 'Tilbud er sendt. Du kan sende et nytt.' : 'Ny'} · {new Date(inquiry.createdAt).toLocaleString('nb-NO')}
      </p>

      {inquiry.services.hotell && (
        <p style={{ margin: '0 0 28px' }}>
          <Link href={`/admin/foresporsler/${inquiry.id}/katalog`} style={{ color: '#0F1923', fontWeight: 700 }}>
            Åpne hotellkatalog og lagre som PDF →
          </Link>
        </p>
      )}

      <OfferForm
        inquiryId={inquiry.id}
        budgetNok={inquiry.budgetNok}
        fields={fields}
        initialValidUntil={inquiry.offer?.validUntil || defaultValidUntil()}
      />
    </div>
  )
}

function buildFields(
  inquiry: NonNullable<Awaited<ReturnType<typeof getTripInquiry>>>,
  persons: number,
  stay: string,
) {
  const saved = inquiry.offer?.lines ?? []
  const price = (kind: OfferKind) => {
    const line = saved.find(item => item.kind === kind)
    return line && line.priceNok > 0 ? String(line.priceNok) : ''
  }
  const detail = `${persons} personer, ${stay}`
  const fields = []
  if (inquiry.services.hotell) {
    fields.push({ kind: 'hotell' as const, label: 'Hotell, kr', title: `Hotell i ${inquiry.destination}`, detail, price: price('hotell') })
  }
  if (inquiry.services.transfer) {
    fields.push({ kind: 'transfer' as const, label: 'Transfer, kr', title: 'Transfer', detail: inquiry.notes || detail, price: price('transfer') })
  }
  if (inquiry.services.leiebil) {
    fields.push({ kind: 'leiebil' as const, label: 'Leiebil, kr', title: 'Leiebil', detail, price: price('leiebil') })
  }
  if (inquiry.services.tog) {
    fields.push({ kind: 'tog' as const, label: 'Tog, kr', title: 'Togbilletter', detail: inquiry.notes || detail, price: price('tog') })
  }
  return fields
}

function defaultValidUntil(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}
