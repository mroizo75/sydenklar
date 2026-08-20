import * as React from 'react'
import type { Section, CampaignTheme, TrendingDestsSection } from '@/lib/newsletter-types'

export interface CampaignEmailProps {
  subject: string
  sections: Section[]
  theme?: CampaignTheme
  weekNumber?: number
  year?: number
  firstName?: string
  unsubscribeUrl: string
  baseUrl: string
}

// ─── Brand tokens ──────────────────────────────────────────────────────────────
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

const RESPONSIVE_CSS = `
  @media only screen and (max-width: 620px) {
    .ew-outer { padding: 0 !important; }
    .ew-logo { width: 190px !important; max-width: 190px !important; }
    .ew-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .ew-hero-img { height: 210px !important; }
    .ew-dest-title { font-size: 26px !important; }
    .hotel-col {
      display: block !important; width: 100% !important; max-width: 100% !important;
      padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 12px !important;
    }
    .trending-col {
      display: block !important; width: 100% !important; max-width: 100% !important;
      padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 10px !important;
    }
    .ew-stats-cell {
      display: block !important; width: 100% !important;
      padding: 14px 0 !important; border-left: none !important;
      border-right: none !important; border-bottom: 1px solid #E5E7EB !important;
    }
    .ew-stats-last { border-bottom: none !important; }
    .ew-offer-row { display: block !important; }
    .ew-offer-img { width: 100% !important; height: 180px !important; }
    .ew-offer-body { width: 100% !important; }
  }
`

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
  default:   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85',
}

