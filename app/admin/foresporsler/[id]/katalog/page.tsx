import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTripInquiry, personCount } from '@/lib/inquiries'
import { searchHotelsForCatalog } from '@/lib/hotel-static-db'
import { facilityLabel } from '@/lib/hotel-preferences'
import { PrintCatalogButton } from './PrintCatalogButton'

export default async function KatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const inquiry = await getTripInquiry(id)
  if (!inquiry) notFound()

  const hotels = inquiry.services.hotell
    ? searchHotelsForCatalog(inquiry.destination, {
        starsMin: inquiry.services.starsMin,
        facilities: inquiry.services.facilities,
      })
    : []
  const persons = personCount(inquiry)

  return (
    <div>
      <style>{`
        @media print {
          nav { display: none !important; }
          main { max-width: none !important; padding: 0 !important; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link href={`/admin/foresporsler/${inquiry.id}`} style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}>← Forespørselen</Link>
        <PrintCatalogButton />
      </div>

      <p style={{ margin: 0, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '11px', color: '#C9A84C', fontWeight: 700 }}>Sydenklar reisekatalog</p>
      <h1 style={{ margin: '8px 0', fontSize: '32px', color: '#0F1923' }}>{inquiry.destination}</h1>
      <p style={{ margin: '0 0 8px', color: '#374151' }}>
        {persons} personer · {inquiry.checkIn} – {inquiry.checkOut}
        {inquiry.flexibleDates ? ' · datoene kan flyttes for bedre pris' : ' · datoene er viktige'}
        {inquiry.services.starsMin ? ` · fra ${inquiry.services.starsMin} stjerner` : ''}
        {inquiry.services.facilities.length ? ` · ${inquiry.services.facilities.map(facilityLabel).join(', ')}` : ''}
        {inquiry.budgetNok ? ` · budsjett ${inquiry.budgetNok.toLocaleString('nb-NO')} kr` : ''}
      </p>
      <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px', maxWidth: '640px' }}>
        Se gjennom hotellene og si fra hvilke du vil vi skal bestille. Transfer, leiebil og tog kan legges til som egne bestillinger. Ring 915 40 824.
      </p>

      {hotels.length === 0 ? (
        <p style={{ color: '#6B7280' }}>Ingen hoteller med disse stjernene og fasilitetene for «{inquiry.destination}». Senk stjernekravet eller fjern en fasilitet, eller sjekk at stedsnavnet finnes i hotellbasen.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {hotels.map(hotel => (
            <article key={hotel.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', breakInside: 'avoid', background: '#fff' }}>
              {hotel.first_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hotel.first_image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '72px', background: '#0F1923' }} />
              )}
              <div style={{ padding: '12px 14px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{hotel.city_name}{hotel.country_name ? `, ${hotel.country_name}` : ''}</p>
                <h2 style={{ margin: '4px 0', fontSize: '16px', color: '#0F1923' }}>{hotel.name}</h2>
                {hotel.star_rating ? <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{hotel.star_rating} stjerner</p> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
