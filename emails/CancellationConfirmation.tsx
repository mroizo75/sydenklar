import * as React from 'react'

export interface CancellationConfirmationProps {
  guestName: string
  hotelName: string
  checkIn: string
  checkOut: string
  partnerOrderId: string
  paidAmount: number
  refundedAmount: number
  currency: string
}

export function CancellationConfirmationEmail({
  guestName,
  hotelName,
  checkIn,
  checkOut,
  partnerOrderId,
  paidAmount,
  refundedAmount,
  currency,
}: CancellationConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'

  const fmt = (amount: number) =>
    new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: currency || 'NOK',
      minimumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const hasRefund = refundedAmount > 0
  const isFullRefund = refundedAmount >= paidAmount
  const penaltyAmount = Math.max(0, paidAmount - refundedAmount)

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Avbestillingsbekreftelse – {hotelName}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F8F9FB', fontFamily: 'Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#F8F9FB', padding: '40px 16px' }}>
          <tr>
            <td align="center">
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: '560px' }}>

                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#0F1923', borderRadius: '12px 12px 0 0', padding: '32px 32px 28px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px', color: '#C9A84C', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Sydenklar.no
                    </p>
                    <h1 style={{ margin: 0, color: '#ffffff', fontSize: '22px', fontWeight: 400, lineHeight: 1.3 }}>
                      Booking avbestilt
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#9CA3AF', fontSize: '14px' }}>
                      {hotelName}
                    </p>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '32px' }}>

                    <p style={{ margin: '0 0 24px', color: '#374151', fontSize: '15px', lineHeight: 1.6 }}>
                      Hei {guestName},<br /><br />
                      Bookingen din er nå avbestilt. Her er en oversikt over avbestillingen og eventuell tilbakebetaling.
                    </p>

                    {/* Booking details */}
                    <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', marginBottom: '24px' }}>
                      <tr>
                        <td style={{ padding: '16px 20px 12px' }}>
                          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            Avbestilt bestilling
                          </p>
                          <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: '14px', color: '#374151' }}>
                            <tr>
                              <td style={{ padding: '5px 0', color: '#6B7280', width: '130px' }}>Hotell</td>
                              <td style={{ padding: '5px 0', fontWeight: 600 }}>{hotelName}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #F3F4F6' }}>Innsjekk</td>
                              <td style={{ padding: '5px 0', borderTop: '1px solid #F3F4F6' }}>{formatDate(checkIn)}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #F3F4F6' }}>Utsjekk</td>
                              <td style={{ padding: '5px 0', borderTop: '1px solid #F3F4F6' }}>{formatDate(checkOut)}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '5px 0', color: '#6B7280', borderTop: '1px solid #F3F4F6' }}>Bestillingsnr.</td>
                              <td style={{ padding: '5px 0', borderTop: '1px solid #F3F4F6', fontFamily: 'monospace', fontWeight: 600 }}>{partnerOrderId}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Refund box */}
                    {hasRefund ? (
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', marginBottom: '24px' }}>
                        <tr>
                          <td style={{ padding: '20px' }}>
                            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#166534', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                              Tilbakebetaling
                            </p>
                            <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: '14px' }}>
                              <tr>
                                <td style={{ padding: '4px 0', color: '#374151' }}>Betalt beløp</td>
                                <td style={{ padding: '4px 0', textAlign: 'right', color: '#374151' }}>{fmt(paidAmount)}</td>
                              </tr>
                              {!isFullRefund && (
                                <tr>
                                  <td style={{ padding: '4px 0', color: '#374151' }}>Avbestillingsgebyr</td>
                                  <td style={{ padding: '4px 0', textAlign: 'right', color: '#DC2626' }}>− {fmt(penaltyAmount)}</td>
                                </tr>
                              )}
                              <tr>
                                <td style={{ padding: '10px 0 4px', fontWeight: 700, color: '#166534', fontSize: '16px', borderTop: '1px solid #BBF7D0' }}>
                                  {isFullRefund ? 'Full tilbakebetaling' : 'Tilbakebetalingsbeløp'}
                                </td>
                                <td style={{ padding: '10px 0 4px', textAlign: 'right', fontWeight: 700, color: '#166534', fontSize: '16px', borderTop: '1px solid #BBF7D0' }}>
                                  {fmt(refundedAmount)}
                                </td>
                              </tr>
                            </table>
                            <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
                              Tilbakebetalingen er sendt til ditt betalingskort og skal normalt være synlig innen <strong>3–5 virkedager</strong>, avhengig av din bank.
                            </p>
                          </td>
                        </tr>
                      </table>
                    ) : (
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: '10px', marginBottom: '24px' }}>
                        <tr>
                          <td style={{ padding: '20px' }}>
                            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#854D0E', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                              Ingen tilbakebetaling
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#92400E', lineHeight: 1.5 }}>
                              I henhold til avbestillingsvilkårene for dette hotellet gis det dessverre ingen tilbakebetaling ved avbestilling på dette tidspunktet.
                            </p>
                          </td>
                        </tr>
                      </table>
                    )}

                    {/* Contact */}
                    <p style={{ margin: '0 0 28px', color: '#6B7280', fontSize: '13px', lineHeight: 1.6 }}>
                      Har du spørsmål til avbestillingen eller tilbakebetalingen? Svar på denne e-posten eller send oss en melding på{' '}
                      <a href="mailto:hjelp@sydenklar.no" style={{ color: '#E5623E', textDecoration: 'none', fontWeight: 600 }}>
                        hjelp@sydenklar.no
                      </a>
                    </p>

                    {/* Footer */}
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td style={{ borderTop: '1px solid #F3F4F6', paddingTop: '24px', textAlign: 'center' }}>
                          <p style={{ margin: '0 0 8px', color: '#9CA3AF', fontSize: '12px' }}>
                            <a href={`${baseUrl}`} style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}>Sydenklar.no</a>
                            {' · '}
                            <a href={`${baseUrl}/faq`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>FAQ</a>
                            {' · '}
                            <a href="mailto:hjelp@sydenklar.no" style={{ color: '#9CA3AF', textDecoration: 'none' }}>hjelp@sydenklar.no</a>
                          </p>
                          <p style={{ margin: 0, color: '#D1D5DB', fontSize: '11px' }}>
                            Du mottar denne e-posten fordi du avbestilte en booking på Sydenklar.no
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}
