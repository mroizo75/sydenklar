// ─── Section types ────────────────────────────────────────────────────────────

export interface HeroSection {
  type: 'hero'
  destinationName: string
  countryName: string
  hotelCount?: number
  imageUrl?: string
  ctaUrl?: string
  ctaText?: string
}

export interface EventBannerSection {
  type: 'event_banner'
  eventName: string
  tagline: string
  heroImageUrl: string
  themeColor: string
  ctaUrl?: string
  ctaText?: string
}

export interface HotelGridSection {
  type: 'hotel_grid'
  title?: string
  subtitle?: string
  hotels: {
    name: string
    city: string
    country: string
    starRating: number
    imageUrl?: string
    pageUrl: string
  }[]
}

export interface OfferHighlightSection {
  type: 'offer_highlight'
  title: string
  description: string
  price?: string
  originalPrice?: string
  imageUrl?: string
  ctaUrl: string
  ctaText: string
  badgeText?: string
}

export interface TrendingDestsSection {
  type: 'trending_dests'
  title?: string
  destinations?: {
    city: string
    country: string
    imageUrl: string
    tagline: string
    pageUrl: string
  }[]
}

export interface TravelTipSection {
  type: 'travel_tip'
  headline: string
  body: string
}

export interface CtaBlockSection {
  type: 'cta_block'
  title: string
  description: string
  ctaUrl: string
  ctaText: string
  note?: string
}

export interface SocialProofSection {
  type: 'social_proof'
}

export type Section =
  | HeroSection
  | EventBannerSection
  | HotelGridSection
  | OfferHighlightSection
  | TrendingDestsSection
  | TravelTipSection
  | CtaBlockSection
  | SocialProofSection

export const SECTION_LABELS: Record<Section['type'], string> = {
  hero:             '✈️ Destinasjonshero',
  event_banner:     '🎉 Event-banner',
  hotel_grid:       '🏨 Hotellgitter',
  offer_highlight:  '🔥 Tilbuds-highlight',
  trending_dests:   '🌍 Trending destinasjoner',
  travel_tip:       '💡 Reisetips',
  cta_block:        '📣 CTA-blokk',
  social_proof:     '📊 Social proof',
}

// ─── Campaign theme ────────────────────────────────────────────────────────────

export interface CampaignTheme {
  primaryColor?: string
  accentColor?: string
  headerLabel?: string
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export type CampaignType   = 'weekly' | 'event'
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled'

export interface NewsletterCampaign {
  id: string
  type: CampaignType
  name: string
  subject: string
  status: CampaignStatus
  sections: Section[]
  theme?: CampaignTheme
  eventId?: string
  scheduledAt?: string
  sentAt?: string
  recipientCount?: number
  createdAt: string
  updatedAt: string
}

// ─── Event ────────────────────────────────────────────────────────────────────

export interface NewsletterEvent {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  heroImageUrl?: string
  themeColor: string
  tagline?: string
  active: boolean
  createdAt: string
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateCampaignPayload {
  type: CampaignType
  name: string
  subject: string
  sections?: Section[]
  theme?: CampaignTheme
  eventId?: string
  scheduledAt?: string
}

export interface UpdateCampaignPayload {
  name?: string
  subject?: string
  status?: CampaignStatus
  sections?: Section[]
  theme?: CampaignTheme
  eventId?: string
  scheduledAt?: string | null
}

export interface CreateEventPayload {
  name: string
  slug: string
  startDate: string
  endDate: string
  heroImageUrl?: string
  themeColor?: string
  tagline?: string
  active?: boolean
}

export interface UpdateEventPayload {
  name?: string
  slug?: string
  startDate?: string
  endDate?: string
  heroImageUrl?: string
  themeColor?: string
  tagline?: string
  active?: boolean
}
