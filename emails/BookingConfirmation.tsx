import * as React from 'react'
import { generateCancelToken } from '@/lib/cancel-token'

function safeCancelToken(partnerOrderId: string): string {
  try { return generateCancelToken(partnerOrderId) } catch { return '' }
}

export interface BookingConfirmationProps {
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  partnerOrderId: string
  amount: number
  currency: string
  cancellationPolicy?: string
  hotelAddress?: string
}

export function BookingConfirmationEmail({
  guestName,
  hotelName,
  roomName,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  partnerOrderId,
  amount,
  currency,
  cancellationPolicy,
  hotelAddress,
}: BookingConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'
  const confirmationUrl = `${baseUrl}/booking-bekreftelse?ref=${partnerOrderId}`
  const cancelToken = safeCancelToken(partnerOrderId)
  const cancelUrl = `${baseUrl}/avbestill?ref=${partnerOrderId}&token=${cancelToken}`

  const formattedAmount = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currency || 'NOK',
    minimumFractionDigits: 0,
  }).format(amount)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bookingbekreftelse – {hotelName}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f0eb', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f0eb', padding: '40px 20px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', width: '100%' }}>

                  {/* Header */}
                  <tbody>
                    <tr>
                      <td style={{ backgroundColor: '#1a2e3b', borderRadius: '12px 12px 0 0', padding: '32px 40px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#c8a882', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
                          Sydenklar.no
                        </p>
                        <h1 style={{ margin: '8px 0 0', color: '#ffffff', fontSize: '26px', fontWeight: 300, letterSpacing: '0.5px' }}>
                          Booking bekreftet
                        </h1>
                      </td>
                    </tr>

                    {/* Green confirmation bar */}
                    <tr>
                      <td style={{ backgroundColor: '#2d6a4f', padding: '16px 40px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#ffffff', fontSize: '14px' }}>
                          ✓ Din booking er bekreftet og betalt
                        </p>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ backgroundColor: '#ffffff', padding: '40px' }}>

                        <p style={{ margin: '0 0 24px', color: '#1a2e3b', fontSize: '16px' }}>
                          Hei {guestName},
                        </p>
                        <p style={{ margin: '0 0 32px', color: '#4a5568', fontSize: '15px', lineHeight: '1.6' }}>
                          Takk for din booking! Her er en oversikt over reisen din.
                        </p>

                        {/* Hotel box */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f0eb', borderRadius: '10px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '24px' }}>
                                <p style={{ margin: '0 0 4px', color: '#8b6f47', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                                  Hotell
                                </p>
                                <p style={{ margin: '0 0 4px', color: '#1a2e3b', fontSize: '20px', fontWeight: 600 }}>
                                  {hotelName}
                                </p>
                                {hotelAddress && (
                                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{hotelAddress}</p>
                                )}
                                <p style={{ margin: '12px 0 0', color: '#4a5568', fontSize: '14px' }}>{roomName}</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Dates */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td width="50%" style={{ paddingRight: '8px' }}>
                                <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f0eb', borderRadius: '10px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '20px' }}>
                                        <p style={{ margin: '0 0 4px', color: '#8b6f47', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                                          Innsjekk
                                        </p>
                                        <p style={{ margin: 0, color: '#1a2e3b', fontSize: '15px', fontWeight: 600 }}>
                                          {formatDate(checkIn)}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td width="50%" style={{ paddingLeft: '8px' }}>
                                <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f0eb', borderRadius: '10px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '20px' }}>
                                        <p style={{ margin: '0 0 4px', color: '#8b6f47', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                                          Utsjekk
                                        </p>
                                        <p style={{ margin: 0, color: '#1a2e3b', fontSize: '15px', fontWeight: 600 }}>
                                          {formatDate(checkOut)}
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Details row */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f0eb', borderRadius: '10px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 24px' }}>
                                <table width="100%" cellPadding="0" cellSpacing="0">
                                  <tbody>
                                    <tr>
                                      <td style={{ paddingBottom: '8px', color: '#6b7280', fontSize: '14px', width: '50%' }}>Antall netter</td>
                                      <td style={{ paddingBottom: '8px', color: '#1a2e3b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{nights}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ paddingBottom: '8px', color: '#6b7280', fontSize: '14px' }}>Gjester</td>
                                      <td style={{ paddingBottom: '8px', color: '#1a2e3b', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>
                                        {adults} voksne{children > 0 ? `, ${children} barn` : ''}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ borderTop: '1px solid #e5e0d8', paddingTop: '8px', color: '#6b7280', fontSize: '14px' }}>Bestillingsnr.</td>
                                      <td style={{ borderTop: '1px solid #e5e0d8', paddingTop: '8px', color: '#1a2e3b', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', textAlign: 'right' }}>
                                        {partnerOrderId}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Amount */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#1a2e3b', borderRadius: '10px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 24px' }}>
                                <table width="100%" cellPadding="0" cellSpacing="0">
                                  <tbody>
                                    <tr>
                                      <td style={{ color: '#a0aec0', fontSize: '14px' }}>Totalt betalt</td>
                                      <td style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, textAlign: 'right' }}>{formattedAmount}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Cancellation */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#fff8f0', border: '1px solid #fed7aa', borderRadius: '10px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '16px 20px' }}>
                                <p style={{ margin: '0 0 6px', color: '#92400e', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  Avbestillingsvilkår
                                </p>
                                <p style={{ margin: '0 0 8px', color: '#78350f', fontSize: '14px', lineHeight: '1.5' }}>
                                  {cancellationPolicy || 'Se bookingdetaljer for fullstendige avbestillingsvilkår.'}
                                </p>
                                <a
                                  href={`${baseUrl}/hjelp/avbestilling`}
                                  style={{ color: '#c8623a', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  Les om avbestillingsregler →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* CTA */}
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingTop: '8px', paddingBottom: '16px' }}>
                                <a
                                  href={confirmationUrl}
                                  style={{
                                    backgroundColor: '#c8623a',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    padding: '14px 32px',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    display: 'inline-block',
                                  }}
                                >
                                  Se bookingdetaljer
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <a
                                  href={cancelUrl}
                                  style={{
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    borderBottom: '1px solid #d1d5db',
                                    paddingBottom: '1px',
                                  }}
                                >
                                  Avbestill denne bookingen
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ backgroundColor: '#f5f0eb', borderRadius: '0 0 12px 12px', padding: '24px 40px', textAlign: 'center', borderTop: '1px solid #e5e0d8' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '12px' }}>
                          <tbody>
                            <tr>
                              <td align="center">
                                <a href={`${baseUrl}/hjelp/avbestilling`} style={{ color: '#c8623a', fontSize: '12px', textDecoration: 'none', margin: '0 10px' }}>Avbestilling</a>
                                <span style={{ color: '#d1d5db', fontSize: '12px' }}>·</span>
                                <a href={`${baseUrl}/faq`} style={{ color: '#c8623a', fontSize: '12px', textDecoration: 'none', margin: '0 10px' }}>FAQ</a>
                                <span style={{ color: '#d1d5db', fontSize: '12px' }}>·</span>
                                <a href={`${baseUrl}/support`} style={{ color: '#c8623a', fontSize: '12px', textDecoration: 'none', margin: '0 10px' }}>Kundestøtte</a>
                                <span style={{ color: '#d1d5db', fontSize: '12px' }}>·</span>
                                <a href={`${baseUrl}/vilkar`} style={{ color: '#c8623a', fontSize: '12px', textDecoration: 'none', margin: '0 10px' }}>Vilkår</a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style={{ margin: '0 0 8px', color: '#9ca3af', fontSize: '12px' }}>
                          Har du spørsmål? Kontakt oss på{' '}
                          <a href="mailto:hjelp@sydenklar.no" style={{ color: '#c8623a', textDecoration: 'none' }}>
                            hjelp@sydenklar.no
                          </a>
                        </p>
                        <p style={{ margin: 0, color: '#d1d5db', fontSize: '11px' }}>
                          © {new Date().getFullYear()} Sydenklar.no · Alle rettigheter forbeholdt
                        </p>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
