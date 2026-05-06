import * as React from 'react'

export interface NewsletterHotel {
  name: string
  city: string
  country: string
  starRating: number
  imageUrl: string | null
  pageUrl: string
}

export interface NewsletterDestination {
  cityName: string
  countryName: string
  hotelCount: number
  pageUrl: string
}

export interface WeeklyNewsletterProps {
  firstName?: string
  weekNumber: number
  year: number
  hotels: NewsletterHotel[]
  destination: NewsletterDestination
  unsubscribeUrl: string
  baseUrl: string
}

const COLORS = {
  deep: '#0F1923',
  coral: '#E5623E',
  sand: '#F0E6D3',
  sandLight: '#FAF6EF',
  gold: '#C9A84C',
  muted: '#8A8F99',
  white: '#FFFFFF',
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(Math.max(0, Math.min(5, rating)))
  return (
    <span style={{ color: COLORS.gold, fontSize: '13px', letterSpacing: '1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

export function WeeklyNewsletterEmail({
  firstName,
  weekNumber,
  year,
  hotels,
  destination,
  unsubscribeUrl,
  baseUrl,
}: WeeklyNewsletterProps) {
  const greeting = firstName ? `Hei ${firstName}` : 'Hei'

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ukens hoteller fra Sydenklar – Uke {weekNumber}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: COLORS.sandLight, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: COLORS.sandLight, padding: '32px 16px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', width: '100%' }}>
                  <tbody>

                    {/* Header */}
                    <tr>
                      <td style={{
                        backgroundColor: COLORS.deep,
                        borderRadius: '14px 14px 0 0',
                        padding: '32px 40px',
                        textAlign: 'center',
                      }}>
                        <p style={{ margin: '0 0 6px', color: COLORS.gold, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
                          Sydenklar.no
                        </p>
                        <h1 style={{ margin: 0, color: COLORS.white, fontSize: '26px', fontWeight: 300, letterSpacing: '0.5px' }}>
                          Ukens reiseinspirasjon
                        </h1>
                        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                          Uke {weekNumber}, {year}
                        </p>
                      </td>
                    </tr>

                    {/* Greeting */}
                    <tr>
                      <td style={{ backgroundColor: COLORS.white, padding: '36px 40px 24px' }}>
                        <p style={{ margin: '0 0 12px', color: COLORS.deep, fontSize: '16px' }}>
                          {greeting},
                        </p>
                        <p style={{ margin: 0, color: COLORS.muted, fontSize: '15px', lineHeight: '1.65' }}>
                          Vi har plukket ut denne ukens beste hoteller og destinasjoner — skreddersydd for deg som vil reise smart og godt.
                        </p>
                      </td>
                    </tr>

                    {/* Section: Ukens hoteller */}
                    <tr>
                      <td style={{ backgroundColor: COLORS.white, padding: '0 40px 8px' }}>
                        <p style={{ margin: 0, color: COLORS.coral, fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                          Ukens hoteller
                        </p>
                        <h2 style={{ margin: '6px 0 0', color: COLORS.deep, fontSize: '22px', fontWeight: 400 }}>
                          Topp utvalgte overnattsteder
                        </h2>
                      </td>
                    </tr>

                    {/* Hotel cards */}
                    {hotels.map((hotel, i) => (
                      <tr key={i}>
                        <td style={{ backgroundColor: COLORS.white, padding: '16px 40px' }}>
                          <table width="100%" cellPadding="0" cellSpacing="0" style={{
                            backgroundColor: COLORS.sandLight,
                            borderRadius: '10px',
                            overflow: 'hidden',
                          }}>
                            <tbody>
                              <tr>
                                {hotel.imageUrl && (
                                  <td width="140" style={{ verticalAlign: 'top' }}>
                                    <img
                                      src={hotel.imageUrl}
                                      alt={hotel.name}
                                      width="140"
                                      height="105"
                                      style={{ display: 'block', width: '140px', height: '105px', objectFit: 'cover', borderRadius: '10px 0 0 10px' }}
                                    />
                                  </td>
                                )}
                                <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                                  <p style={{ margin: '0 0 4px', color: COLORS.muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    {hotel.city}, {hotel.country}
                                  </p>
                                  <p style={{ margin: '0 0 6px', color: COLORS.deep, fontSize: '16px', fontWeight: 600, lineHeight: '1.3' }}>
                                    {hotel.name}
                                  </p>
                                  <StarRating rating={hotel.starRating} />
                                  <br />
                                  <a
                                    href={hotel.pageUrl}
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '10px',
                                      backgroundColor: COLORS.coral,
                                      color: COLORS.white,
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      padding: '7px 16px',
                                      borderRadius: '20px',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    Se hotellet
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ))}

                    {/* Divider */}
                    <tr>
                      <td style={{ backgroundColor: COLORS.white, padding: '8px 40px' }}>
                        <div style={{ height: '1px', backgroundColor: COLORS.sand }} />
                      </td>
                    </tr>

                    {/* Destination spotlight */}
                    <tr>
                      <td style={{ backgroundColor: COLORS.white, padding: '24px 40px 8px' }}>
                        <p style={{ margin: 0, color: COLORS.coral, fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                          Ukens destinasjon
                        </p>
                        <h2 style={{ margin: '6px 0 0', color: COLORS.deep, fontSize: '22px', fontWeight: 400 }}>
                          {destination.cityName}
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: COLORS.white, padding: '16px 40px 32px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{
                          backgroundColor: COLORS.deep,
                          borderRadius: '10px',
                          padding: '28px 28px',
                        }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '28px' }}>
                                <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                  {destination.countryName}
                                </p>
                                <h3 style={{ margin: '0 0 8px', color: COLORS.white, fontSize: '24px', fontWeight: 400 }}>
                                  {destination.cityName}
                                </h3>
                                <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                  {destination.hotelCount.toLocaleString('nb-NO')} hoteller tilgjengelig
                                </p>
                                <a
                                  href={destination.pageUrl}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: COLORS.coral,
                                    color: COLORS.white,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    padding: '12px 28px',
                                    borderRadius: '28px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  Utforsk {destination.cityName}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Main CTA */}
                    <tr>
                      <td style={{
                        backgroundColor: COLORS.sand,
                        padding: '36px 40px',
                        textAlign: 'center',
                      }}>
                        <p style={{ margin: '0 0 6px', color: COLORS.deep, fontSize: '20px', fontWeight: 400 }}>
                          Klar for neste reise?
                        </p>
                        <p style={{ margin: '0 0 20px', color: COLORS.muted, fontSize: '14px' }}>
                          Søk blant over 2 millioner hoteller — alltid best pris
                        </p>
                        <a
                          href={`${baseUrl}/hoteller`}
                          style={{
                            display: 'inline-block',
                            backgroundColor: COLORS.deep,
                            color: COLORS.white,
                            fontSize: '15px',
                            fontWeight: 600,
                            padding: '14px 36px',
                            borderRadius: '32px',
                            textDecoration: 'none',
                            letterSpacing: '0.3px',
                          }}
                        >
                          Søk hoteller nå
                        </a>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{
                        backgroundColor: COLORS.deep,
                        borderRadius: '0 0 14px 14px',
                        padding: '24px 40px',
                        textAlign: 'center',
                      }}>
                        <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                          Sydenklar AS · sydenklar.no
                        </p>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                          Du mottar dette fordi du meldte deg på nyhetsbrev på sydenklar.no.{' '}
                          <a href={unsubscribeUrl} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}>
                            Meld deg av her
                          </a>
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
