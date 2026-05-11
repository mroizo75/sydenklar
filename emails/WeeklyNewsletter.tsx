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

const C = {
  deep: '#0F1923',
  deepLight: '#1A2838',
  coral: '#E5623E',
  coralDark: '#C94E2C',
  sand: '#F0E6D3',
  sandLight: '#FAF6EF',
  gold: '#C9A84C',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
}

const FALLBACK_IMAGES: Record<string, string> = {
  Norway: 'https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=640&q=80',
  Spain: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=640&q=80',
  Turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=640&q=80',
  Italy: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=640&q=80',
  Greece: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=640&q=80',
  Thailand: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=640&q=80',
  France: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=640&q=80',
  Croatia: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=640&q=80',
  Portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=640&q=80',
  default: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=640&q=80',
}

function getImageUrl(hotel: NewsletterHotel): string {
  if (hotel.imageUrl) return hotel.imageUrl
  return FALLBACK_IMAGES[hotel.country] ?? FALLBACK_IMAGES.default
}

function Stars({ rating }: { rating: number }) {
  const n = Math.round(Math.max(0, Math.min(5, rating)))
  return (
    <span style={{ color: C.gold, fontSize: '14px', letterSpacing: '2px' }}>
      {'★'.repeat(n)}
      <span style={{ color: C.border }}>{'★'.repeat(5 - n)}</span>
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
  const LOGO_URL = `${baseUrl}/logo-hvit.png`

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ukens reiseinspirasjon – {destination.cityName}</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: C.sandLight,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        WebkitTextSizeAdjust: '100%',
      }}>

        {/* Outer wrapper */}
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ backgroundColor: C.sandLight, padding: '40px 16px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding="0" cellSpacing="0" role="presentation"
                  style={{ maxWidth: '600px', width: '100%' }}>
                  <tbody>

                    {/* ── HEADER ── */}
                    <tr>
                      <td style={{
                        backgroundColor: C.deep,
                        borderRadius: '16px 16px 0 0',
                        padding: '36px 48px 32px',
                        textAlign: 'center',
                      }}>
                        {/* Logo */}
                        <img
                          src={LOGO_URL}
                          alt="Sydenklar"
                          width="160"
                          height="auto"
                          style={{ display: 'block', margin: '0 auto 20px', width: '160px', maxWidth: '160px' }}
                        />
                        {/* Pill badge */}
                        <div style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(201,168,76,0.15)',
                          border: '1px solid rgba(201,168,76,0.4)',
                          borderRadius: '20px',
                          padding: '4px 14px',
                          marginBottom: '14px',
                        }}>
                          <span style={{ color: C.gold, fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' as const }}>
                            Ukens reiseinspirasjon
                          </span>
                        </div>
                        <h1 style={{
                          margin: '0 0 8px',
                          color: C.white,
                          fontSize: '30px',
                          fontWeight: 300,
                          letterSpacing: '-0.3px',
                          lineHeight: '1.2',
                        }}>
                          {destination.cityName}
                        </h1>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                          Uke {weekNumber}, {year}
                        </p>
                      </td>
                    </tr>

                    {/* ── GREETING ── */}
                    <tr>
                      <td style={{ backgroundColor: C.white, padding: '36px 48px 8px' }}>
                        <p style={{ margin: '0 0 10px', color: C.deep, fontSize: '17px', fontWeight: 500 }}>
                          {greeting} 👋
                        </p>
                        <p style={{ margin: 0, color: C.muted, fontSize: '15px', lineHeight: '1.7' }}>
                          Vi har plukket ut denne ukens <strong style={{ color: C.deep }}>beste hoteller i {destination.cityName}</strong> — kuratert for deg som vil reise smart, godt og til rett pris.
                        </p>
                      </td>
                    </tr>

                    {/* ── SECTION LABEL ── */}
                    <tr>
                      <td style={{ backgroundColor: C.white, padding: '28px 48px 16px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody>
                            <tr>
                              <td>
                                <div style={{
                                  width: '3px',
                                  height: '20px',
                                  backgroundColor: C.coral,
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                  marginRight: '10px',
                                }} />
                                <span style={{
                                  color: C.coral,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  letterSpacing: '2.5px',
                                  textTransform: 'uppercase' as const,
                                  verticalAlign: 'middle',
                                }}>
                                  Ukens hoteller
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingTop: '6px' }}>
                                <h2 style={{ margin: 0, color: C.deep, fontSize: '22px', fontWeight: 500 }}>
                                  Topp overnattsteder i {destination.cityName}
                                </h2>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* ── HOTEL CARDS ── */}
                    {hotels.length === 0 ? (
                      <tr>
                        <td style={{ backgroundColor: C.white, padding: '8px 48px 32px' }}>
                          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                            style={{ backgroundColor: C.sandLight, borderRadius: '12px', padding: '28px' }}>
                            <tbody>
                              <tr>
                                <td style={{ textAlign: 'center', padding: '20px' }}>
                                  <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '15px' }}>
                                    Utforsk hundrevis av hoteller i {destination.cityName}
                                  </p>
                                  <a href={destination.pageUrl} style={{
                                    display: 'inline-block',
                                    backgroundColor: C.coral,
                                    color: C.white,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    padding: '12px 28px',
                                    borderRadius: '28px',
                                    textDecoration: 'none',
                                  }}>
                                    Se alle hoteller →
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : (
                      hotels.map((hotel, i) => (
                        <tr key={i}>
                          <td style={{ backgroundColor: C.white, padding: i === 0 ? '4px 48px 16px' : '0 48px 16px' }}>
                            <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                              style={{
                                backgroundColor: C.sandLight,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: `1px solid ${C.border}`,
                              }}>
                              <tbody>
                                <tr>
                                  {/* Image column */}
                                  <td width="160" style={{ verticalAlign: 'top', padding: 0 }}>
                                    <a href={hotel.pageUrl} style={{ display: 'block' }}>
                                      <img
                                        src={getImageUrl(hotel)}
                                        alt={hotel.name}
                                        width="160"
                                        height="130"
                                        style={{
                                          display: 'block',
                                          width: '160px',
                                          height: '130px',
                                          objectFit: 'cover',
                                          borderRadius: '12px 0 0 12px',
                                        }}
                                      />
                                    </a>
                                  </td>
                                  {/* Content column */}
                                  <td style={{ padding: '18px 20px', verticalAlign: 'top' }}>
                                    <p style={{ margin: '0 0 3px', color: C.mutedLight, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1.5px' }}>
                                      {hotel.city}, {hotel.country}
                                    </p>
                                    <p style={{ margin: '0 0 6px', color: C.deep, fontSize: '16px', fontWeight: 600, lineHeight: '1.3' }}>
                                      {hotel.name}
                                    </p>
                                    <Stars rating={hotel.starRating} />
                                    <div style={{ marginTop: '14px' }}>
                                      <a
                                        href={hotel.pageUrl}
                                        style={{
                                          display: 'inline-block',
                                          backgroundColor: C.coral,
                                          color: C.white,
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          padding: '8px 18px',
                                          borderRadius: '20px',
                                          textDecoration: 'none',
                                          letterSpacing: '0.3px',
                                        }}
                                      >
                                        Se hotellet →
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ))
                    )}

                    {/* ── DESTINATION SPOTLIGHT ── */}
                    <tr>
                      <td style={{ backgroundColor: C.white, padding: '16px 48px 0' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody>
                            <tr>
                              <td>
                                <div style={{
                                  width: '3px',
                                  height: '20px',
                                  backgroundColor: C.gold,
                                  display: 'inline-block',
                                  verticalAlign: 'middle',
                                  marginRight: '10px',
                                }} />
                                <span style={{
                                  color: C.gold,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  letterSpacing: '2.5px',
                                  textTransform: 'uppercase' as const,
                                  verticalAlign: 'middle',
                                }}>
                                  Ukens destinasjon
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ backgroundColor: C.white, padding: '16px 48px 36px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                          style={{
                            background: `linear-gradient(135deg, ${C.deep} 0%, ${C.deepLight} 100%)`,
                            borderRadius: '14px',
                            overflow: 'hidden',
                          }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '32px 36px' }}>
                                <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.45)', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
                                  {destination.countryName}
                                </p>
                                <h3 style={{ margin: '0 0 8px', color: C.white, fontSize: '28px', fontWeight: 300, letterSpacing: '-0.3px' }}>
                                  {destination.cityName}
                                </h3>
                                {destination.hotelCount > 0 && (
                                  <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
                                    {destination.hotelCount.toLocaleString('nb-NO')} hoteller tilgjengelig
                                  </p>
                                )}
                                <a
                                  href={destination.pageUrl}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: C.coral,
                                    color: C.white,
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    padding: '13px 30px',
                                    borderRadius: '30px',
                                    textDecoration: 'none',
                                    letterSpacing: '0.3px',
                                  }}
                                >
                                  Utforsk {destination.cityName} →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* ── MAIN CTA ── */}
                    <tr>
                      <td style={{
                        backgroundColor: C.sand,
                        padding: '40px 48px',
                        textAlign: 'center',
                        borderTop: `1px solid ${C.border}`,
                      }}>
                        <p style={{ margin: '0 0 6px', color: C.deep, fontSize: '22px', fontWeight: 400 }}>
                          Klar for neste reise?
                        </p>
                        <p style={{ margin: '0 0 24px', color: C.muted, fontSize: '14px', lineHeight: '1.6' }}>
                          Søk blant over 2 millioner hoteller i hele verden — alltid beste pris garantert.
                        </p>
                        <a
                          href={`${baseUrl}/hoteller`}
                          style={{
                            display: 'inline-block',
                            backgroundColor: C.deep,
                            color: C.white,
                            fontSize: '15px',
                            fontWeight: 700,
                            padding: '15px 40px',
                            borderRadius: '32px',
                            textDecoration: 'none',
                            letterSpacing: '0.3px',
                          }}
                        >
                          Søk hoteller nå
                        </a>
                      </td>
                    </tr>

                    {/* ── FOOTER ── */}
                    <tr>
                      <td style={{
                        backgroundColor: C.deep,
                        borderRadius: '0 0 16px 16px',
                        padding: '28px 48px',
                        textAlign: 'center',
                      }}>
                        <img
                          src={LOGO_URL}
                          alt="Sydenklar"
                          width="100"
                          height="auto"
                          style={{ display: 'block', margin: '0 auto 16px', width: '100px', opacity: 0.6 }}
                        />
                        <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                          Sydenklar AS · sydenklar.no
                        </p>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.22)', fontSize: '11px', lineHeight: '1.7' }}>
                          Du mottar dette fordi du meldte deg på nyhetsbrev på sydenklar.no.<br />
                          <a href={unsubscribeUrl} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>
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
