"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { trackEvent } from "@/lib/analytics"

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const prevPathRef = useRef<string>("")
  const sessionStartRef = useRef<number>(Date.now())

  useEffect(() => {
    if (pathname === prevPathRef.current) return
    prevPathRef.current = pathname

    trackEvent({ type: "pageview", pagePath: pathname })
  }, [pathname])

  useEffect(() => {
    sessionStartRef.current = Date.now()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeOnPage = Math.round((Date.now() - sessionStartRef.current) / 1000)
        trackEvent({
          type: "bounce",
          metadata: { timeOnPageSeconds: timeOnPage, lastPath: window.location.pathname },
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  return null
}
