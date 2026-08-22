import { NextRequest, NextResponse } from "next/server"
import { requireAdminUser } from "@/lib/admin-auth"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  await requireAdminUser()

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get("days") ?? "7", 10)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const startDate = from ?? new Date(Date.now() - days * 86_400_000).toISOString()
  const endDate = to ?? new Date().toISOString()

  const [funnelRes, dailyRes, topDestRes, deviceRes, dropoffRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("event_type")
      .gte("created_at", startDate)
      .lte("created_at", endDate),

    supabase.rpc("analytics_daily_counts", { start_date: startDate, end_date: endDate }).select(),

    supabase
      .from("analytics_events")
      .select("metadata")
      .in("event_type", ["search", "purchase"])
      .gte("created_at", startDate)
      .lte("created_at", endDate),

    supabase
      .from("analytics_events")
      .select("device_type")
      .gte("created_at", startDate)
      .lte("created_at", endDate),

    supabase.rpc("analytics_dropoff_sessions", { start_date: startDate, end_date: endDate }).select(),
  ])

  const funnelCounts: Record<string, number> = {}
  if (funnelRes.data) {
    for (const row of funnelRes.data) {
      funnelCounts[row.event_type] = (funnelCounts[row.event_type] ?? 0) + 1
    }
  }

  const funnel = [
    { step: "pageview", count: funnelCounts["pageview"] ?? 0 },
    { step: "search", count: funnelCounts["search"] ?? 0 },
    { step: "hotel_click", count: funnelCounts["hotel_click"] ?? 0 },
    { step: "prebook", count: funnelCounts["prebook"] ?? 0 },
    { step: "payment", count: funnelCounts["payment"] ?? 0 },
    { step: "purchase", count: funnelCounts["purchase"] ?? 0 },
  ]

  const destinations: Record<string, { searches: number; purchases: number }> = {}
  if (topDestRes.data) {
    for (const row of topDestRes.data) {
      const dest = (row.metadata as Record<string, unknown>)?.destination as string | undefined
      if (!dest) continue
      if (!destinations[dest]) destinations[dest] = { searches: 0, purchases: 0 }
      destinations[dest].searches++
    }
  }
  const topDestinations = Object.entries(destinations)
    .sort((a, b) => b[1].searches - a[1].searches)
    .slice(0, 10)
    .map(([name, data]) => ({ name, ...data }))

  const deviceCounts: Record<string, number> = {}
  if (deviceRes.data) {
    for (const row of deviceRes.data) {
      const d = row.device_type ?? "unknown"
      deviceCounts[d] = (deviceCounts[d] ?? 0) + 1
    }
  }

  return NextResponse.json({
    period: { from: startDate, to: endDate },
    funnel,
    daily: dailyRes.data ?? [],
    topDestinations,
    devices: deviceCounts,
    dropoff: dropoffRes.data ?? [],
  })
}
