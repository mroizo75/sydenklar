"use client"

import { useEffect, useRef } from "react"
import { trackPurchase } from "@/lib/meta-pixel"

interface Props {
  value: number
  currency: string
  contentName: string
  contentId: string
}

export default function PurchasePixel({ value, currency, contentName, contentId }: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackPurchase({
      content_name: contentName,
      content_ids: [contentId],
      value,
      currency,
      num_items: 1,
    })
  }, [value, currency, contentName, contentId])

  return null
}
