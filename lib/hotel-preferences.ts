export const HOTEL_FACILITIES = [
  { id: 'basseng', label: 'Basseng' },
  { id: 'frokost', label: 'Frokost' },
  { id: 'strand', label: 'Strand' },
  { id: 'parkering', label: 'Parkering' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'spa', label: 'Spa' },
  { id: 'familie', label: 'Familievennlig' },
  { id: 'klima', label: 'Aircondition' },
] as const

export type FacilityId = (typeof HOTEL_FACILITIES)[number]['id']

const FACILITY_IDS = new Set<string>(HOTEL_FACILITIES.map(item => item.id))

export function isFacilityId(value: string): value is FacilityId {
  return FACILITY_IDS.has(value)
}

export function facilityLabel(id: string): string {
  return HOTEL_FACILITIES.find(item => item.id === id)?.label ?? id
}

export function amenityText(groups: Array<{ amenities?: string[] }> | undefined): string {
  if (!groups) return ''
  return groups.map(group => (group.amenities ?? []).join(' ')).join(' ')
}

export function matchesFacility(text: string, id: FacilityId): boolean {
  if (id === 'basseng') return /swimming pool|outdoor pool|indoor pool/i.test(text)
  if (id === 'frokost') return /breakfast/i.test(text)
  if (id === 'strand') return /beach/i.test(text)
  if (id === 'parkering') return /parking/i.test(text) && !/no parking/i.test(text)
  if (id === 'wifi') return /wi-fi|wifi/i.test(text)
  if (id === 'spa') return /\bspa\b/i.test(text)
  if (id === 'familie') return /family|kids club|children swimming/i.test(text)
  return /air conditioning/i.test(text)
}

export function hotelFitsPreferences(
  starRating: number | undefined,
  groups: Array<{ amenities?: string[] }> | undefined,
  starsMin: number,
  facilities: FacilityId[],
): boolean {
  if (starsMin > 0 && (starRating ?? 0) < starsMin) return false
  if (facilities.length === 0) return true
  const text = amenityText(groups)
  return facilities.every(id => matchesFacility(text, id))
}
