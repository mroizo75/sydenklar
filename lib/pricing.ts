export const BOOKING_FEE_PERCENT = 7
export const BOOKING_FEE_MULTIPLIER = 1 + BOOKING_FEE_PERCENT / 100

/** Nettopris → kundepris (inkl. bestillingsgebyr) */
export function applyMarkup(netAmount: number): number {
  return Math.round(netAmount * BOOKING_FEE_MULTIPLIER)
}

/** Kundepris → nettopris */
export function removeMarkup(grossAmount: number): number {
  return Math.round(grossAmount / BOOKING_FEE_MULTIPLIER)
}

/** Beregn bestillingsgebyret isolert */
export function bookingFeeAmount(netAmount: number): number {
  return applyMarkup(netAmount) - netAmount
}
