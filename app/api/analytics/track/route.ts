import { NextRequest, NextResponse } from "next/server"
import { insertAnalyticsEvent, type AnalyticsEventType } from "@/lib/analytics-server"

const VALID_TYPES: AnalyticsEventType[] = [
  "pageview", "search", "hotel_click", "prebook", "payment", "purchase", "bounce",
]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { sessionId, type, pagePath, referrer, metadata } = body as Record<string, unknown>

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "missing_session_id" }, { status: 400 })
  }

  if (!type || !VALID_TYPES.includes(type as AnalyticsEventType)) {
    return NextResponse.json({ error: "invalid_event_type" }, { status: 400 })
  }

  const userAgent = request.headers.get("user-agent") ?? ""

  await insertAnalyticsEvent({
    sessionId,
    type: type as AnalyticsEventType,
    pagePath: typeof pagePath === "string" ? pagePath : undefined,
    referrer: typeof referrer === "string" ? referrer : null,
    metadata: (metadata && typeof metadata === "object") ? metadata as Record<string, unknown> : {},
    userAgent,
  })

  return NextResponse.json({ ok: true })
}
