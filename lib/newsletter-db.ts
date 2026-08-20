import { supabase } from './supabase'
import type {
  NewsletterCampaign,
  NewsletterEvent,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CreateEventPayload,
  UpdateEventPayload,
  Section,
  CampaignTheme,
} from './newsletter-types'

// ─── Row mappers ───────────────────────────────────────────────────────────────

function mapCampaign(row: Record<string, unknown>): NewsletterCampaign {
  return {
    id:             row.id as string,
    type:           row.type as NewsletterCampaign['type'],
    name:           row.name as string,
    subject:        row.subject as string,
    status:         row.status as NewsletterCampaign['status'],
    sections:       (row.sections as Section[]) ?? [],
    theme:          row.theme as CampaignTheme | undefined,
    eventId:        row.event_id as string | undefined,
    scheduledAt:    row.scheduled_at as string | undefined,
    sentAt:         row.sent_at as string | undefined,
    recipientCount: row.recipient_count as number | undefined,
    createdAt:      row.created_at as string,
    updatedAt:      row.updated_at as string,
  }
}

function mapEvent(row: Record<string, unknown>): NewsletterEvent {
  return {
    id:           row.id as string,
    name:         row.name as string,
    slug:         row.slug as string,
    startDate:    row.start_date as string,
    endDate:      row.end_date as string,
    heroImageUrl: row.hero_image_url as string | undefined,
    themeColor:   row.theme_color as string,
    tagline:      row.tagline as string | undefined,
    active:       row.active as boolean,
    createdAt:    row.created_at as string,
  }
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return (data ?? []).map(mapCampaign)
}

export async function getCampaign(id: string): Promise<NewsletterCampaign | null> {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw { code: 'DB_ERROR', message: error.message }
  return data ? mapCampaign(data) : null
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<NewsletterCampaign> {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .insert({
      type:         payload.type,
      name:         payload.name,
      subject:      payload.subject,
      sections:     payload.sections ?? [],
      theme:        payload.theme ?? null,
      event_id:     payload.eventId ?? null,
      scheduled_at: payload.scheduledAt ?? null,
      status:       'draft',
    })
    .select()
    .single()

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return mapCampaign(data)
}

export async function updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<NewsletterCampaign> {
  const patch: Record<string, unknown> = {}
  if (payload.name      !== undefined) patch.name         = payload.name
  if (payload.subject   !== undefined) patch.subject      = payload.subject
  if (payload.status    !== undefined) patch.status       = payload.status
  if (payload.sections  !== undefined) patch.sections     = payload.sections
  if (payload.theme     !== undefined) patch.theme        = payload.theme
  if (payload.eventId   !== undefined) patch.event_id     = payload.eventId
  if ('scheduledAt' in payload)        patch.scheduled_at = payload.scheduledAt ?? null

  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return mapCampaign(data)
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('newsletter_campaigns')
    .delete()
    .eq('id', id)

  if (error) throw { code: 'DB_ERROR', message: error.message }
}

export async function markCampaignSent(id: string, recipientCount: number): Promise<void> {
  const { error } = await supabase
    .from('newsletter_campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString(), recipient_count: recipientCount })
    .eq('id', id)

  if (error) throw { code: 'DB_ERROR', message: error.message }
}

export async function getDueCampaigns(): Promise<NewsletterCampaign[]> {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return (data ?? []).map(mapCampaign)
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function listEvents(): Promise<NewsletterEvent[]> {
  const { data, error } = await supabase
    .from('newsletter_events')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return (data ?? []).map(mapEvent)
}

export async function getActiveEvents(): Promise<NewsletterEvent[]> {
  const { data, error } = await supabase
    .from('newsletter_events')
    .select('*')
    .eq('active', true)
    .order('start_date', { ascending: true })

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return (data ?? []).map(mapEvent)
}

export async function getEvent(id: string): Promise<NewsletterEvent | null> {
  const { data, error } = await supabase
    .from('newsletter_events')
    .select('*')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw { code: 'DB_ERROR', message: error.message }
  return data ? mapEvent(data) : null
}

export async function createEvent(payload: CreateEventPayload): Promise<NewsletterEvent> {
  const { data, error } = await supabase
    .from('newsletter_events')
    .insert({
      name:           payload.name,
      slug:           payload.slug,
      start_date:     payload.startDate,
      end_date:       payload.endDate,
      hero_image_url: payload.heroImageUrl ?? null,
      theme_color:    payload.themeColor ?? '#E5623E',
      tagline:        payload.tagline ?? null,
      active:         payload.active ?? false,
    })
    .select()
    .single()

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return mapEvent(data)
}

export async function updateEvent(id: string, payload: UpdateEventPayload): Promise<NewsletterEvent> {
  const patch: Record<string, unknown> = {}
  if (payload.name         !== undefined) patch.name           = payload.name
  if (payload.slug         !== undefined) patch.slug           = payload.slug
  if (payload.startDate    !== undefined) patch.start_date     = payload.startDate
  if (payload.endDate      !== undefined) patch.end_date       = payload.endDate
  if (payload.heroImageUrl !== undefined) patch.hero_image_url = payload.heroImageUrl
  if (payload.themeColor   !== undefined) patch.theme_color    = payload.themeColor
  if (payload.tagline      !== undefined) patch.tagline        = payload.tagline
  if (payload.active       !== undefined) patch.active         = payload.active

  const { data, error } = await supabase
    .from('newsletter_events')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return mapEvent(data)
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('newsletter_events')
    .delete()
    .eq('id', id)

  if (error) throw { code: 'DB_ERROR', message: error.message }
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export async function getActiveSubscribers(): Promise<{ email: string; firstName?: string; unsubscribeToken: string }[]> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, first_name, unsubscribe_token')
    .is('unsubscribed_at', null)

  if (error) throw { code: 'DB_ERROR', message: error.message }
  return (data ?? []).map(row => ({
    email:            row.email as string,
    firstName:        row.first_name as string | undefined,
    unsubscribeToken: row.unsubscribe_token as string,
  }))
}
