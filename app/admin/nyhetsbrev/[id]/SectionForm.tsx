'use client'

import { useState } from 'react'
import type { Section } from '@/lib/newsletter-types'

interface Props {
  section:  Section
  onSave:   (updated: Section) => void
  onCancel: () => void
}

export function SectionForm({ section, onSave, onCancel }: Props) {
  switch (section.type) {
    case 'hero':            return <HeroForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'event_banner':    return <EventBannerForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'hotel_grid':      return <HotelGridForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'offer_highlight': return <OfferHighlightForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'trending_dests':  return <TrendingDestsForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'travel_tip':      return <TravelTipForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'cta_block':       return <CtaBlockForm section={section} onSave={onSave} onCancel={onCancel} />
    case 'social_proof':    return <StaticSectionNote label="Social proof" desc="Viser alltid: 2M+ hoteller · 190+ land · 24/7 support" onCancel={onCancel} />
  }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB',
  fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box', outline: 'none',
}

const txtArea: React.CSSProperties = {
  ...inp, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit',
}

function FormActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
      <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
        Avbryt
      </button>
      <button onClick={onSave} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#0F1923', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
        Lagre seksjon
      </button>
    </div>
  )
}

function StaticSectionNote({ label, desc, onCancel }: { label: string; desc: string; onCancel: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ backgroundColor: '#F0F9FF', borderRadius: '8px', padding: '12px 16px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#0369A1', fontSize: '13px' }}>{label}</p>
        <p style={{ margin: 0, color: '#0369A1', fontSize: '12px' }}>{desc}</p>
      </div>
      <button onClick={onCancel} style={{ alignSelf: 'flex-start', padding: '8px 16px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer' }}>
        Lukk
      </button>
    </div>
  )
}

// ─── Hero form ────────────────────────────────────────────────────────────────

function HeroForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'hero' }> }) {
  const [s, setS] = useState(section)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Destinasjonsnavn">
        <input value={s.destinationName} onChange={e => setS({ ...s, destinationName: e.target.value })} style={inp} />
      </Row>
      <Row label="Land">
        <input value={s.countryName} onChange={e => setS({ ...s, countryName: e.target.value })} style={inp} />
      </Row>
      <Row label="Antall hoteller (valgfritt)">
        <input type="number" value={s.hotelCount ?? ''} onChange={e => setS({ ...s, hotelCount: e.target.value ? Number(e.target.value) : undefined })} style={inp} />
      </Row>
      <Row label="Hero-bilde URL (valgfritt — blank = automatisk)">
        <input value={s.imageUrl ?? ''} onChange={e => setS({ ...s, imageUrl: e.target.value || undefined })} placeholder="https://..." style={inp} />
      </Row>
      <Row label="CTA URL (valgfritt)">
        <input value={s.ctaUrl ?? ''} onChange={e => setS({ ...s, ctaUrl: e.target.value || undefined })} placeholder="https://..." style={inp} />
      </Row>
      <Row label="CTA-tekst (valgfritt)">
        <input value={s.ctaText ?? ''} onChange={e => setS({ ...s, ctaText: e.target.value || undefined })} placeholder="Søk ledige rom →" style={inp} />
      </Row>
      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── Event banner form ────────────────────────────────────────────────────────

function EventBannerForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'event_banner' }> }) {
  const [s, setS] = useState(section)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Eventnavn">
        <input value={s.eventName} onChange={e => setS({ ...s, eventName: e.target.value })} style={inp} />
      </Row>
      <Row label="Tagline / undertekst">
        <textarea value={s.tagline} onChange={e => setS({ ...s, tagline: e.target.value })} style={txtArea} />
      </Row>
      <Row label="Hero-bilde URL">
        <input value={s.heroImageUrl} onChange={e => setS({ ...s, heroImageUrl: e.target.value })} placeholder="https://..." style={inp} />
      </Row>
      <Row label="Temafarge">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="color" value={s.themeColor} onChange={e => setS({ ...s, themeColor: e.target.value })}
            style={{ width: '40px', height: '34px', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '2px', cursor: 'pointer' }} />
          <input value={s.themeColor} onChange={e => setS({ ...s, themeColor: e.target.value })} style={{ ...inp, flex: 1 }} />
        </div>
      </Row>
      <Row label="CTA URL (valgfritt)">
        <input value={s.ctaUrl ?? ''} onChange={e => setS({ ...s, ctaUrl: e.target.value || undefined })} placeholder="https://..." style={inp} />
      </Row>
      <Row label="CTA-tekst (valgfritt)">
        <input value={s.ctaText ?? ''} onChange={e => setS({ ...s, ctaText: e.target.value || undefined })} placeholder="Se tilbud →" style={inp} />
      </Row>
      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── Hotel grid form ──────────────────────────────────────────────────────────

function HotelGridForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'hotel_grid' }> }) {
  const [s, setS] = useState(section)

  const updateHotel = (idx: number, field: string, value: string | number) => {
    const hotels = [...s.hotels]
    hotels[idx] = { ...hotels[idx], [field]: value }
    setS({ ...s, hotels })
  }

  const addHotel = () => {
    setS({ ...s, hotels: [...s.hotels, { name: '', city: '', country: '', starRating: 4, pageUrl: '' }] })
  }

  const removeHotel = (idx: number) => {
    setS({ ...s, hotels: s.hotels.filter((_, i) => i !== idx) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Seksjonstittel (valgfritt)">
        <input value={s.title ?? ''} onChange={e => setS({ ...s, title: e.target.value || undefined })} placeholder="Ukens topphotell" style={inp} />
      </Row>
      <Row label="Undertittel (valgfritt)">
        <input value={s.subtitle ?? ''} onChange={e => setS({ ...s, subtitle: e.target.value || undefined })} placeholder="Vår fremhevede anbefaling" style={inp} />
      </Row>

      <div>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
          Hoteller ({s.hotels.length}/3 — første er fremhevet)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {s.hotels.map((hotel, i) => (
            <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                  {i === 0 ? '⭐ Fremhevet' : `Hotel ${i + 1}`}
                </span>
                <button onClick={() => removeHotel(i)} style={{ background: 'none', border: 'none', color: '#B91C1C', fontSize: '12px', cursor: 'pointer' }}>Fjern</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input placeholder="Hotellnavn" value={hotel.name} onChange={e => updateHotel(i, 'name', e.target.value)} style={inp} />
                <input placeholder="By" value={hotel.city} onChange={e => updateHotel(i, 'city', e.target.value)} style={inp} />
                <input placeholder="Land" value={hotel.country} onChange={e => updateHotel(i, 'country', e.target.value)} style={inp} />
                <select value={hotel.starRating} onChange={e => updateHotel(i, 'starRating', Number(e.target.value))} style={inp}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
              <input placeholder="Hotell-URL" value={hotel.pageUrl} onChange={e => updateHotel(i, 'pageUrl', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
              <input placeholder="Bilde-URL (valgfritt)" value={hotel.imageUrl ?? ''} onChange={e => updateHotel(i, 'imageUrl', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
            </div>
          ))}
        </div>
        {s.hotels.length < 3 && (
          <button onClick={addHotel} style={{ marginTop: '8px', padding: '8px 16px', borderRadius: '6px', border: '1px dashed #D1D5DB', backgroundColor: '#F9FAFB', color: '#6B7280', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
            + Legg til hotell
          </button>
        )}
      </div>

      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── Offer highlight form ─────────────────────────────────────────────────────

function OfferHighlightForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'offer_highlight' }> }) {
  const [s, setS] = useState(section)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Tittel">
        <input value={s.title} onChange={e => setS({ ...s, title: e.target.value })} style={inp} />
      </Row>
      <Row label="Beskrivelse">
        <textarea value={s.description} onChange={e => setS({ ...s, description: e.target.value })} style={txtArea} />
      </Row>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Row label="Pris (valgfritt)">
          <input value={s.price ?? ''} onChange={e => setS({ ...s, price: e.target.value || undefined })} placeholder="fra kr 1 490/natt" style={inp} />
        </Row>
        <Row label="Opprinnelig pris (valgfritt)">
          <input value={s.originalPrice ?? ''} onChange={e => setS({ ...s, originalPrice: e.target.value || undefined })} placeholder="kr 2 100/natt" style={inp} />
        </Row>
      </div>
      <Row label="Bilde-URL (valgfritt)">
        <input value={s.imageUrl ?? ''} onChange={e => setS({ ...s, imageUrl: e.target.value || undefined })} placeholder="https://..." style={inp} />
      </Row>
      <Row label="Badge-tekst (valgfritt)">
        <input value={s.badgeText ?? ''} onChange={e => setS({ ...s, badgeText: e.target.value || undefined })} placeholder="🔥 Helgetilbud" style={inp} />
      </Row>
      <Row label="CTA URL">
        <input value={s.ctaUrl} onChange={e => setS({ ...s, ctaUrl: e.target.value })} style={inp} />
      </Row>
      <Row label="CTA-tekst">
        <input value={s.ctaText} onChange={e => setS({ ...s, ctaText: e.target.value })} style={inp} />
      </Row>
      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── Trending destinations form ───────────────────────────────────────────────

function TrendingDestsForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'trending_dests' }> }) {
  const [s, setS] = useState(section)
  const [useCustom, setUseCustom] = useState(!!section.destinations)

  const dests = s.destinations ?? []

  const updateDest = (idx: number, field: string, value: string) => {
    const ds = [...dests]
    ds[idx] = { ...ds[idx], [field]: value }
    setS({ ...s, destinations: ds })
  }

  const addDest = () => {
    setS({ ...s, destinations: [...dests, { city: '', country: '', imageUrl: '', tagline: '', pageUrl: '' }] })
    setUseCustom(true)
  }

  const removeDest = (idx: number) => {
    const remaining = dests.filter((_, i) => i !== idx)
    setS({ ...s, destinations: remaining.length > 0 ? remaining : undefined })
    if (remaining.length === 0) setUseCustom(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Seksjonstittel (valgfritt)">
        <input value={s.title ?? ''} onChange={e => setS({ ...s, title: e.target.value || undefined })} placeholder="Trending destinasjoner denne uken" style={inp} />
      </Row>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" checked={useCustom} onChange={e => {
          setUseCustom(e.target.checked)
          if (!e.target.checked) setS({ ...s, destinations: undefined })
        }} id="customDests" />
        <label htmlFor="customDests" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          Bruk egne destinasjoner (standard = automatisk valgt)
        </label>
      </div>

      {useCustom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dests.map((d, i) => (
            <div key={i} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Destinasjon {i + 1}</span>
                <button onClick={() => removeDest(i)} style={{ background: 'none', border: 'none', color: '#B91C1C', fontSize: '12px', cursor: 'pointer' }}>Fjern</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input placeholder="By" value={d.city} onChange={e => updateDest(i, 'city', e.target.value)} style={inp} />
                <input placeholder="Land" value={d.country} onChange={e => updateDest(i, 'country', e.target.value)} style={inp} />
              </div>
              <input placeholder="Tagline" value={d.tagline} onChange={e => updateDest(i, 'tagline', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
              <input placeholder="Bilde-URL" value={d.imageUrl} onChange={e => updateDest(i, 'imageUrl', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
              <input placeholder="Destinasjons-URL (valgfritt)" value={d.pageUrl} onChange={e => updateDest(i, 'pageUrl', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
            </div>
          ))}
          {dests.length < 3 && (
            <button onClick={addDest} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px dashed #D1D5DB', backgroundColor: '#F9FAFB', color: '#6B7280', fontSize: '13px', cursor: 'pointer' }}>
              + Legg til destinasjon
            </button>
          )}
        </div>
      )}

      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── Travel tip form ──────────────────────────────────────────────────────────

function TravelTipForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'travel_tip' }> }) {
  const [s, setS] = useState(section)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Overskrift">
        <input value={s.headline} onChange={e => setS({ ...s, headline: e.target.value })} style={inp} />
      </Row>
      <Row label="Brødtekst">
        <textarea value={s.body} onChange={e => setS({ ...s, body: e.target.value })} style={txtArea} />
      </Row>
      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}

// ─── CTA block form ───────────────────────────────────────────────────────────

function CtaBlockForm({ section, onSave, onCancel }: Props & { section: Extract<Section, { type: 'cta_block' }> }) {
  const [s, setS] = useState(section)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Row label="Tittel">
        <input value={s.title} onChange={e => setS({ ...s, title: e.target.value })} style={inp} />
      </Row>
      <Row label="Beskrivelse">
        <textarea value={s.description} onChange={e => setS({ ...s, description: e.target.value })} style={txtArea} />
      </Row>
      <Row label="CTA URL">
        <input value={s.ctaUrl} onChange={e => setS({ ...s, ctaUrl: e.target.value })} style={inp} />
      </Row>
      <Row label="CTA-tekst">
        <input value={s.ctaText} onChange={e => setS({ ...s, ctaText: e.target.value })} style={inp} />
      </Row>
      <Row label="Notat under knapp (valgfritt)">
        <input value={s.note ?? ''} onChange={e => setS({ ...s, note: e.target.value || undefined })} placeholder="✅ Gratis avbestilling..." style={inp} />
      </Row>
      <FormActions onSave={() => onSave(s)} onCancel={onCancel} />
    </div>
  )
}