const DEFAULT_TRENDING = [
  { city: 'Barcelona', country: 'Spania',    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80', tagline: 'Arkitektur, strender og tapas',  pageUrl: '' },
  { city: 'Roma',      country: 'Italia',    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80', tagline: 'Evighetens by venter på deg',   pageUrl: '' },
  { city: 'Paris',     country: 'Frankrike', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', tagline: 'Romantikk og haute cuisine',    pageUrl: '' },
]

function Stars({ rating }: { rating: number }) {
  const n = Math.round(Math.max(0, Math.min(5, rating)))
  return (
    <span style={{ color: C.gold, fontSize: '15px', letterSpacing: '1px' }}>
      {'★'.repeat(n)}
      <span style={{ color: '#D1D5DB' }}>{'★'.repeat(5 - n)}</span>
    </span>
  )
}

// ─── Section renderers ────────────────────────────────────────────────────────

function renderHero(s: Extract<Section, { type: 'hero' }>, baseUrl: string, primary: string) {
  const heroImage = s.imageUrl ?? DEST_IMAGES[s.countryName] ?? DEST_IMAGES.default
  const ctaUrl    = s.ctaUrl ?? `${baseUrl}/hoteller?destinasjon=${encodeURIComponent(s.destinationName)}`
  const ctaText   = s.ctaText ?? 'Søk ledige rom →'

  return (
    <React.Fragment key="hero">
      <tr>
        <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
          <a href={ctaUrl} style={{ display: 'block', lineHeight: 0, textDecoration: 'none' }}>
            <img
              src={heroImage}
              alt={s.destinationName}
              width="600"
              height="280"
              className="ew-hero-img"
              style={{ display: 'block', width: '100%', maxWidth: '600px', height: '280px', objectFit: 'cover', border: 0 }}
            />
          </a>
        </td>
      </tr>
      <tr>
        <td className="ew-pad" style={{ backgroundColor: C.deep, padding: '28px 40px 32px' }}>
          <p style={{ margin: '0 0 8px', color: primary, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
            ✈️ Ukens destinasjon
          </p>
          <h1 className="ew-dest-title" style={{ margin: '0 0 6px', color: C.white, fontSize: '34px', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: '1.1' }}>
            {s.destinationName}
          </h1>
          <p style={{ margin: '0 0 22px', color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: '1.4' }}>
            {s.countryName}{s.hotelCount && s.hotelCount > 0 ? ` · ${s.hotelCount.toLocaleString('nb-NO')} hoteller` : ''}
          </p>
          <a href={ctaUrl} style={{ display: 'inline-block', backgroundColor: primary, color: C.white, fontSize: '14px', fontWeight: 700, padding: '12px 28px', borderRadius: '28px', textDecoration: 'none', letterSpacing: '0.3px' }}>
            {ctaText}
          </a>
        </td>
      </tr>
    </React.Fragment>
  )
}

function renderEventBanner(s: Extract<Section, { type: 'event_banner' }>) {
  const ctaUrl  = s.ctaUrl  ?? '#'
  const ctaText = s.ctaText ?? 'Se tilbud →'

  return (
    <tr key="event_banner">
      <td className="ew-pad" style={{ padding: '0 40px 28px', backgroundColor: C.white }}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ borderRadius: '16px', overflow: 'hidden', border: `2px solid ${s.themeColor}` }}>
          <tbody>
            <tr>
              <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                <img
                  src={s.heroImageUrl}
                  alt={s.eventName}
                  width="520"
                  style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover', border: 0 }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ padding: '24px 28px', background: `linear-gradient(135deg, ${s.themeColor}22 0%, ${C.deep} 60%)`, backgroundColor: C.deep }}>
                <p style={{ margin: '0 0 6px', color: s.themeColor, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                  🎉 Spesialtilbud
                </p>
                <p style={{ margin: '0 0 8px', color: C.white, fontSize: '22px', fontWeight: 700, lineHeight: '1.2' }}>
                  {s.eventName}
                </p>
                <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5' }}>
                  {s.tagline}
                </p>
                <a href={ctaUrl} style={{ display: 'inline-block', backgroundColor: s.themeColor, color: C.white, fontSize: '14px', fontWeight: 700, padding: '11px 26px', borderRadius: '28px', textDecoration: 'none' }}>
                  {ctaText}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function renderHotelGrid(s: Extract<Section, { type: 'hotel_grid' }>, primary: string) {
  const featured   = s.hotels[0]  ?? null
  const remaining  = s.hotels.slice(1, 3)
  const title      = s.title    ?? 'Ukens topphotell'
  const subtitle   = s.subtitle ?? 'Vår fremhevede anbefaling'

  return (
    <React.Fragment key="hotel_grid">
      {featured && (
        <>
          <tr>
            <td className="ew-pad" style={{ backgroundColor: C.white, padding: '28px 40px 16px' }}>
              <p style={{ margin: '0 0 3px', color: primary, fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                ⭐ {title}
              </p>
              <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>{subtitle}</h2>
            </td>
          </tr>
          <tr>
            <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 24px' }}>
              <a href={featured.pageUrl} style={{ textDecoration: 'none', display: 'block' }}>
                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                  style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                        <img
                          src={featured.imageUrl ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&q=80'}
                          alt={featured.name}
                          width="520"
                          style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover', border: 0 }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '20px 24px', backgroundColor: C.sandLight }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                          <tbody><tr>
                            <td className="ew-feat-info-left" style={{ verticalAlign: 'middle' }}>
                              <p style={{ margin: '0 0 3px', color: C.muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                {featured.city}, {featured.country}
                              </p>
                              <p style={{ margin: '0 0 6px', color: C.deep, fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}>
                                {featured.name}
                              </p>
                              <Stars rating={featured.starRating} />
                            </td>
                            <td className="ew-feat-btn-cell" align="right" style={{ verticalAlign: 'middle' }}>
                              <span style={{ display: 'inline-block', backgroundColor: primary, color: C.white, fontSize: '13px', fontWeight: 700, padding: '10px 22px', borderRadius: '24px', whiteSpace: 'nowrap' }}>
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
      {remaining.length > 0 && (
        <>
          <tr>
            <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 16px' }}>
              <p style={{ margin: '0 0 3px', color: primary, fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                🏨 Flere gode valg
              </p>
              <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>
                Topp overnattsteder
              </h2>
            </td>
          </tr>
          <tr>
            <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 28px' }}>
              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                <tbody><tr>
                  {remaining.map((hotel, i) => (
                    <td
                      key={i}
                      className="hotel-col"
                      width="50%"
                      style={{ paddingLeft: i === 1 ? '8px' : '0', paddingRight: i === 0 ? '8px' : '0', verticalAlign: 'top' }}
                    >
                      <a href={hotel.pageUrl} style={{ textDecoration: 'none', display: 'block' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                          style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                                <img
                                  src={hotel.imageUrl ?? 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=640&q=80'}
                                  alt={hotel.name}
                                  style={{ display: 'block', width: '100%', height: '140px', objectFit: 'cover', border: 0 }}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '14px 16px 16px', backgroundColor: C.sandLight }}>
                                <p style={{ margin: '0 0 2px', color: C.muted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{hotel.city}</p>
                                <p style={{ margin: '0 0 6px', color: C.deep, fontSize: '14px', fontWeight: 700, lineHeight: '1.3' }}>{hotel.name}</p>
                                <Stars rating={hotel.starRating} />
                                <div style={{ marginTop: '12px' }}>
                                  <span style={{ display: 'inline-block', backgroundColor: C.deep, color: C.white, fontSize: '11px', fontWeight: 700, padding: '7px 14px', borderRadius: '20px' }}>
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
    </React.Fragment>
  )
}

function renderOfferHighlight(s: Extract<Section, { type: 'offer_highlight' }>, primary: string) {
  return (
    <tr key="offer_highlight">
      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 28px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ borderRadius: '14px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <tbody>
            {s.imageUrl && (
              <tr>
                <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    width="520"
                    style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover', border: 0 }}
                  />
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '24px 28px', backgroundColor: C.sandLight }}>
                {s.badgeText && (
                  <p style={{ margin: '0 0 10px' }}>
                    <span style={{ display: 'inline-block', backgroundColor: primary, color: C.white, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                      {s.badgeText}
                    </span>
                  </p>
                )}
                <p style={{ margin: '0 0 6px', color: C.deep, fontSize: '20px', fontWeight: 700, lineHeight: '1.2' }}>
                  {s.title}
                </p>
                <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '14px', lineHeight: '1.6' }}>
                  {s.description}
                </p>
                {(s.price || s.originalPrice) && (
                  <p style={{ margin: '0 0 20px' }}>
                    {s.originalPrice && (
                      <span style={{ color: C.muted, fontSize: '14px', textDecoration: 'line-through', marginRight: '8px' }}>
                        {s.originalPrice}
                      </span>
                    )}
                    {s.price && (
                      <span style={{ color: C.deep, fontSize: '22px', fontWeight: 800 }}>
                        {s.price}
                      </span>
                    )}
                  </p>
                )}
                <a href={s.ctaUrl} style={{ display: 'inline-block', backgroundColor: primary, color: C.white, fontSize: '14px', fontWeight: 700, padding: '12px 28px', borderRadius: '28px', textDecoration: 'none' }}>
                  {s.ctaText}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function renderTrendingDests(s: TrendingDestsSection, baseUrl: string) {
  const destinations = s.destinations && s.destinations.length > 0
    ? s.destinations
    : DEFAULT_TRENDING.map(d => ({ ...d, pageUrl: d.pageUrl || `${baseUrl}/hoteller?destinasjon=${encodeURIComponent(d.city)}` }))

  return (
    <React.Fragment key="trending_dests">
      <tr>
        <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 16px' }}>
          <p style={{ margin: '0 0 3px', color: C.gold, fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
            🌍 Populære reisemål
          </p>
          <h2 style={{ margin: 0, color: C.deep, fontSize: '20px', fontWeight: 700 }}>
            {s.title ?? 'Trending destinasjoner denne uken'}
          </h2>
        </td>
      </tr>
      <tr>
        <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 32px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
            <tbody><tr>
              {destinations.slice(0, 3).map((dest, i) => (
                <td
                  key={i}
                  className="trending-col"
                  width="33%"
                  style={{ paddingLeft: i > 0 ? '6px' : '0', paddingRight: i < 2 ? '6px' : '0', verticalAlign: 'top' }}
                >
                  <a href={dest.pageUrl || `${baseUrl}/hoteller?destinasjon=${encodeURIComponent(dest.city)}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
                      style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: 0, lineHeight: 0, fontSize: 0 }}>
                            <img
                              src={dest.imageUrl}
                              alt={dest.city}
                              style={{ display: 'block', width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px 10px 0 0', border: 0 }}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 12px 12px', backgroundColor: C.deep, borderRadius: '0 0 10px 10px' }}>
                            <p style={{ margin: '0 0 2px', color: C.white, fontSize: '13px', fontWeight: 700, lineHeight: '1.2' }}>{dest.city}</p>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '10px', lineHeight: '1.4' }}>{dest.tagline}</p>
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
    </React.Fragment>
  )
}

function renderTravelTip(s: Extract<Section, { type: 'travel_tip' }>) {
  return (
    <tr key="travel_tip">
      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 36px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          style={{ background: `linear-gradient(135deg, ${C.deep} 0%, #1E3A52 100%)`, borderRadius: '14px', overflow: 'hidden' }}>
          <tbody><tr>
            <td style={{ padding: '28px 32px' }}>
              <p style={{ margin: '0 0 4px', color: C.gold, fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                Reisetips
              </p>
              <p style={{ margin: '0 0 10px', color: C.white, fontSize: '17px', fontWeight: 700, lineHeight: '1.4' }}>
                {s.headline}
              </p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.7' }}>
                {s.body}
              </p>
            </td>
          </tr></tbody>
        </table>
      </td>
    </tr>
  )
}

function renderCtaBlock(s: Extract<Section, { type: 'cta_block' }>, primary: string) {
  return (
    <tr key="cta_block">
      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '40px 40px 36px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', color: C.deep, fontSize: '24px', fontWeight: 700 }}>
          {s.title}
        </p>
        <p className="ew-cta-text" style={{ margin: '0 0 28px', color: C.muted, fontSize: '14px', lineHeight: '1.6', maxWidth: '380px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          {s.description}
        </p>
        <a href={s.ctaUrl} style={{ display: 'inline-block', backgroundColor: primary, color: C.white, fontSize: '16px', fontWeight: 700, padding: '16px 48px', borderRadius: '32px', textDecoration: 'none', letterSpacing: '0.2px' }}>
          {s.ctaText}
        </a>
        {s.note && (
          <p style={{ margin: '16px 0 0', color: C.mutedLight, fontSize: '12px' }}>{s.note}</p>
        )}
      </td>
    </tr>
  )
}

function renderSocialProof() {
  return (
    <tr key="social_proof">
      <td className="ew-pad" style={{ backgroundColor: C.sandLight, padding: '24px 40px', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
          <tbody><tr>
            <td className="ew-stats-cell" align="center" width="33%">
              <p style={{ margin: 0, color: C.deep, fontSize: '22px', fontWeight: 800 }}>2M+</p>
              <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '11px' }}>hoteller i verden</p>
            </td>
            <td className="ew-stats-cell" align="center" width="33%" style={{ borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
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
  )
}

function renderDivider() {
  return (
    <tr key="divider">
      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '0 40px 28px' }}>
        <div style={{ height: '1px', backgroundColor: C.border }} />
      </td>
    </tr>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CampaignEmail({
  subject,
  sections,
  theme,
  weekNumber,
  year,
  firstName,
  unsubscribeUrl,
  baseUrl,
}: CampaignEmailProps) {
  const LOGO_URL  = `${baseUrl}/logo-hvit.png`
  const primary   = theme?.primaryColor ?? C.coral
  const greeting  = firstName ? `Hei ${firstName} 👋` : 'Hei reisevenn 👋'
  const now       = new Date()
  const wk        = weekNumber ?? Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)
  const yr        = year ?? now.getFullYear()
  const headerLabel = theme?.headerLabel ?? `Uke ${wk} · ${yr}`

  const sectionNodes = sections.flatMap((section, idx) => {
    const nodes: React.ReactNode[] = []

    if (idx > 0 && ['hero', 'hotel_grid', 'trending_dests'].includes(section.type)) {
      nodes.push(<React.Fragment key={`div-${idx}`}>{renderDivider()}</React.Fragment>)
    }

    switch (section.type) {
      case 'hero':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderHero(section, baseUrl, primary)}</React.Fragment>)
        break
      case 'event_banner':
        nodes.push(<tr key={`sec-${idx}`}>{null}</tr>)
        nodes[nodes.length - 1] = <React.Fragment key={`sec-${idx}`}>{renderEventBanner(section)}</React.Fragment>
        break
      case 'hotel_grid':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderHotelGrid(section, primary)}</React.Fragment>)
        break
      case 'offer_highlight':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderOfferHighlight(section, primary)}</React.Fragment>)
        break
      case 'trending_dests':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderTrendingDests(section, baseUrl)}</React.Fragment>)
        break
      case 'travel_tip':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderTravelTip(section)}</React.Fragment>)
        break
      case 'cta_block':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderCtaBlock(section, primary)}</React.Fragment>)
        break
      case 'social_proof':
        nodes.push(<React.Fragment key={`sec-${idx}`}>{renderSocialProof()}</React.Fragment>)
        break
    }

    return nodes
  })

  // Greeting row (shown after hero if hero is first, otherwise at top of body)
  const hasHeroFirst = sections[0]?.type === 'hero'
  const greetingRow = (
    <tr key="greeting">
      <td className="ew-pad" style={{ backgroundColor: C.white, padding: '32px 40px 24px' }}>
        <p style={{ margin: '0 0 12px', color: C.deep, fontSize: '18px', fontWeight: 600 }}>{greeting}</p>
        <p style={{ margin: 0, color: C.muted, fontSize: '15px', lineHeight: '1.75' }}>
          Vi har plukket ut <strong style={{ color: C.deep }}>denne ukens beste reiseinspirasjoner</strong> — kuratert for deg som vil reise smart og til rett pris. Scroll ned! 🌍
        </p>
      </td>
    </tr>
  )

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{subject}</title>
        <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F3F4F6', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", WebkitTextSizeAdjust: '100%' }}>

        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation"
          className="ew-outer"
          style={{ backgroundColor: '#F3F4F6', padding: '32px 16px' }}>
          <tbody><tr><td align="center">

            <table width="600" cellPadding="0" cellSpacing="0" role="presentation"
              style={{ maxWidth: '600px', width: '100%' }}>
              <tbody>

                {/* Pre-header */}
                <tr>
                  <td style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0, fontSize: '1px', lineHeight: '1px', color: '#F3F4F6' }}>
                    {subject} — Sydenklar
                  </td>
                </tr>

                {/* Logo bar */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.deep, borderRadius: '16px 16px 0 0', padding: '20px 40px' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody><tr>
                        <td align="left" style={{ verticalAlign: 'middle' }}>
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
                          <span style={{ display: 'inline-block', backgroundColor: 'rgba(229,98,62,0.15)', border: `1px solid ${primary}66`, borderRadius: '20px', padding: '5px 14px', color: '#F4A485', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            {headerLabel}
                          </span>
                        </td>
                      </tr></tbody>
                    </table>
                  </td>
                </tr>

                {/* Sections */}
                {hasHeroFirst ? (
                  <>
                    {sectionNodes[0]}
                    {greetingRow}
                    {renderDivider()}
                    {sectionNodes.slice(1)}
                  </>
                ) : (
                  <>
                    {greetingRow}
                    {renderDivider()}
                    {sectionNodes}
                  </>
                )}

                {/* Footer */}
                <tr>
                  <td className="ew-pad" style={{ backgroundColor: C.deep, borderRadius: '0 0 16px 16px', padding: '32px 40px', textAlign: 'center' }}>
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
                          <a href="https://www.instagram.com/sydenklar" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>Instagram</a>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>|</td>
                        <td style={{ padding: '0 8px' }}>
                          <a href="https://www.facebook.com/sydenklar" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>Facebook</a>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>|</td>
                        <td style={{ padding: '0 8px' }}>
                          <a href={`${baseUrl}/hjelp`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}>Kundeservice</a>
                        </td>
                      </tr></tbody>
                    </table>
                    <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                      Sydenklar AS · sydenklar.no · Oslo, Norge
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '11px', lineHeight: '1.8' }}>
                      Du mottar dette fordi du abonnerer på nyhetsbrev fra Sydenklar.<br />
                      <a href={unsubscribeUrl} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Meld deg av her</a>
                    </p>
                  </td>
                </tr>

              </tbody>
            </table>

          </td></tr></tbody>
        </table>

      </body>
    </html>
  )
}
