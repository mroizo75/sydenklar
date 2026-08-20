declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

type MetaEventName = "Search" | "ViewContent" | "InitiateCheckout" | "Purchase" | "AddToCart"

interface SearchParams {
  search_string: string
  content_category?: string
  checkin_date?: string
  checkout_date?: string
  num_adults?: number
}

interface ViewContentParams {
  content_name: string
  content_ids?: string[]
  content_type?: string
  value?: number
  currency?: string
}

interface CheckoutParams {
  content_name: string
  content_ids?: string[]
  value: number
  currency: string
  num_items?: number
}

interface PurchaseParams {
  content_name: string
  content_ids?: string[]
  value: number
  currency: string
  num_items?: number
}

type EventParams = SearchParams | ViewContentParams | CheckoutParams | PurchaseParams

function track(event: MetaEventName, params?: EventParams) {
  if (typeof window === "undefined" || !window.fbq) return
  if (params) {
    window.fbq("track", event, params)
  } else {
    window.fbq("track", event)
  }
}

export function trackSearch(params: SearchParams) {
  track("Search", params)
}

export function trackViewContent(params: ViewContentParams) {
  track("ViewContent", params)
}

export function trackInitiateCheckout(params: CheckoutParams) {
  track("InitiateCheckout", params)
}

export function trackPurchase(params: PurchaseParams) {
  track("Purchase", params)
}
