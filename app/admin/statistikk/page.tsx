"use client"

import { useState, useEffect, useCallback } from "react"

interface FunnelStep {
  step: string
  count: number
}

interface DailyCount {
  day: string
  event_type: string
  count: number
}

interface TopDestination {
  name: string
  searches: number
  purchases: number
}

interface DropoffEntry {
  last_event: string
  session_count: number
}

interface StatsData {
  period: { from: string; to: string }
  funnel: FunnelStep[]
  daily: DailyCount[]
  topDestinations: TopDestination[]
  devices: Record<string, number>
  dropoff: DropoffEntry[]
}

const STEP_LABELS: Record<string, string> = {
  pageview: "Sidevisning",
  search: "Søk",
  hotel_click: "Klikk på hotell",
  prebook: "Starter bestilling",
  payment: "Betaling",
  purchase: "Fullført kjøp",
}

const PERIOD_OPTIONS = [
  { label: "7 dager", value: 7 },
  { label: "14 dager", value: 14 },
  { label: "30 dager", value: 30 },
  { label: "90 dager", value: 90 },
]

export default function StatistikkPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchStats = useCallback(async (d: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?days=${d}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats(days)
  }, [days, fetchStats])

  if (loading && !data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        <p style={{ marginTop: 16, color: "#6B7280", fontSize: 14 }}>Laster statistikk...</p>
      </div>
    )
  }

  if (!data) return <p style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Ingen data tilgjengelig.</p>

  const maxFunnel = Math.max(...data.funnel.map(f => f.count), 1)
  const totalDevices = Object.values(data.devices).reduce((s, v) => s + v, 0) || 1

  const dailyPageviews = data.daily.filter(d => d.event_type === "pageview")
  const maxDaily = Math.max(...dailyPageviews.map(d => d.count), 1)

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F1923", margin: 0 }}>Trafikkstatistikk</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: days === opt.value ? 600 : 400,
                borderRadius: 8,
                border: "1px solid",
                borderColor: days === opt.value ? "#C9A84C" : "#E5E7EB",
                backgroundColor: days === opt.value ? "#FDF8E8" : "#fff",
                color: days === opt.value ? "#92700C" : "#374151",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F1923", margin: "0 0 20px" }}>Konverteringstrakt</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.funnel.map((step, i) => {
            const prevCount = i > 0 ? data.funnel[i - 1].count : step.count
            const rate = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : "—"
            return (
              <div key={step.step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 140, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                  {STEP_LABELS[step.step] ?? step.step}
                </div>
                <div style={{ flex: 1, height: 28, backgroundColor: "#F3F4F6", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(step.count / maxFunnel) * 100}%`,
                      backgroundColor: i === data.funnel.length - 1 ? "#10B981" : "#C9A84C",
                      borderRadius: 6,
                      transition: "width 0.4s ease",
                      minWidth: step.count > 0 ? 4 : 0,
                    }}
                  />
                </div>
                <div style={{ width: 60, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#0F1923" }}>
                  {step.count}
                </div>
                <div style={{ width: 60, textAlign: "right", fontSize: 12, color: i === 0 ? "transparent" : "#6B7280" }}>
                  {i === 0 ? "" : `${rate}%`}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Drop-off */}
        <section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F1923", margin: "0 0 16px" }}>Drop-off (siste steg per sesjon)</h2>
          {data.dropoff.length === 0 ? (
            <p style={{ color: "#6B7280", fontSize: 13 }}>Ingen data ennå</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#6B7280" }}>Siste steg</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#6B7280" }}>Sesjoner</th>
                </tr>
              </thead>
              <tbody>
                {data.dropoff.map(d => (
                  <tr key={d.last_event} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "8px 0", color: "#374151" }}>{STEP_LABELS[d.last_event] ?? d.last_event}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: "#0F1923" }}>{d.session_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Enheter */}
        <section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F1923", margin: "0 0 16px" }}>Enheter</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.devices).sort((a, b) => b[1] - a[1]).map(([device, count]) => (
              <div key={device} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 80, fontSize: 13, color: "#374151", textTransform: "capitalize" }}>{device}</div>
                <div style={{ flex: 1, height: 20, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / totalDevices) * 100}%`, backgroundColor: "#6366F1", borderRadius: 4 }} />
                </div>
                <div style={{ width: 80, textAlign: "right", fontSize: 13, color: "#0F1923" }}>
                  {count} ({((count / totalDevices) * 100).toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Topp-destinasjoner */}
      <section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F1923", margin: "0 0 16px" }}>Topp destinasjoner</h2>
        {data.topDestinations.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: 13 }}>Ingen søk registrert ennå</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#6B7280" }}>Destinasjon</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#6B7280" }}>Søk</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#6B7280" }}>Kjøp</th>
              </tr>
            </thead>
            <tbody>
              {data.topDestinations.map(d => (
                <tr key={d.name} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "8px 0", color: "#374151", fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: "#0F1923" }}>{d.searches}</td>
                  <td style={{ padding: "8px 0", textAlign: "right", color: "#10B981", fontWeight: 600 }}>{d.purchases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Daglig trafikk */}
      <section style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, border: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F1923", margin: "0 0 16px" }}>Daglig trafikk (sidevisninger)</h2>
        {dailyPageviews.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: 13 }}>Ingen data ennå</p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160 }}>
            {dailyPageviews.map(d => (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "#6B7280" }}>{d.count}</span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 32,
                    height: `${(d.count / maxDaily) * 120}px`,
                    backgroundColor: "#C9A84C",
                    borderRadius: 4,
                    minHeight: d.count > 0 ? 4 : 0,
                  }}
                />
                <span style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                  {new Date(d.day).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
