'use client'

import { useState, useCallback } from 'react'
import type { NewsletterCampaign, NewsletterEvent, Section, CampaignStatus } from '@/lib/newsletter-types'
import { SECTION_LABELS } from '@/lib/newsletter-types'
import { SectionForm } from './SectionForm'

interface Props {
  campaign:    NewsletterCampaign
  events:      NewsletterEvent[]
  campaignId:  string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Utkast',     bg: '#F3F4F6', color: '#374151' },
  scheduled: { label: 'Planlagt',   bg: '#DBEAFE', color: '#1D4ED8' },
  sent:      { label: 'Sendt',      bg: '#DCFCE7', color: '#15803D' },
  cancelled: { label: 'Kansellert', bg: '#FEE2E2', color: '#B91C1C' },
}

// ─── Main editor component ─────────────────────────────────────────────────────

export function CampaignEditor({ campaign: initial, events, campaignId }: Props) {
  const [campaign, setCampaign] = useState(initial)
  const [saveState, setSaveState]           = useState<SaveState>('idle')
  const [saveError, setSaveError]           = useState('')
  const [editingSection, setEditingSection] = useState<number | null>(null)
  const [addingSection,  setAddingSection]  = useState(false)
  const [previewOpen,    setPreviewOpen]    = useState(false)
  const [sendConfirm,    setSendConfirm]    = useState(false)
  const [sending,        setSending]        = useState(false)
  const [sendResult,     setSendResult]     = useState<{ sent: number } | null>(null)
  const [sendError,      setSendError]      = useState('')

  const isSent = campaign.status === 'sent'

  const save = useCallback(async (patch: Partial<Pick<NewsletterCampaign, 'name' | 'subject' | 'sections' | 'scheduledAt' | 'status' | 'theme' | 'eventId'>>) => {
    setSaveState('saving')
    setSaveError('')
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Lagring feilet')
      }
      const updated = await res.json() as NewsletterCampaign
      setCampaign(updated)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setSaveState('error')
      setSaveError(e.message ?? 'Ukjent feil')
    }
  }, [campaignId])

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const newSections = [...campaign.sections]
    const target = dir === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= newSections.length) return
    ;[newSections[idx], newSections[target]] = [newSections[target], newSections[idx]]
    save({ sections: newSections })
  }

  const deleteSection = (idx: number) => {
    const newSections = campaign.sections.filter((_, i) => i !== idx)
    if (editingSection === idx) setEditingSection(null)
    save({ sections: newSections })
  }

  const updateSection = (idx: number, updated: Section) => {
    const newSections = [...campaign.sections]
    newSections[idx] = updated
    save({ sections: newSections })
    setEditingSection(null)
  }

  const addSection = (type: Section['type']) => {
    const defaults: Record<Section['type'], Section> = {
      hero:            { type: 'hero', destinationName: 'Barcelona', countryName: 'Spania' },
      event_banner:    { type: 'event_banner', eventName: 'Event-navn', tagline: 'Beskriv eventet her', heroImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85', themeColor: '#E5623E' },
      hotel_grid:      { type: 'hotel_grid', hotels: [] },
      offer_highlight: { type: 'offer_highlight', title: 'Tilbudsnavn', description: 'Beskriv tilbudet', ctaUrl: 'https://www.sydenklar.no', ctaText: 'Se tilbud →' },
      trending_dests:  { type: 'trending_dests' },
      travel_tip:      { type: 'travel_tip', headline: 'Reisetips', body: 'Skriv tips her...' },
      cta_block:       { type: 'cta_block', title: 'Klar for neste reise?', description: 'Søk blant millioner av hoteller.', ctaUrl: 'https://www.sydenklar.no/hoteller', ctaText: 'Søk hoteller nå' },
      social_proof:    { type: 'social_proof' },
    }
    const newSections = [...campaign.sections, defaults[type]]
    save({ sections: newSections })
    setAddingSection(false)
    setEditingSection(newSections.length - 1)
  }

  const sendNow = async () => {
    setSending(true)
    setSendError('')
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Sending feilet')
      setSendResult(data)
      setSendConfirm(false)
      setCampaign(prev => ({ ...prev, status: 'sent', sentAt: new Date().toISOString(), recipientCount: data.sent }))
    } catch (err: unknown) {
      const e = err as { message?: string }
      setSendError(e.message ?? 'Ukjent feil')
    } finally {
      setSending(false)
    }
  }

  const sc = STATUS_CONFIG[campaign.status]

  return (
    <div>
      {/* Success banner after send */}
      {sendResult && (
        <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#15803D', fontSize: '15px' }}>Kampanje sendt!</p>
            <p style={{ margin: '2px 0 0', color: '#166534', fontSize: '13px' }}>Sendt til {sendResult.sent.toLocaleString('nb-NO')} abonnenter</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <a href="/admin/nyhetsbrev" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none' }}>← Nyhetsbrev</a>
          <h1 style={{ margin: '8px 0 4px', fontSize: '22px', fontWeight: 700, color: '#0F1923' }}>{campaign.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
              {sc.label}
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{campaign.sections.length} seksjoner</span>
            {saveState === 'saving' && <span style={{ color: '#6B7280', fontSize: '12px' }}>Lagrer…</span>}
            {saveState === 'saved'  && <span style={{ color: '#15803D', fontSize: '12px' }}>✓ Lagret</span>}
            {saveState === 'error'  && <span style={{ color: '#B91C1C', fontSize: '12px' }}>⚠ {saveError}</span>}
          </div>
        </div>

        {!isSent && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPreviewOpen(true)}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              👁 Forhåndsvis
            </button>
            <button
              onClick={() => setSendConfirm(true)}
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#E5623E', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              📤 Send nå
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Left: section builder */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F1923' }}>Seksjoner</h2>
            {!isSent && (
              <button
                onClick={() => setAddingSection(true)}
                style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                + Legg til seksjon
              </button>
            )}
          </div>

          {campaign.sections.length === 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #D1D5DB', padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', fontSize: '24px' }}>📭</p>
              <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: '14px' }}>Ingen seksjoner ennå. Legg til din første!</p>
              <button
                onClick={() => setAddingSection(true)}
                style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#0F1923', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                + Legg til seksjon
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {campaign.sections.map((section, idx) => (
              <div key={idx}>
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    border: editingSection === idx ? '2px solid #E5623E' : '1px solid #E5E7EB',
                    overflow: 'hidden',
                  }}
                >
                  {/* Section header row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      gap: '12px',
                      cursor: isSent ? 'default' : 'pointer',
                      backgroundColor: editingSection === idx ? '#FFF5F2' : '#fff',
                    }}
                    onClick={() => !isSent && setEditingSection(editingSection === idx ? null : idx)}
                  >
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>
                      {SECTION_LABELS[section.type].split(' ')[0]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                        {SECTION_LABELS[section.type]}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getSectionPreview(section)}
                      </p>
                    </div>
                    {!isSent && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <IconBtn onClick={() => moveSection(idx, 'up')}   disabled={idx === 0}                          title="Flytt opp">↑</IconBtn>
                        <IconBtn onClick={() => moveSection(idx, 'down')} disabled={idx === campaign.sections.length - 1} title="Flytt ned">↓</IconBtn>
                        <IconBtn onClick={() => deleteSection(idx)} danger title="Slett seksjon">✕</IconBtn>
                      </div>
                    )}
                  </div>

                  {/* Inline section editor */}
                  {editingSection === idx && !isSent && (
                    <div style={{ borderTop: '1px solid #FDE8E1', padding: '20px' }}>
                      <SectionForm
                        section={section}
                        onSave={updated => updateSection(idx, updated)}
                        onCancel={() => setEditingSection(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add section picker */}
          {addingSection && (
            <div style={{ marginTop: '12px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F1923' }}>Velg seksjonstype</h3>
                <button onClick={() => setAddingSection(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                {(Object.keys(SECTION_LABELS) as Section['type'][]).map(type => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {SECTION_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: settings panel */}
        <SettingsPanel campaign={campaign} events={events} onSave={save} isSent={isSent} />
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#0F1923' }}>Forhåndsvisning — {campaign.subject}</p>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <iframe
              src={`/api/admin/newsletter/campaigns/${campaignId}/preview`}
              style={{ flex: 1, border: 0, width: '100%', minHeight: '600px' }}
              title="E-post forhåndsvisning"
            />
          </div>
        </div>
      )}

      {/* Send confirm modal */}
      {sendConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <p style={{ margin: '0 0 8px', fontSize: '20px' }}>📤</p>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0F1923' }}>Send kampanje nå?</h3>
            <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
              Kampanjen <strong>{campaign.name}</strong> vil sendes til alle aktive abonnenter umiddelbart. Dette kan ikke angres.
            </p>
            {sendError && (
              <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <p style={{ margin: 0, color: '#B91C1C', fontSize: '13px' }}>{sendError}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setSendConfirm(false); setSendError('') }}
                disabled={sending}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Avbryt
              </button>
              <button
                onClick={sendNow}
                disabled={sending}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#E5623E', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1 }}
              >
                {sending ? 'Sender…' : 'Send nå'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings panel ────────────────────────────────────────────────────────────

function SettingsPanel({
  campaign,
  events,
  onSave,
  isSent,
}: {
  campaign: NewsletterCampaign
  events: NewsletterEvent[]
  onSave: (patch: Partial<NewsletterCampaign>) => void
  isSent: boolean
}) {
  const [name,        setName]        = useState(campaign.name)
  const [subject,     setSubject]     = useState(campaign.subject)
  const [scheduledAt, setScheduledAt] = useState(campaign.scheduledAt ? campaign.scheduledAt.slice(0, 16) : '')
  const [status,      setStatus]      = useState(campaign.status)
  const [primaryColor, setPrimaryColor] = useState(campaign.theme?.primaryColor ?? '#E5623E')
  const [headerLabel,  setHeaderLabel]  = useState(campaign.theme?.headerLabel ?? '')
  const [eventId,      setEventId]      = useState(campaign.eventId ?? '')

  const handleSave = () => {
    const scheduledAtValue = scheduledAt ? new Date(scheduledAt).toISOString() : null
    onSave({
      name,
      subject,
      status: scheduledAt && status === 'draft' ? 'scheduled' : status,
      scheduledAt: scheduledAtValue ?? undefined,
      theme: {
        primaryColor,
        headerLabel: headerLabel || undefined,
      },
      eventId: eventId || undefined,
    })
  }

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', position: 'sticky', top: '76px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F1923' }}>⚙️ Innstillinger</h3>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <SettingField label="Internt navn">
          <input value={name} onChange={e => setName(e.target.value)} disabled={isSent} style={settingInputStyle(isSent)} />
        </SettingField>

        <SettingField label="E-post emne">
          <input value={subject} onChange={e => setSubject(e.target.value)} disabled={isSent} style={settingInputStyle(isSent)} />
        </SettingField>

        {events.length > 0 && (
          <SettingField label="Koblet event">
            <select value={eventId} onChange={e => setEventId(e.target.value)} disabled={isSent} style={settingInputStyle(isSent)}>
              <option value="">— Ikke koblet —</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </SettingField>
        )}

        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tema</p>

          <SettingField label="Primærfarge (CTA-knapper)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} disabled={isSent}
                style={{ width: '40px', height: '36px', borderRadius: '6px', border: '1px solid #E5E7EB', padding: '2px', cursor: isSent ? 'not-allowed' : 'pointer' }} />
              <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} disabled={isSent}
                style={{ ...settingInputStyle(isSent), flex: 1 }} />
            </div>
          </SettingField>

          <SettingField label="Header-etikett (valgfritt)">
            <input
              value={headerLabel}
              onChange={e => setHeaderLabel(e.target.value)}
              placeholder={`Uke ${new Date().getMonth() + 1} · ${new Date().getFullYear()}`}
              disabled={isSent}
              style={settingInputStyle(isSent)}
            />
          </SettingField>
        </div>

        {!isSent && (
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Planlegging</p>

            <SettingField label="Planlegg utsendelse">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => {
                  setScheduledAt(e.target.value)
                  if (e.target.value) setStatus('scheduled')
                  else setStatus('draft')
                }}
                style={settingInputStyle(false)}
              />
            </SettingField>
            {scheduledAt && (
              <p style={{ margin: '4px 0 0', color: '#1D4ED8', fontSize: '12px' }}>
                📅 Planlagt {new Date(scheduledAt).toLocaleString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {!scheduledAt && status === 'scheduled' && (
              <button
                onClick={() => { setScheduledAt(''); setStatus('draft'); onSave({ status: 'draft', scheduledAt: undefined }) }}
                style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C', fontSize: '12px', cursor: 'pointer' }}
              >
                Fjern planlegging
              </button>
            )}
          </div>
        )}

        {!isSent && (
          <button
            onClick={handleSave}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: '#0F1923', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
          >
            Lagre innstillinger
          </button>
        )}

        {isSent && campaign.sentAt && (
          <div style={{ backgroundColor: '#F0FDF4', borderRadius: '8px', padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#15803D', fontSize: '13px' }}>✅ Kampanje sendt</p>
            <p style={{ margin: '0 0 2px', color: '#166534', fontSize: '12px' }}>
              {new Date(campaign.sentAt).toLocaleString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            {campaign.recipientCount && (
              <p style={{ margin: 0, color: '#166534', fontSize: '12px' }}>
                {campaign.recipientCount.toLocaleString('nb-NO')} abonnenter
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Small utilities ──────────────────────────────────────────────────────────

function SettingField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  )
}

function IconBtn({ onClick, disabled, danger, title, children }: {
  onClick: () => void; disabled?: boolean; danger?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: '28px', height: '28px', borderRadius: '6px',
        border: '1px solid',
        borderColor: danger ? '#FCA5A5' : '#E5E7EB',
        backgroundColor: danger ? '#FEF2F2' : '#F9FAFB',
        color: danger ? '#B91C1C' : '#6B7280',
        fontSize: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function settingInputStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #E5E7EB', fontSize: '13px', backgroundColor: disabled ? '#F9FAFB' : '#fff',
    color: disabled ? '#9CA3AF' : '#111827', boxSizing: 'border-box', outline: 'none',
    cursor: disabled ? 'not-allowed' : 'auto',
  }
}

function getSectionPreview(section: Section): string {
  switch (section.type) {
    case 'hero':            return `${section.destinationName}, ${section.countryName}`
    case 'event_banner':    return section.eventName
    case 'hotel_grid':      return section.hotels.length > 0 ? section.hotels.map(h => h.name).join(', ') : 'Ingen hoteller lagt til'
    case 'offer_highlight': return section.title
    case 'trending_dests':  return section.destinations ? section.destinations.map(d => d.city).join(', ') : 'Automatisk valgte destinasjoner'
    case 'travel_tip':      return section.headline
    case 'cta_block':       return section.title
    case 'social_proof':    return '2M+ hoteller · 190+ land · 24/7 support'
  }
}
