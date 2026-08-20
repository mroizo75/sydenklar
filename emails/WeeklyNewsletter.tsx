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
  imageUrl?: string
}

export interface TrendingDest {
  city: string
  country: string
  imageUrl: string
  tagline: string
  pageUrl: string
}

export interface WeeklyNewsletterProps {
  firstName?: string
  weekNumber: number
  year: number
  hotels: NewsletterHotel[]
  destination: NewsletterDestination
  trendingDests?: TrendingDest[]
  travelTip?: { headline: string; body: string }
  unsubscribeUrl: string
  baseUrl: string
}

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  deep:       '#0F1923',
  deepLight:  '#1A2838',
  coral:      '#E5623E',
  coralDark:  '#C94E2C',
  sand:       '#F0E6D3',
  sandLight:  '#FAF6EF',
  gold:       '#C9A84C',
  muted:      '#6B7280',
  mutedLight: '#9CA3AF',
  white:      '#FFFFFF',
  border:     '#E5E7EB',
  green:      '#10B981',
}

// ─── Responsive styles injected into <head> ────────────────────────────────
const RESPONSIVE_CSS = `
  @media only screen and (max-width: 620px) {
    .ew-outer { padding: 0 !important; }
    .ew-logo { width: 190px !important; max-width: 190px !important; }
    .ew-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .ew-hero-img { height: 210px !important; }
    .ew-dest-title { font-size: 26px !important; }
    .ew-feat-info-left { display: block !important; width: 100% !important; }
    .ew-feat-btn-cell { display: block !important; width: 100% !important; padding-top: 14px !important; text-align: left !important; }
    .hotel-col {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-bottom: 12px !important;
    }
    .trending-col {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-bottom: 10px !important;
    }
    .ew-stats-cell {
      display: block !important;
      width: 100% !important;
      padding: 14px 0 !important;
      border-left: none !important;
      border-right: none !important;
      border-bottom: 1px solid #E5E7EB !important;
    }
    .ew-stats-last {
      border-bottom: none !important;
    }
    .ew-cta-text { max-width: 100% !important; }
  }
`

// ─── Destination hero images ───────────────────────────────────────────────
const DEST_IMAGES: Record<string, string> = {
  Norway:    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=85',
  Spain:     'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=85',
  Turkey:    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=85',
  Italy:     'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=85',
  Greece:    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=85',
  Thailand:  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=85',
  France:    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85',
  Croatia:   'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&q=85',
  Portugal:  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=85',
  'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85',
  default:   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85',
}

const COUNTRY_HOTEL_FALLBACKS: Record<string, string[]> = {
  Spain:   [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=640&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&q=80',
  ],
  Italy:   [
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=640&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=640&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=640&q=80',
  ],
  France:  [
    'https://images.unsplash.com/photo-1549294413-26f195200c16?w=640&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=640&q=80',
  ],
  Greece:  [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=640&q=80',
    'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=640&q=80',
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=640&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=640&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&q=80',
  ],
}

