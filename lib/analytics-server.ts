import { supabase } from "@/lib/supabase"

export type AnalyticsEventType =
  | "pageview"
  | "search"
  | "hotel_click"
  | "prebook"
  | "payment"
  | "purchase"
  | "bounce"

interface InsertEventParams {
  sessionId: string
  type: AnalyticsEventType
  pagePath?: string
  referrer?: string | null
  metadata?: Record<string, unknown>
  userAgent?: string
  deviceType?: string
}

function detectDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile"
  if (/tablet|ipad/i.test(ua)) return "tablet"
  return "desktop"
}

export async function insertAnalyticsEvent(params: InsertEventParams): Promise<void> {
  const deviceType = params.deviceType ?? (params.userAgent ? detectDeviceType(params.userAgent) : "unknown")

  await supabase.from("analytics_events").insert({
    session_id: params.sessionId,
    event_type: params.type,
    page_path: params.pagePath ?? null,
    referrer: params.referrer ?? null,
    metadata: params.metadata ?? {},
    user_agent: params.userAgent ?? null,
    device_type: deviceType,
  })
}

export async function insertServerEvent(
  type: AnalyticsEventType,
  metadata: Record<string, unknown>,
  sessionId?: string
): Promise<void> {
  await supabase.from("analytics_events").insert({
    session_id: sessionId ?? `server-${crypto.randomUUID()}`,
    event_type: type,
    page_path: null,
    referrer: null,
    metadata,
    user_agent: "server",
    device_type: "server",
  })
}
