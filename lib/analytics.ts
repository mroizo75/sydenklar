"use client"

export type AnalyticsEventType =
  | "pageview"
  | "search"
  | "hotel_click"
  | "prebook"
  | "payment"
  | "purchase"
  | "bounce"

interface TrackEventOptions {
  type: AnalyticsEventType
  metadata?: Record<string, unknown>
  pagePath?: string
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  const key = "sk_session_id"
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

export function trackEvent({ type, metadata, pagePath }: TrackEventOptions): void {
  if (typeof window === "undefined") return

  const payload = {
    sessionId: getSessionId(),
    type,
    pagePath: pagePath ?? window.location.pathname,
    referrer: document.referrer || null,
    metadata: metadata ?? {},
  }

  if (type === "bounce") {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
    navigator.sendBeacon("/api/analytics/track", blob)
    return
  }

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

export function trackSearch(destination: string, metadata?: Record<string, unknown>): void {
  trackEvent({ type: "search", metadata: { destination, ...metadata } })
}

export function trackHotelClick(hotelId: string, hotelName: string, metadata?: Record<string, unknown>): void {
  trackEvent({ type: "hotel_click", metadata: { hotelId, hotelName, ...metadata } })
}

export function trackPrebook(hotelId: string, metadata?: Record<string, unknown>): void {
  trackEvent({ type: "prebook", metadata: { hotelId, ...metadata } })
}

export function trackPayment(orderId: string, metadata?: Record<string, unknown>): void {
  trackEvent({ type: "payment", metadata: { orderId, ...metadata } })
}