const TRAVEL_TIPS = [
  {
    headline: '💡 Bestill tidlig — spar opptil 30 %',
    body: 'Hoteller fyller seg raskt i høysesong. Bestiller du 60+ dager i forveien, kan du typisk spare mellom 20–30 % sammenlignet med siste liten-priser.',
  },
  {
    headline: '🧳 Pakk lett og reis smartere',
    body: 'Tar du kun håndbagasje unngår du kø ved bagasjebåndet og sparer tid. De fleste europeiske hotellopphold klarer seg utmerket med én kabinkoffert.',
  },
  {
    headline: '📅 Mid-uke gir best priser',
    body: 'Innsjekk tirsdag eller onsdag i stedet for fredag/lørdag. Priser på hoteller er gjennomsnittlig 15–25 % lavere midt i uka enn i helgene.',
  },
  {
    headline: '🌍 Velg riktig nasjonalitet ved søk',
    body: 'Mange hoteller har prisforskjeller basert på passets nasjonalitet. Husk å velge riktig statsborgerskap i søkefeltet for å se priser som gjelder deg.',
  },
  {
    headline: '✅ Sjekk avbestillingsvilkårene',
    body: 'Gratis avbestilling er gull verdt — velg refunderbare rater hvis planene kan endre seg. Se alltid etter «Gratis avbestilling»-merket på rommene.',
  },
  {
    headline: '🔍 Søk alltid etter romtype',
    body: 'Et standardrom kan koste halvparten av suiten. Sammenlign romtyper nøye — du får ofte like god standard for betydelig lavere pris.',
  },
  {
    headline: '☀️ Skuldersesongen er reisendenes hemmelighet',
    body: 'Mai–juni og september–oktober gir deg det beste av begge verdener: godt vær, færre turister og lavere priser enn i juli–august.',
  },
  {
    headline: '🏨 Frokost inkludert — verdt det?',
    body: 'Sjekk hva frokost koster på hotellets restaurant. Er det rimelig å kjøpe separat, kan du spare ved å velge rom uten og spise ute i stedet.',
  },
]

