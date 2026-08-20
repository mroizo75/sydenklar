import { createHash, randomUUID } from "crypto"

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN
const API_VERSION = "v20.0"

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

interface UserData {
  email?: string
  ip?: string
  userAgent?: string
  fbc?: string
  fbp?: string
}

interface CustomData {
  content_name?: string
  content_ids?: string[]
  content_type?: string
  value?: number
  currency?: string
  search_string?: string
  checkin_date?: string
  checkout_date?: string
  num_items?: number
}

type EventName = "Search" | "ViewContent" | "InitiateCheckout" | "Purchase" | "PageView"

export async function sendServerEvent(
  eventName: EventName,
  sourceUrl: string,
  userData: UserData,
  customData?: CustomData,
) {
  if (!PIXEL_ID || !ACCESS_TOKEN) return

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: randomUUID(),
    event_source_url: sourceUrl,
    action_source: "website",
    user_data: {
      ...(userData.email ? { em: [sha256(userData.email)] } : {}),
      ...(userData.ip ? { client_ip_address: userData.ip } : {}),
      ...(userData.userAgent ? { client_user_agent: userData.userAgent } : {}),
      ...(userData.fbc ? { fbc: userData.fbc } : {}),
      ...(userData.fbp ? { fbp: userData.fbp } : {}),
    },
  }

  if (customData) {
    event.custom_data = customData
  }

  try {
    await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      },
    )
  } catch {
    // Non-blocking — aldri la piksel-feil påvirke brukeropplevelsen
  }
}

export function extractUserData(request: Request, email?: string): UserData {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  const userAgent = request.headers.get("user-agent") || undefined
  const cookies = request.headers.get("cookie") || ""
  const fbc = cookies.match(/_fbc=([^;]+)/)?.[1]
  const fbp = cookies.match(/_fbp=([^;]+)/)?.[1]

  return { email, ip, userAgent, fbc, fbp }
}
