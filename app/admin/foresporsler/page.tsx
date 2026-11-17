import Link from 'next/link'
import { listTripInquiries } from '@/lib/inquiries'

function nok(amount: number | null): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount)
}

export default async function ForesporslerPage() {
  const inquiries = await listTripInquiries()

  return (
    <div>
      <h1 style={{ margin: '0 0 6px', fontSize: '24px', color: '#0F1923' }}>Forespørsler</h1>
      <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px' }}>
        Skreddersydde opphold. Hotell, transfer og leiebil prises hver for seg. Fly formidles videre og skal ikke inn i tilbudssummen.
      </p>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#6B7280', background: '#F9FAFB' }}>
              {['Mottatt', 'Hvem', 'Reise', 'Budsjett', 'Status', ''].map(heading => (
                <th key={heading} style={{ padding: '12px 14px', fontWeight: 600 }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '28px 14px', color: '#6B7280' }}>
                  Ingen forespørsler ennå. Tabellen opprettes med migrasjonen supabase/migrations/20261117_trip_inquiries.sql.
                </td>
              </tr>
            )}
            {inquiries.map(inquiry => (
              <tr key={inquiry.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{new Date(inquiry.createdAt).toLocaleDateString('nb-NO')}</td>
                <td style={{ padding: '12px 14px' }}>{inquiry.name}<div style={{ color: '#6B7280', fontSize: '12px' }}>{inquiry.phone}</div></td>
                <td style={{ padding: '12px 14px' }}>
                  {inquiry.destination}
                  <div style={{ color: '#6B7280', fontSize: '12px' }}>
                    {inquiry.adults + inquiry.children} personer · {inquiry.checkIn} – {inquiry.checkOut}
                    {inquiry.flexibleDates ? ' · kan flyttes' : ' · faste datoer'}
                    {[
                      inquiry.services.hotell && 'hotell',
                      inquiry.services.transfer && 'transfer',
                      inquiry.services.leiebil && 'leiebil',
                      inquiry.services.tog && 'tog',
                    ].filter(Boolean).length > 0
                      ? ` · ${[
                          inquiry.services.hotell && 'hotell',
                          inquiry.services.transfer && 'transfer',
                          inquiry.services.leiebil && 'leiebil',
                          inquiry.services.tog && 'tog',
                        ].filter(Boolean).join(', ')}`
                      : ''}
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>{nok(inquiry.budgetNok)}</td>
                <td style={{ padding: '12px 14px' }}>{inquiry.status === 'tilbud_sendt' ? 'Tilbud sendt' : 'Ny'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Link href={`/admin/foresporsler/${inquiry.id}`} style={{ color: '#E5623E', fontWeight: 600, textDecoration: 'none' }}>
                    Åpne
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