const ALL_TRENDING: TrendingDest[] = [
  { city: 'Barcelona', country: 'Spania',    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80', tagline: 'Arkitektur, strender og tapas',    pageUrl: '' },
  { city: 'Roma',      country: 'Italia',    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80', tagline: 'Evighetens by venter på deg',     pageUrl: '' },
  { city: 'Paris',     country: 'Frankrike', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', tagline: 'Romantikk og haute cuisine',      pageUrl: '' },
  { city: 'Santorini', country: 'Hellas',    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80', tagline: 'Hvite hus og blått hav',          pageUrl: '' },
  { city: 'Dubai',     country: 'UAE',       imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', tagline: 'Luksus uten kompromiss',          pageUrl: '' },
  { city: 'Istanbul',  country: 'Tyrkia',    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80', tagline: 'Øst møter vest',                  pageUrl: '' },
  { city: 'Lisboa',    country: 'Portugal',  imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&q=80', tagline: 'Fado, trikk og pasteis',            pageUrl: '' },
  { city: 'Phuket',    country: 'Thailand',  imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', tagline: 'Tropiske strender venter',          pageUrl: '' },
  { city: 'Amsterdam', country: 'Nederland', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&q=80', tagline: 'Kanaler, kunst og kultur',         pageUrl: '' },
  { city: 'Dubrovnik', country: 'Kroatia',   imageUrl: 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=400&q=80', tagline: 'Perlen ved Adriaterhavet',         pageUrl: '' },
  { city: 'Tokyo',     country: 'Japan',     imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', tagline: 'Tradisjon møter fremtiden',       pageUrl: '' },
  { city: 'New York',  country: 'USA',       imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80', tagline: 'Byen som aldri sover',            pageUrl: '' },
]

function getTrending(weekNumber: number): TrendingDest[] {
  const start = (weekNumber * 3) % ALL_TRENDING.length
  const picks: TrendingDest[] = []
  for (let i = 0; i < 3; i++) {
    picks.push(ALL_TRENDING[(start + i) % ALL_TRENDING.length])
  }
  return picks
}

function getTip(weekNumber: number): { headline: string; body: string } {
  return TRAVEL_TIPS[weekNumber % TRAVEL_TIPS.length]
}

function getHotelImage(hotel: NewsletterHotel, index: number): string {
  if (hotel.imageUrl) return hotel.imageUrl
  const fallbacks = COUNTRY_HOTEL_FALLBACKS[hotel.country] ?? COUNTRY_HOTEL_FALLBACKS.default
  return fallbacks[index % fallbacks.length]
}

function getDestImage(dest: NewsletterDestination): string {
  return dest.imageUrl ?? DEST_IMAGES[dest.countryName] ?? DEST_IMAGES.default
}

function Stars({ rating }: { rating: number }) {
  const n = Math.round(Math.max(0, Math.min(5, rating)))
  return (
    <span style={{ color: C.gold, fontSize: '15px', letterSpacing: '1px' }}>
      {'★'.repeat(n)}
      <span style={{ color: '#D1D5DB' }}>{'★'.repeat(5 - n)}</span>
    </span>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export function WeeklyNewsletterEmail({
  firstName,
  weekNumber,
  year,
  hotels,
  destination,
  trendingDests,
  travelTip,
  unsubscribeUrl,
  baseUrl,
}: WeeklyNewsletterProps) {
  const greeting    = firstName ? `Hei ${firstName} 👋` : 'Hei reisevenn 👋'
  const LOGO_URL    = `${baseUrl}/logo-hvit.png`
  const heroImage   = getDestImage(destination)
  const trending    = trendingDests ?? getTrending(weekNumber)
  const tip         = travelTip    ?? getTip(weekNumber)

  const searchLink = (city: string) =>
    `${baseUrl}/hoteller?destinasjon=${encodeURIComponent(city)}`

  const trendingWithLinks = trending.map(t => ({
    ...t,
    pageUrl: t.pageUrl || searchLink(t.city),
  }))

  const featuredHotel   = hotels[0] ?? null
  const remainingHotels = hotels.slice(1, 3)

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Ukens reiseinspirasjon – {destination.cityName} | Sydenklar</title>
        {/* Responsive + mobile overrides — supported by Gmail, Apple Mail, Outlook.com */}
        <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#F3F4F6',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        WebkitTextSizeAdjust: '100%',
      }}>

        {/* ══ OUTER WRAPPER ══════════════════════════════════════════════════ */}
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          className="ew-outer"
          style={{ backgroundColor: '#F3F4F6', padding: '32px 16px' }}>
          <tbody><tr><td align="center">

            {/* ══ CONTAINER (max 600px) ══════════════════════════════════════ */}
            <table width="600" cellPadding="0" cellSpacing="0" role="presentation"
              style={{ maxWidth: '600px', width: '100%' }}>
              <tbody>

                {/* ── PRE-HEADER (hidden preview text) ── */}
                <tr>
                  <td style={{
                    display: 'none', maxHeight: 0, overflow: 'hidden',
                    opacity: 0, fontSize: '1px', lineHeight: '1px', color: '#F3F4F6',
                  }}>
                    {destination.cityName} er ukens destinasjon – se de beste hotellene og tips for din neste reise ✈️
                  </td>
                </tr>

                {/* ── LOGO BAR ──────────────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{
                    backgroundColor: C.deep,
                    borderRadius: '16px 16px 0 0',
                    padding: '20px 40px',
                  }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody><tr>
                        <td align="left" style={{ verticalAlign: 'middle' }}>
                          {/* Logo doubled: 130px → 260px */}
                          <img
                            src={LOGO_URL}
                            alt="Sydenklar"
                            width="260"
                            height="auto"
                            className="ew-logo"
                            style={{ display: 'block', width: '260px', maxWidth: '260px', border: 0 }}
                          />
                        </td>
                        <td align="right" style={{ verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(229,98,62,0.15)',
                            border: '1px solid rgba(229,98,62,0.45)',
                            borderRadius: '20px',
                            padding: '5px 14px',
                            color: '#F4A485',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                          }}>
                            Uke {weekNumber} · {year}
                          </span>
                        </td>
                      </tr></tbody>
                    </table>
                  </td>
                </tr>

                {/* ── HERO IMAGE ────────────────────────────────────────────── */}
                {/*
                  NOTE: position:absolute overlay REMOVED — not supported in Outlook.
                  Destination info lives in the dark row directly below this image,
                  guaranteeing readable dark-on-dark text in every email client.
                */}
                <tr>
                  <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                    <a
                      href={destination.pageUrl || searchLink(destination.cityName)}
                      style={{ display: 'block', lineHeight: 0, textDecoration: 'none' }}
                    >
                      <img
                        src={heroImage}
                        alt={destination.cityName}
                        width="600"
                        height="280"
                        className="ew-hero-img"
                        style={{
                          display: 'block',
                          width: '100%',
                          maxWidth: '600px',
                          height: '280px',
                          objectFit: 'cover',
                          border: 0,
                        }}
                      />
                    </a>
                  </td>
                </tr>

                {/* ── DESTINATION INFO (replaces absolute overlay) ─────────── */}
                {/*
                  Dark block directly below hero: always renders in Outlook.
                  White text on C.deep (#0F1923) = correct contrast everywhere.
                */}
                <tr>
                  <td className="ew-pad" style={{
                    backgroundColor: C.deep,
                    padding: '28px 40px 32px',
                  }}>
                    <p style={{
                      margin: '0 0 8px',
                      color: C.coral,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    }}>
                      ✈️ Ukens destinasjon
                    </p>
                    <h1
                      className="ew-dest-title"
                      style={{
                        margin: '0 0 6px',
                        color: C.white,
                        fontSize: '34px',
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        lineHeight: '1.1',
                      }}
                    >
                      {destination.cityName}
                    </h1>
                    <p style={{
                      margin: '0 0 22px',
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: '15px',
                      lineHeight: '1.4',
                    }}>
                      {destination.countryName}
                      {destination.hotelCount > 0 && ` · ${destination.hotelCount.toLocaleString('nb-NO')} hoteller`}
                    </p>
                    <a
                      href={destination.pageUrl || searchLink(destination.cityName)}
                      style={{
                        display: 'inline-block',
                        backgroundColor: C.coral,
                        color: C.white,
                        fontSize: '14px',
                        fontWeight: 700,
                        padding: '12px 28px',
                        borderRadius: '28px',
                        textDecoration: 'none',
                        letterSpacing: '0.3px',
                      }}
                    >
                      Søk ledige rom →
                    </a>
                  </td>
                </tr>

                {/* ── GREETING ──────────────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '32px 40px 24px' }}>
                    <p style={{ margin: '0 0 12px', color: C.deep, fontSize: '18px', fontWeight: 600 }}>
                      {greeting}
                    </p>
                    <p style={{ margin: 0, color: C.muted, fontSize: '15px', lineHeight: '1.75' }}>
                      Vi har plukket ut{' '}
                      <strong style={{ color: C.deep }}>
                        denne ukens beste hoteller i {destination.cityName}
                      </strong>{' '}
                      — kuratert for deg som vil reise smart og til rett pris. Scroll ned for reiseinspirasjonen din! 🌍
                    </p>
                  </td>
                </tr>

                {/* DIVIDER */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px' }}>
                    <div style={{ height: '1px', backgroundColor: C.border }} />
                  </td>
                </tr>

                {/* ── FEATURED HOTEL ────────────────────────────────────────── */}
                {featuredHotel && (
                  <>
                    <tr>
                      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '28px 40px 16px' }}>
                        <p style={{
                          margin: '0 0 3px',
                          color: C.coral,
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '2.5px',
                          textTransform: 'uppercase',
                        }}>
                          ⭐ Ukens topphotell
                        </p>
                        <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>
                          Vår fremhevede anbefaling
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 24px' }}>
                        <a href={featuredHotel.pageUrl} style={{ textDecoration: 'none', display: 'block' }}>
                          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                            style={{
                              borderRadius: '14px',
                              overflow: 'hidden',
                              border: `1px solid ${C.border}`,
                            }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                                  <img
                                    src={getHotelImage(featuredHotel, 0)}
                                    alt={featuredHotel.name}
                                    width="520"
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      height: '220px',
                                      objectFit: 'cover',
                                      border: 0,
                                    }}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: '20px 24px', backgroundColor: C.sandLight }}>
                                  <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                    <tbody><tr>
                                      <td className="ew-feat-info-left" style={{ verticalAlign: 'middle' }}>
                                        <p style={{
                                          margin: '0 0 3px',
                                          color: C.muted,
                                          fontSize: '11px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '1.5px',
                                        }}>
                                          {featuredHotel.city}, {featuredHotel.country}
                                        </p>
                                        <p style={{
                                          margin: '0 0 6px',
                                          color: C.deep,
                                          fontSize: '18px',
                                          fontWeight: 700,
                                          lineHeight: '1.3',
                                        }}>
                                          {featuredHotel.name}
                                        </p>
                                        <Stars rating={featuredHotel.starRating} />
                                      </td>
                                      <td
                                        className="ew-feat-btn-cell"
                                        align="right"
                                        style={{ verticalAlign: 'middle' }}
                                      >
                                        <span style={{
                                          display: 'inline-block',
                                          backgroundColor: C.coral,
                                          color: C.white,
                                          fontSize: '13px',
                                          fontWeight: 700,
                                          padding: '10px 22px',
                                          borderRadius: '24px',
                                          whiteSpace: 'nowrap',
                                        }}>
                                          Se hotellet →
                                        </span>
                                      </td>
                                    </tr></tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </a>
                      </td>
                    </tr>
                  </>
                )}

                {/* ── REMAINING HOTELS — 2-column, responsive ───────────────── */}
                {/*
                  On desktop: side-by-side via width="50%" on <td>.
                  On mobile:  .hotel-col overrides to display:block + width:100%
                  In Outlook: table attributes take over → 2 columns preserved (desktop-only, fine).
                */}
                {remainingHotels.length > 0 && (
                  <>
                    <tr>
                      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 16px' }}>
                        <p style={{
                          margin: '0 0 3px',
                          color: C.coral,
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '2.5px',
                          textTransform: 'uppercase',
                        }}>
                          🏨 Flere gode valg
                        </p>
                        <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>
                          Topp overnattsteder i {destination.cityName}
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 28px' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody><tr>
                            {remainingHotels.map((hotel, i) => (
                              <td
                                key={i}
                                className="hotel-col"
                                width="50%"
                                style={{
                                  paddingLeft:  i === 1 ? '8px' : '0',
                                  paddingRight: i === 0 ? '8px' : '0',
                                  verticalAlign: 'top',
                                }}
                              >
                                <a href={hotel.pageUrl} style={{ textDecoration: 'none', display: 'block' }}>
                                  <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                    style={{
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      border: `1px solid ${C.border}`,
                                    }}>
                                    <tbody>
                                      <tr>
                                        <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                                          <img
                                            src={getHotelImage(hotel, i + 1)}
                                            alt={hotel.name}
                                            style={{
                                              display: 'block',
                                              width: '100%',
                                              height: '140px',
                                              objectFit: 'cover',
                                              border: 0,
                                            }}
                                          />
                                        </td>
                                      </tr>
                                      <tr>
                                        <td style={{ padding: '14px 16px 16px', backgroundColor: C.sandLight }}>
                                          <p style={{
                                            margin: '0 0 2px',
                                            color: C.muted,
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.2px',
                                          }}>
                                            {hotel.city}
                                          </p>
                                          <p style={{
                                            margin: '0 0 6px',
                                            color: C.deep,
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            lineHeight: '1.3',
                                          }}>
                                            {hotel.name}
                                          </p>
                                          <Stars rating={hotel.starRating} />
                                          <div style={{ marginTop: '12px' }}>
                                            <span style={{
                                              display: 'inline-block',
                                              backgroundColor: C.deep,
                                              color: C.white,
                                              fontSize: '11px',
                                              fontWeight: 700,
                                              padding: '7px 14px',
                                              borderRadius: '20px',
                                            }}>
                                              Se rom →
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </a>
                              </td>
                            ))}
                          </tr></tbody>
                        </table>
                      </td>
                    </tr>
                  </>
                )}

                {/* DIVIDER */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 28px' }}>
                    <div style={{ height: '1px', backgroundColor: C.border }} />
                  </td>
                </tr>

                {/* ── TRENDING DESTINATIONS — 3-column, responsive ──────────── */}
                {/*
                  On desktop: 3 columns via width="33%".
                  On mobile:  .trending-col overrides to display:block + width:100%.
                */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 16px' }}>
                    <p style={{
                      margin: '0 0 3px',
                      color: C.gold,
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                    }}>
                      🌍 Populære reisemål
                    </p>
                    <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>
                      Trending destinasjoner denne uken
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 32px' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody><tr>
                        {trendingWithLinks.map((dest, i) => (
                          <td
                            key={i}
                            className="trending-col"
                            width="33%"
                            style={{
                              paddingLeft:   i > 0 ? '6px' : '0',
                              paddingRight:  i < 2 ? '6px' : '0',
                              verticalAlign: 'top',
                            }}
                          >
                            <a href={dest.pageUrl} style={{ textDecoration: 'none', display: 'block' }}>
                              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                                style={{ borderRadius: '10px', overflow: 'hidden' }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                                      <img
                                        src={dest.imageUrl}
                                        alt={dest.city}
                                        style={{
                                          display: 'block',
                                          width: '100%',
                                          height: '110px',
                                          objectFit: 'cover',
                                          borderRadius: '10px 10px 0 0',
                                          border: 0,
                                        }}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    {/* Dark bg: white text — correct contrast, works in all clients */}
                                    <td style={{
                                      padding: '10px 12px 12px',
                                      backgroundColor: C.deep,
                                      borderRadius: '0 0 10px 10px',
                                    }}>
                                      <p style={{
                                        margin: '0 0 2px',
                                        color: C.white,
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        lineHeight: '1.2',
                                      }}>
                                        {dest.city}
                                      </p>
                                      <p style={{
                                        margin: 0,
                                        color: 'rgba(255,255,255,0.55)',
                                        fontSize: '10px',
                                        lineHeight: '1.4',
                                      }}>
                                        {dest.tagline}
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </a>
                          </td>
                        ))}
                      </tr></tbody>
                    </table>
                  </td>
                </tr>

                {/* ── TRAVEL TIP ────────────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 36px' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                      style={{
                        background: `linear-gradient(135deg, ${C.deep} 0%, #1E3A52 100%)`,
                        borderRadius: '14px',
                        overflow: 'hidden',
                      }}>
                      <tbody><tr>
                        <td style={{ padding: '28px 32px' }}>
                          {/* Gold label on dark bg — high contrast */}
                          <p style={{
                            margin: '0 0 4px',
                            color: C.gold,
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '2.5px',
                            textTransform: 'uppercase',
                          }}>
                            Reisetips denne uken
                          </p>
                          {/* White headline on dark bg — always readable */}
                          <p style={{
                            margin: '0 0 10px',
                            color: C.white,
                            fontSize: '17px',
                            fontWeight: 700,
                            lineHeight: '1.4',
                          }}>
                            {tip.headline}
                          </p>
                          <p style={{
                            margin: 0,
                            color: 'rgba(255,255,255,0.75)',
                            fontSize: '14px',
                            lineHeight: '1.7',
                          }}>
                            {tip.body}
                          </p>
                        </td>
                      </tr></tbody>
                    </table>
                  </td>
                </tr>

                {/* ── SOCIAL PROOF STRIP ────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{
                    backgroundColor: C.sandLight,
                    padding: '24px 40px',
                    borderTop:    `1px solid ${C.border}`,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody><tr>
                        <td className="ew-stats-cell" align="center" width="33%">
                          {/* Dark text on sandLight (#FAF6EF) — correct contrast */}
                          <p style={{ margin: 0, color: C.deep, fontSize: '22px', fontWeight: 800 }}>2M+</p>
                          <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '11px' }}>hoteller i verden</p>
                        </td>
                        <td
                          className="ew-stats-cell"
                          align="center"
                          width="33%"
                          style={{
                            borderLeft:  `1px solid ${C.border}`,
                            borderRight: `1px solid ${C.border}`,
                          }}
                        >
                          <p style={{ margin: 0, color: C.deep, fontSize: '22px', fontWeight: 800 }}>190+</p>
                          <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '11px' }}>land og territorier</p>
                        </td>
                        <td className="ew-stats-cell ew-stats-last" align="center" width="33%">
                          <p style={{ margin: 0, color: C.deep, fontSize: '22px', fontWeight: 800 }}>24/7</p>
                          <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '11px' }}>norsk kundestøtte</p>
                        </td>
                      </tr></tbody>
                    </table>
                  </td>
                </tr>

                {/* ── MAIN CTA ──────────────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{
                    backgroundColor: C.white,
                    padding: '40px 40px 36px',
                    textAlign: 'center',
                  }}>
                    {/* Dark text on white bg — correct contrast */}
                    <p style={{ margin: '0 0 8px', color: C.deep, fontSize: '24px', fontWeight: 700 }}>
                      Klar for neste reise?
                    </p>
                    <p
                      className="ew-cta-text"
                      style={{
                        margin: '0 0 28px',
                        color: C.muted,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        maxWidth: '380px',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                    >
                      Søk blant over 2 millioner hoteller i hele verden og finn den beste prisen for din neste reise.
                    </p>
                    <a
                      href={`${baseUrl}/hoteller`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: C.coral,
                        color: C.white,
                        fontSize: '16px',
                        fontWeight: 700,
                        padding: '16px 48px',
                        borderRadius: '32px',
                        textDecoration: 'none',
                        letterSpacing: '0.2px',
                      }}
                    >
                      Søk hoteller nå
                    </a>
                    <p style={{ margin: '16px 0 0', color: C.mutedLight, fontSize: '12px' }}>
                      ✅ Ingen skjulte avgifter &nbsp;·&nbsp; 🔒 Sikker betaling &nbsp;·&nbsp; 📧 Bekreftelse på e-post
                    </p>
                  </td>
                </tr>

                {/* ── FOOTER ────────────────────────────────────────────────── */}
                <tr>
                  <td className="ew-pad" style={{
                    backgroundColor: C.deep,
                    borderRadius: '0 0 16px 16px',
                    padding: '32px 40px',
                    textAlign: 'center',
                  }}>
                    {/* Logo doubled: 110px → 220px, opacity removed for full visibility */}
                    <img
                      src={LOGO_URL}
                      alt="Sydenklar"
                      width="220"
                      height="auto"
                      className="ew-logo"
                      style={{ display: 'block', margin: '0 auto 20px', width: '220px', border: 0 }}
                    />

                    <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto 20px' }}>
                      <tbody><tr>
                        <td style={{ padding: '0 8px' }}>
                          <a href="https://www.instagram.com/sydenklar"
                            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>
                            Instagram
                          </a>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>|</td>
                        <td style={{ padding: '0 8px' }}>
                          <a href="https://www.facebook.com/sydenklar"
                            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>
                            Facebook
                          </a>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>|</td>
                        <td style={{ padding: '0 8px' }}>
                          <a href={`${baseUrl}/hjelp`}
                            style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>
                            Kundeservice
                          </a>
                        </td>
                      </tr></tbody>
                    </table>

                    <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                      Sydenklar AS · sydenklar.no · Oslo, Norge
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '11px', lineHeight: '1.8' }}>
                      Du mottar dette fordi du abonnerer på nyhetsbrev fra Sydenklar.<br />
                      <a href={unsubscribeUrl}
                        style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
                        Meld deg av her
                      </a>
                    </p>
                  </td>
                </tr>

              </tbody>
            </table>
            {/* ── END CONTAINER ── */}

          </td></tr></tbody>
        </table>

      </body>
    </html>
  )
}
