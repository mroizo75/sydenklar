export interface RoomConfig {
  adults: number
  childAges: number[]
}

export interface RateHawkHotelSearchParams {
  destination: string
  destinationType?: string
  checkIn: string
  checkOut: string
  adults: number
  children?: number[]
  rooms?: number
  roomConfigs?: RoomConfig[]
  currency?: string
  residency?: string
  offset?: number
  batchSize?: number
}

export interface RateHawkHotel {
  id: string
  hid?: number
  name: string
  address: string
  rating: number
  price: {
    amount: number
    currency: string
    perNight: boolean
    totalPrice?: number
    nights?: number
  }
  image: string
  images?: string[]
  amenities: string[]
  distance: string
}

export interface RateHawkHotelSearchResponse {
  success: boolean
  hotels: RateHawkHotel[]
  searchId: string
  totalResults: number
  hasMore?: boolean
  error?: string
  technicalError?: string
}

export interface RateHawkDestination {
  id: string
  name: string
  type: 'city' | 'hotel' | 'landmark' | string
  country?: string
}

export interface HotelReview {
  author: string
  date: string
  rating: number
  title?: string
  text: string
  pros?: string
  cons?: string
}

export interface HotelAmenityGroup {
  group_name: string
  amenities: HotelAmenity[]
}

export interface HotelAmenity {
  name: string
  amenity_name?: string
  icon?: string
}
