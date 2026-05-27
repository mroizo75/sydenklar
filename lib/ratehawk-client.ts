import { RateHawkHotelSearchParams, RateHawkHotelSearchResponse, SearchFilters } from '@/lib/types'
import { BOOKING_FEE_PERCENT } from '@/lib/pricing'
import {
  getHotelById,
  getHotelByHid,
  recordToApiFormat,
  rawApiToRecord,
  upsertHotelBatch,
} from '@/lib/hotel-static-db'

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker))
  return results
}

interface SerpCacheEntry {
  hotels: any[]
  params: RateHawkHotelSearchParams
  residency: string
  createdAt: number
}

// Fester cachen til globalThis så den overlever HMR (hot module reload) i dev-modus.
// I produksjon er dette ekvivalent med en vanlig modul-scope variabel.
const SERP_CACHE_TTL_MS = 30 * 60 * 1000
const _g = globalThis as typeof globalThis & { __serpCache?: Map<string, SerpCacheEntry> }
if (!_g.__serpCache) _g.__serpCache = new Map<string, SerpCacheEntry>()
const GLOBAL_SERP_CACHE = _g.__serpCache

class RateHawkClient {
  private apiKey: string
  private accessToken: string
  private baseUrl: string
  private hotelDumpCache: Map<string, any> = new Map()
  private dumpLastFetched: number | null = null
  private hotelInfoCache: Map<string, any | null> = new Map()

  constructor() {
    this.apiKey = process.env.RATEHAWK_KEY_ID || ''
    this.accessToken = process.env.RATEHAWK_API_KEY || ''
    this.baseUrl = process.env.RATEHAWK_BASE_URL || 'https://api.worldota.net/api/b2b/v3'

    if (!this.apiKey || !this.accessToken) {
      console.warn('⚠️ RateHawk credentials missing')
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}, method: 'GET' | 'POST' = 'GET') {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)

      let body: string | undefined
      const headers: Record<string, string> = {
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.accessToken}`).toString('base64')}`,
      }

      if (method === 'GET') {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key])
          }
        })
      } else {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(params)
      }

      const response = await fetch(url.toString(), { method, headers, body })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `${response.status} ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.debug?.validation_error) {
            errorMessage = errorData.debug.validation_error
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // use generic message
        }
        const error = new Error(`RateHawk API error: ${errorMessage}`)
        ;(error as any).statusCode = response.status
        throw error
      }

      return await response.json()
    } catch (error) {
      console.error('RateHawk request failed:', endpoint, error instanceof Error ? error.message : error)
      throw error
    }
  }

  private getUserResidency(userCountry?: string | null): string {
    if (!userCountry) return 'no'
    const normalized = userCountry.toLowerCase().trim()
    // Pass through any 2-letter ISO 3166-1 alpha-2 code directly
    if (/^[a-z]{2}$/.test(normalized)) return normalized
    // Full-name fallback map
    const countryMap: Record<string, string> = {
      'norway': 'no', 'norge': 'no',
      'sweden': 'se', 'sverige': 'se',
      'denmark': 'dk', 'danmark': 'dk',
      'finland': 'fi', 'suomi': 'fi',
      'united states': 'us', 'usa': 'us',
      'united kingdom': 'gb', 'uk': 'gb',
      'germany': 'de', 'tyskland': 'de',
      'france': 'fr', 'frankrike': 'fr',
    }
    return countryMap[normalized] || 'no'
  }

  async searchHotels(params: RateHawkHotelSearchParams, userCountry?: string | null): Promise<RateHawkHotelSearchResponse> {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const residency = this.getUserResidency(userCountry)
      const regionId = await this.getRegionId(params.destination, params.destinationType)
      if (!regionId) {
        throw new Error('Could not find region for destination')
      }

      let guests: { adults: number; children: number[] }[]
      if (params.roomConfigs && params.roomConfigs.length > 0) {
        guests = params.roomConfigs.map(room => ({
          adults: room.adults,
          children: room.childAges || []
        }))
      } else {
        guests = [{
          adults: params.adults,
          children: params.children && params.children.length > 0 ? params.children : []
        }]
      }

      let data
      let lastError: any = null

      const isHotelId = params.destinationType === 'hotel' && /^\d+$/.test(regionId)

      const preFilters = this.buildPreFilters(params.filters)

      if (isHotelId) {
        const hotelParams = {
          hids: [parseInt(regionId)],
          checkin: params.checkIn,
          checkout: params.checkOut,
          residency,
          language: 'en',
          guests,
          currency: params.currency || 'NOK',
          ...preFilters,
        }
        try {
          data = await this.makeRequest('/search/serp/hotels/', hotelParams, 'POST')
        } catch (error: any) {
          lastError = error
          throw error
        }
      } else {
        const regionParams = {
          region_id: parseInt(regionId),
          checkin: params.checkIn,
          checkout: params.checkOut,
          residency,
          language: 'en',
          guests,
          currency: params.currency || 'NOK',
          ...preFilters,
        }

        try {
          data = await this.makeRequest('/search/serp/region/', regionParams, 'POST')
        } catch (error: any) {
          lastError = error
          const errorMessage = error.message || ''

          if (errorMessage.includes('invalid region_id') || errorMessage.includes('cannot be searched')) {
            const coords = this.getCoordinatesForDestination(params.destination, regionId)
            const geoParams = {
              latitude: coords.lat,
              longitude: coords.lon,
              radius: 50,
              checkin: params.checkIn,
              checkout: params.checkOut,
              residency,
              language: 'en',
              guests,
              currency: params.currency || 'NOK'
            }
            try {
              data = await this.makeRequest('/search/serp/geo/', { ...geoParams, ...preFilters }, 'POST')
            } catch (geoError: any) {
              lastError = geoError
              throw new Error(
                `Kunne ikke søke etter hoteller i denne destinasjonen. ` +
                `Prøv å søke etter Oslo eller en annen by.`
              )
            }
          } else {
            throw error
          }
        }
      }

      if (!data) {
        throw lastError || new Error('No data returned from search')
      }

      const hotelData = data?.data?.hotels || data?.hotels || []
      const searchId = data?.data?.search_id || `serp_${Date.now()}`

      // Rens gamle SERP-cache-oppføringer (30 min TTL)
      const now = Date.now()
      for (const [key, entry] of GLOBAL_SERP_CACHE.entries()) {
        if (now - entry.createdAt > SERP_CACHE_TTL_MS) GLOBAL_SERP_CACHE.delete(key)
      }
      GLOBAL_SERP_CACHE.set(searchId, {
        hotels: hotelData,
        params,
        residency: this.getUserResidency(params.residency),
        createdAt: now
      })

      const offset = params.offset || 0
      const batchSize = params.batchSize || 15
      const batchData = hotelData.slice(offset, offset + batchSize)
      const hotels: any[] = []

      if (batchData && Array.isArray(batchData) && batchData.length > 0) {
        const hotelTasks = batchData.map((hotel: any) => async () => {
          const checkInDate = new Date(params.checkIn)
          const checkOutDate = new Date(params.checkOut)
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

          let totalPrice = 0
          let currency = 'NOK'

          if (hotel.rates && hotel.rates.length > 0) {
            const sortedRates = hotel.rates.sort((a: any, b: any) => {
              const aPrice = parseFloat(a.payment_options?.payment_types?.[0]?.amount || '999999')
              const bPrice = parseFloat(b.payment_options?.payment_types?.[0]?.amount || '999999')
              return aPrice - bPrice
            })
            const cheapestRate = sortedRates[0]
            totalPrice = parseFloat(cheapestRate.payment_options?.payment_types?.[0]?.amount || '0')
            currency = cheapestRate.payment_options?.payment_types?.[0]?.currency_code || 'NOK'
          }

          const totalPriceWithFee = totalPrice * (1 + BOOKING_FEE_PERCENT / 100)
          const pricePerNight = nights > 0 ? totalPriceWithFee / nights : totalPriceWithFee

          const hotelId = hotel.id || hotel.hid
          let staticInfo: any = null
          if (hotelId) {
            try {
              staticInfo = await this.getHotelStaticInfo(
                hotelId.toString(),
                typeof hotelId === 'number' ? hotelId : undefined
              )
            } catch {
              // Continue without static info
            }
          }

          const hotelName = staticInfo?.name || staticInfo?.hotel_name || hotel.name || hotel.hotel_name
            || (hotelId ? hotelId.toString().replace(/_/g, ' ').split(' ')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : 'Ukjent hotell')

          let hotelAddress = 'Adresse ikke tilgjengelig'
          if (staticInfo) {
            hotelAddress = [
              staticInfo.address,
              staticInfo.city?.name,
              staticInfo.region?.name,
              staticInfo.region?.country_name || staticInfo.country?.name
            ].filter(Boolean).join(', ') || staticInfo.address || 'Adresse ikke tilgjengelig'
          } else {
            hotelAddress = hotel.address || hotel.location?.address || 'Adresse ikke tilgjengelig'
          }

          const NO_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23ddd" width="800" height="450"/%3E%3C/svg%3E'
          let hotelImage = NO_IMAGE

          if (staticInfo?.images && Array.isArray(staticInfo.images) && staticInfo.images.length > 0) {
            const firstImage = staticInfo.images[0]
            if (typeof firstImage === 'string') {
              hotelImage = firstImage.replace('{size}', '1024x768')
            } else if (firstImage?.url) {
              hotelImage = firstImage.url.replace('{size}', '1024x768')
            }
          }

          if (hotelImage === NO_IMAGE) {
            if (hotel.image) {
              hotelImage = typeof hotel.image === 'string' ? hotel.image : hotel.image.url || hotel.image
            } else if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
              const firstImage = hotel.images[0]
              hotelImage = typeof firstImage === 'string' ? firstImage : (firstImage.url || firstImage)
            }
          }

          const starRating = staticInfo?.star_rating || staticInfo?.stars || hotel.star_rating || hotel.stars || 0

          const allAmenities: string[] = []

          if (staticInfo?.amenity_groups && Array.isArray(staticInfo.amenity_groups)) {
            staticInfo.amenity_groups.forEach((group: any) => {
              if (group.amenities && Array.isArray(group.amenities)) {
                group.amenities.forEach((amenity: any) => {
                  const amenityName = typeof amenity === 'string' ? amenity : (amenity.name || amenity.amenity_name)
                  if (amenityName && !allAmenities.includes(this.formatAmenityName(amenityName))) {
                    allAmenities.push(this.formatAmenityName(amenityName))
                  }
                })
              }
            })
          }

          if (hotel.rates && hotel.rates.length > 0) {
            const cheapestRate = hotel.rates[0]
            if (cheapestRate.amenities_data && Array.isArray(cheapestRate.amenities_data)) {
              cheapestRate.amenities_data.forEach((amenity: string) => {
                const formatted = this.formatAmenityName(amenity)
                if (!allAmenities.includes(formatted)) allAmenities.push(formatted)
              })
            }
            if (cheapestRate.meal_data?.has_breakfast) {
              if (!allAmenities.some(a => a.toLowerCase().includes('frokost'))) {
                allAmenities.push('Frokost inkludert')
              }
            }
          }

          let distanceText = 'Se kart'
          if (hotel.distance) {
            const distanceValue = typeof hotel.distance === 'string' ? parseFloat(hotel.distance) : hotel.distance
            if (distanceValue > 0) {
              distanceText = distanceValue < 1
                ? `${Math.round(distanceValue * 1000)}m fra sentrum`
                : `${distanceValue.toFixed(1)}km fra sentrum`
            }
          } else if (staticInfo?.facts?.beach_distance) {
            distanceText = `${staticInfo.facts.beach_distance}m til strand`
          }

          const rawLat = staticInfo?.latitude ?? staticInfo?.location?.latitude ?? staticInfo?.location?.lat ?? staticInfo?.coordinates?.latitude ?? hotel.latitude ?? hotel.location?.latitude ?? hotel.lat
          const rawLng = staticInfo?.longitude ?? staticInfo?.location?.longitude ?? staticInfo?.location?.lon ?? staticInfo?.coordinates?.longitude ?? hotel.longitude ?? hotel.location?.longitude ?? hotel.lng ?? hotel.lon
          const lat = rawLat !== undefined && rawLat !== null ? parseFloat(String(rawLat)) : undefined
          const lng = rawLng !== undefined && rawLng !== null ? parseFloat(String(rawLng)) : undefined

          const cheapestPenalties = hotel.rates?.[0]?.cancellation_penalties
          const freeCancellationBefore: string | null = cheapestPenalties?.free_cancellation_before ?? null
          const freeCancellation: boolean = (() => {
            if (freeCancellationBefore) return true
            const policies = cheapestPenalties?.policies
            if (!policies || !Array.isArray(policies)) return false
            const hasFreePeriod = policies.some((p: any) =>
              p.amount_charge === '0' || p.amount_charge === 0
            )
            return hasFreePeriod
          })()

          const rawHid = typeof hotel.hid === 'number' ? hotel.hid : (typeof hotel.id === 'number' ? hotel.id : undefined)

          return {
            id: hotelId?.toString() || '',
            hid: rawHid,
            name: hotelName,
            address: hotelAddress,
            rating: starRating,
            price: {
              amount: Math.round(pricePerNight),
              currency,
              perNight: true,
              totalPrice: Math.round(totalPriceWithFee),
              nights
            },
            image: hotelImage,
            images: this.parseAllImages(staticInfo?.images),
            amenities: allAmenities,
            distance: distanceText,
            lat: lat !== undefined && !isNaN(lat) ? lat : undefined,
            lng: lng !== undefined && !isNaN(lng) ? lng : undefined,
            freeCancellation,
            freeCancellationBefore,
          }
        })

        const processedHotels = await runWithConcurrency(hotelTasks, 3)
        hotels.push(...processedHotels)
      }

      return {
        success: true,
        hotels,
        searchId,
        totalResults: hotelData.length,
        hasMore: (offset + batchSize) < hotelData.length
      } as RateHawkHotelSearchResponse

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      let userFriendlyError = 'Kunne ikke søke etter hoteller'

      if (errorMessage.includes('invalid region_id') || errorMessage.includes('cannot be searched')) {
        userFriendlyError = 'Denne destinasjonen støttes ikke ennå. Prøv en annen by, f.eks. Oslo eller Barcelona.'
      } else if (errorMessage.includes('credentials missing')) {
        userFriendlyError = 'API-nøkler mangler. Kontakt support.'
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        userFriendlyError = 'For mange forespørsler. Prøv igjen om et øyeblikk.'
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Søket tok for lang tid. Prøv igjen.'
      }

      return {
        success: false,
        error: userFriendlyError,
        technicalError: errorMessage,
        hotels: [],
        searchId: '',
        totalResults: 0
      } as RateHawkHotelSearchResponse
    }
  }

  async enrichHotelBatch(searchId: string, offset: number, batchSize = 15): Promise<RateHawkHotelSearchResponse> {
    const entry = GLOBAL_SERP_CACHE.get(searchId)
    if (!entry) {
      return { success: false, error: 'Søket er utløpt. Start et nytt søk.', hotels: [], searchId, totalResults: 0 }
    }

    const { hotels: allHotels, params } = entry
    const batch = allHotels.slice(offset, offset + batchSize)
    if (batch.length === 0) {
      return { success: true, hotels: [], searchId, totalResults: allHotels.length, hasMore: false }
    }

    const checkInDate = new Date(params.checkIn)
    const checkOutDate = new Date(params.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const tasks = batch.map((hotel: any) => async () => {
      let totalPrice = 0
      let currency = 'NOK'
      if (hotel.rates && hotel.rates.length > 0) {
        const cheapest = [...hotel.rates].sort((a: any, b: any) => {
          return parseFloat(a.payment_options?.payment_types?.[0]?.amount || '999999') -
                 parseFloat(b.payment_options?.payment_types?.[0]?.amount || '999999')
        })[0]
        totalPrice = parseFloat(cheapest.payment_options?.payment_types?.[0]?.amount || '0')
        currency = cheapest.payment_options?.payment_types?.[0]?.currency_code || 'NOK'
      }
      const totalPriceWithFee = totalPrice * (1 + BOOKING_FEE_PERCENT / 100)
      const pricePerNight = nights > 0 ? totalPriceWithFee / nights : totalPriceWithFee

      const hotelId = hotel.id || hotel.hid
      let staticInfo: any = null
      if (hotelId) {
        try {
          staticInfo = await this.getHotelStaticInfo(hotelId.toString(), typeof hotelId === 'number' ? hotelId : undefined)
        } catch { /* skip */ }
      }

      const hotelName = staticInfo?.name || staticInfo?.hotel_name || hotel.name || hotel.hotel_name
        || (hotelId ? hotelId.toString().replace(/_/g, ' ').split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          : 'Hotell')

      const hotelAddress = staticInfo ? [
        staticInfo.address,
        staticInfo.city?.name,
        staticInfo.region?.name,
        staticInfo.region?.country_name || staticInfo.country?.name
      ].filter(Boolean).join(', ') : (hotel.address || 'Adresse ikke tilgjengelig')

      let hotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
      if (staticInfo?.images?.length > 0) {
        const fi = staticInfo.images[0]
        hotelImage = this.normalizeImageUrl(typeof fi === 'string' ? fi : (fi?.url || fi?.tmpl || hotelImage))
      }

      const allAmenities: string[] = []
      if (staticInfo?.amenity_groups) {
        staticInfo.amenity_groups.forEach((g: any) => {
          (g.amenities || []).forEach((a: any) => {
            const n = typeof a === 'string' ? a : (a.name || a.amenity_name)
            if (n) allAmenities.push(this.formatAmenityName(n))
          })
        })
      }

      let distanceText = 'Se kart'
      if (hotel.distance) {
        const d = typeof hotel.distance === 'string' ? parseFloat(hotel.distance) : hotel.distance
        if (d > 0) distanceText = d < 1 ? `${Math.round(d * 1000)}m fra sentrum` : `${d.toFixed(1)}km fra sentrum`
      }

      const rawLat2 = staticInfo?.latitude ?? staticInfo?.location?.latitude ?? staticInfo?.location?.lat ?? staticInfo?.coordinates?.latitude ?? hotel.latitude ?? hotel.location?.latitude ?? hotel.lat
      const rawLng2 = staticInfo?.longitude ?? staticInfo?.location?.longitude ?? staticInfo?.location?.lon ?? staticInfo?.coordinates?.longitude ?? hotel.longitude ?? hotel.location?.longitude ?? hotel.lng ?? hotel.lon
      const lat2 = rawLat2 !== undefined && rawLat2 !== null ? parseFloat(String(rawLat2)) : undefined
      const lng2 = rawLng2 !== undefined && rawLng2 !== null ? parseFloat(String(rawLng2)) : undefined

      return {
        id: hotelId?.toString() || '',
        name: hotelName,
        address: hotelAddress,
        rating: staticInfo?.star_rating || staticInfo?.stars || hotel.star_rating || hotel.stars || 0,
        price: { amount: Math.round(pricePerNight), currency, perNight: true, totalPrice: Math.round(totalPriceWithFee), nights },
        image: hotelImage,
        images: this.parseAllImages(staticInfo?.images),
        amenities: allAmenities,
        distance: distanceText,
        lat: lat2 !== undefined && !isNaN(lat2) ? lat2 : undefined,
        lng: lng2 !== undefined && !isNaN(lng2) ? lng2 : undefined,
      }
    })

    const enriched = await runWithConcurrency(tasks, 3)
    return {
      success: true,
      hotels: enriched,
      searchId,
      totalResults: allHotels.length,
      hasMore: (offset + batchSize) < allHotels.length
    }
  }

  private buildPreFilters(filters?: SearchFilters): Record<string, unknown> {
    if (!filters) return {}
    const result: Record<string, unknown> = {}
    if (filters.meal_types && filters.meal_types.length > 0) {
      result.meal_types = filters.meal_types
    }
    if (filters.stars_gte !== undefined) {
      result.stars_gte = filters.stars_gte
    }
    if (filters.free_cancellation === true) {
      result.free_cancellation = true
    }
    return result
  }

  private getCoordinatesForDestination(destination: string, regionId: string): { lat: number; lon: number } {
    const knownCoordinates: Record<string, { lat: number; lon: number }> = {
      '2563': { lat: 59.9139, lon: 10.7522 },
      '1953': { lat: 55.6761, lon: 12.5683 },
      '1382': { lat: 52.5200, lon: 13.4050 },
      '1869': { lat: 51.5074, lon: -0.1278 },
      '1775': { lat: 48.8566, lon: 2.3522 },
      '1783': { lat: 52.3676, lon: 4.9041 },
      '2275': { lat: 59.3293, lon: 18.0686 },
      '1991': { lat: 41.9028, lon: 12.4964 },
      '1912': { lat: 41.3874, lon: 2.1686 },
      '2395': { lat: 40.7128, lon: -74.0060 },
      '2477': { lat: 25.2048, lon: 55.2708 },
      '2103': { lat: 37.9838, lon: 23.7275 },
    }
    return knownCoordinates[destination] || knownCoordinates[regionId] || { lat: 59.9139, lon: 10.7522 }
  }

  private async getHotelStaticInfo(hotelId?: string, hid?: number): Promise<any> {
    const cacheKey = hid ? `hid:${hid}` : `id:${hotelId}`

    if (this.hotelInfoCache.has(cacheKey)) {
      return this.hotelInfoCache.get(cacheKey)
    }

    try {
      let record = hid ? getHotelByHid(hid) : null
      if (!record && hotelId) record = getHotelById(hotelId)
      if (record && record.room_groups !== undefined) {
        const result = recordToApiFormat(record)
        // Returner kun fra SQLite-cache hvis koordinater OG beskrivelse finnes.
        // Ellers fall gjennom til API-kall for å hente oppdatert data.
        const hasCoords = result.latitude !== undefined && !isNaN(parseFloat(String(result.latitude)))
        const hasDescription = !!(result.description_struct || result.description)
        if (hasCoords && hasDescription) {
          this.hotelInfoCache.set(cacheKey, result)
          return result
        }
      }
    } catch (dbError: any) {
      console.warn('SQLite lookup failed:', dbError.message)
    }

    try {
      if (!this.apiKey || !this.accessToken) return null

      const params: any = { language: 'en' }
      if (hid) {
        params.hid = hid
      } else if (hotelId) {
        params.id = hotelId
      } else {
        return null
      }

      const data = await this.makeRequest('/hotel/info/', params, 'POST')
      const result = data?.data ?? null

      if (result) {
        try {
          upsertHotelBatch([result])
        } catch {
          // Ignore write errors
        }
      }

      this.hotelInfoCache.set(cacheKey, result)
      return result
    } catch (error: any) {
      console.warn('/hotel/info/ failed:', error.message)
      this.hotelInfoCache.set(cacheKey, null)
      return null
    }
  }

  private normalizeImageUrl(raw: string): string {
    let url = raw.includes('{size}') ? raw.replace('{size}', '1024x768') : raw
    if (url.startsWith('//')) url = 'https:' + url
    url = url.replace(/^https?:\/\/\/+/, 'https://')
    url = url
      .replace(/cddn\.worldota\.net/g, 'cdn.worldota.net')
      .replace(/cdn\.worlldota\.net/g, 'cdn.worldota.net')
      .replace(/cdn\.woorldota\.net/g, 'cdn.worldota.net')
      .replace(/cdn\.worldota\.\.net/g, 'cdn.worldota.net')
      .replace(/cdn\.worldota\.neet/g, 'cdn.worldota.net')
    url = url.replace(/(cdn\.worldota\.net\/)tt\//, '$1t/')
    url = url.replace(/\/contentt\//g, '/content/')
    url = url.replace(/^htttps:\/\//, 'https://')
    url = url.replace(/^httpps:\/\//, 'https://')
    url = url.replace(/^httpss:\/\//, 'https://')
    url = url.replace(/\.(JPEG|JPG|PNG|WEBP|GIF)$/, (ext) => ext.toLowerCase())
    return url
  }

  private parseAllImages(images: any[] | undefined): string[] {
    if (!images || !Array.isArray(images)) return []
    const parsedImages: string[] = []
    for (const img of images) {
      if (typeof img === 'string') {
        parsedImages.push(this.normalizeImageUrl(img))
      } else if (img?.url) {
        parsedImages.push(this.normalizeImageUrl(img.url))
      } else if (img?.tmpl) {
        parsedImages.push(this.normalizeImageUrl(img.tmpl))
      }
    }
    return parsedImages
  }

  private parseAmenityGroups(amenityGroups: any[] | undefined): any[] {
    if (!amenityGroups || !Array.isArray(amenityGroups)) return []
    return amenityGroups.map(group => {
      const rawAmenities: any[] = Array.isArray(group.amenities) ? group.amenities : []
      const amenities = rawAmenities
        .map((amenity: any) => {
          const raw: string = typeof amenity === 'string'
            ? amenity
            : (amenity.name || amenity.amenity_name || '')
          if (!raw) return null
          return {
            name: this.formatAmenityName(raw),
            icon: this.getAmenityIcon(raw)
          }
        })
        .filter((a): a is { name: string; icon: string } => a !== null && a.name.length > 0)
      return { group_name: this.translateAmenityGroupName(group.group_name || 'Andre'), amenities }
    }).filter(group => group.amenities.length > 0)
  }

  private translateAmenityGroupName(groupName: string): string {
    const groupMap: Record<string, string> = {
      'general': 'Generelt',
      'internet': 'Internett',
      'parking': 'Parkering',
      'reception_services': 'Resepsjonstjenester',
      'entertainment_and_family_services': 'Underholdning og familie',
      'food_and_drinks': 'Mat og drikke',
      'pool_and_wellness': 'Basseng og velvære',
      'business_facilities': 'Bedriftsfasiliteter',
      'accessibility': 'Tilgjengelighet',
      'pets': 'Kjæledyr',
      'cleaning_services': 'Rengjøring',
      'bathroom': 'Bad',
      'bedroom': 'Soverom',
      'kitchen': 'Kjøkken',
      'room_amenities': 'Romservice',
      'outdoors': 'Utendørs',
      'activities': 'Aktiviteter'
    }
    return groupMap[groupName.toLowerCase()] || groupName
  }

  private getAmenityIcon(amenityName: string): string {
    const iconMap: Record<string, string> = {
      'wifi': 'wifi', 'parking': 'car', 'pool': 'waves',
      'gym': 'dumbbell', 'restaurant': 'utensils', 'bar': 'glass',
      'spa': 'sparkles', 'pet': 'paw'
    }
    const key = amenityName.toLowerCase()
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (key.includes(keyword)) return icon
    }
    return 'check'
  }

  private formatAmenityName(amenity: string): string {
    const amenityMap: Record<string, string> = {
      'free-wifi': 'Gratis WiFi', 'wifi': 'WiFi',
      'free-wifi-in-all-rooms': 'Gratis WiFi i alle rom',
      'free-internet': 'Gratis internett', 'internet': 'Internett',
      'parking': 'Parkering', 'free-parking': 'Gratis parkering',
      'air-conditioning': 'Aircondition', 'air-conditioned': 'Aircondition',
      'heating': 'Oppvarming', 'tv': 'TV', 'flat-screen-tv': 'Flatskjerm-TV',
      'minibar': 'Minibar', 'balcony': 'Balkong', 'terrace': 'Terrasse',
      'bathtub': 'Badekar', 'shower': 'Dusj', 'hairdryer': 'Hårtørker',
      'hair-dryer': 'Hårtørker', 'private-bathroom': 'Privat bad',
      'swimming-pool': 'Svømmebasseng', 'pool': 'Basseng',
      'indoor-pool': 'Innendørs basseng', 'outdoor-pool': 'Utendørs basseng',
      'hot-tub': 'Boblebad', 'jacuzzi': 'Jacuzzi',
      'gym': 'Treningssenter', 'fitness-center': 'Treningssenter',
      'spa': 'Spa', 'sauna': 'Badstu',
      'restaurant': 'Restaurant', 'bar': 'Bar',
      'breakfast': 'Frokost', 'breakfast-included': 'Frokost inkludert',
      'breakfast-buffet': 'Frokostbuffet', 'all-inclusive': 'Alt inkludert',
      'room-service': 'Romservice', '24-hour-front-desk': '24t resepsjon',
      'elevator': 'Heis', 'lift': 'Heis',
      'luggage-storage': 'Bagasjeoppbevaring',
      'airport-shuttle': 'Flyplass-shuttle',
      'pet-friendly': 'Kjæledyr tillatt', 'pets-allowed': 'Kjæledyr tillatt',
      'non-smoking': 'Røykfritt', 'family-rooms': 'Familierom',
      'wheelchair-accessible': 'Rullestoltilgjengelig',
      'kitchenette': 'Tekjøkken', 'kitchen': 'Kjøkken',
      'refrigerator': 'Kjøleskap', 'fridge': 'Kjøleskap',
      'coffee-maker': 'Kaffetrakter', 'coffee-machine': 'Kaffemaskin',
      'kettle': 'Vannkoker', 'beach-access': 'Strandadgang',
      'beach-front': 'Strandlinje', 'garden': 'Hage',
      'king-bed': 'King size-seng', 'double-bed': 'Dobbeltseng',
      'twin-beds': 'To enkeltsenger',
    }
    const lowerAmenity = amenity.toLowerCase().replace(/_/g, '-')
    if (amenityMap[lowerAmenity]) return amenityMap[lowerAmenity]
    return amenity
      .replace(/_/g, ' ').replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  private async getRegionId(destination: string, destinationType?: string): Promise<string | null> {
    try {
      if (/^\d+$/.test(destination)) {
        // Ren numerisk: hotell-hid (≥5 siffer) eller region-id — returner direkte
        return destination
      }

      const knownDestinations: Record<string, string> = {
        'OSL': '2563', 'CPH': '1953', 'BER': '1382',
        'LON': '1869', 'PAR': '1775', 'AMS': '1783',
        'STO': '2275', 'ROM': '1991',
      }

      if (knownDestinations[destination]) {
        return knownDestinations[destination]
      }

      try {
        const autoCompleteData = await this.makeRequest('/search/multicomplete/', {
          query: destination,
          language: 'en'
        })

        if (autoCompleteData?.data?.regions && autoCompleteData.data.regions.length > 0) {
          return autoCompleteData.data.regions[0].id.toString()
        }

        if (autoCompleteData?.regions && autoCompleteData.regions.length > 0) {
          return autoCompleteData.regions[0].id.toString()
        }
      } catch {
        // fall through to next method
      }

      try {
        const regionData = await this.makeRequest('/search/serp/region/', {
          q: destination, language: 'en'
        })
        if (regionData?.regions && regionData.regions.length > 0) {
          return regionData.regions[0].id.toString()
        }
      } catch {
        // fall through
      }

      return null
    } catch (error) {
      console.error('Failed to get region ID:', error)
      return null
    }
  }

  async getHotelDetails(params: {
    hotelId?: string
    hid?: number
    checkIn: string
    checkOut: string
    adults: number
    children?: number[]
    rooms?: number
    roomConfigs?: { adults: number; childAges: number[] }[]
    currency?: string
    residency?: string
  }) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const guests = params.roomConfigs && params.roomConfigs.length > 0
        ? params.roomConfigs.map(r => ({ adults: r.adults, children: r.childAges || [] }))
        : [{ adults: params.adults, children: Array.isArray(params.children) ? params.children : [] }]

      const requestParams: any = {
        checkin: params.checkIn,
        checkout: params.checkOut,
        residency: this.getUserResidency(params.residency),
        language: 'en',
        guests,
        currency: params.currency || 'NOK',
        timeout: 8
      }

      if (params.hid) {
        requestParams.hid = params.hid
      } else if (params.hotelId) {
        requestParams.id = params.hotelId
      } else {
        throw new Error('Either hotelId or hid is required')
      }

      const data = await this.makeRequest('/search/hp/', requestParams, 'POST')

      if (data?.data?.hotels && data.data.hotels.length > 0) {
        const hotelData = data.data.hotels[0]
        const staticInfo = await this.getHotelStaticInfo(params.hotelId, params.hid)

        const hotelName = staticInfo?.name || staticInfo?.hotel_name || hotelData.name || hotelData.hotel_name || 'Hotell'
        const hotelAddress = staticInfo ? [
          staticInfo.address,
          staticInfo.city?.name,
          staticInfo.region?.name,
          staticInfo.region?.country_name || staticInfo.country?.name
        ].filter(Boolean).join(', ') : (hotelData.address || 'Adresse ikke tilgjengelig')

        let hotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
        if (staticInfo?.images && Array.isArray(staticInfo.images) && staticInfo.images.length > 0) {
          const firstImage = staticInfo.images[0]
          if (typeof firstImage === 'string') {
            hotelImage = firstImage.replace('{size}', '1024x768')
          } else if (firstImage?.url) {
            hotelImage = firstImage.url.replace('{size}', '1024x768')
          }
        } else if (hotelData.image) {
          hotelImage = typeof hotelData.image === 'string' ? hotelData.image : hotelData.image.url || hotelImage
        }

        const starRating = staticInfo?.star_rating || staticInfo?.stars || hotelData.star_rating || hotelData.stars || 0
        let reviews: any[] = []
        try {
          reviews = await this.getHotelReviews(params.hotelId || params.hid?.toString() || '')
        } catch {
          // No reviews available
        }

        const rawGroups: any[] = staticInfo?.room_groups || []
        const normalizeImageUrl = (raw: string) => this.normalizeImageUrl(raw)

        const parseGroupPhotos = (group: any): string[] => {
          const photos: string[] = []
          const combined = [
            ...(Array.isArray(group.images) ? group.images : []),
            ...(Array.isArray(group.images_ext) ? group.images_ext : [])
          ]
          combined.slice(0, 6).forEach((img: any) => {
            const raw = typeof img === 'string' ? img : (img.url || img.tmpl || img.src || img.original || img.path || '')
            if (raw) photos.push(normalizeImageUrl(raw))
          })
          return photos
        }

        const groupById = new Map<number, any>()
        rawGroups.forEach((group: any) => {
          if (group.room_group_id !== undefined) {
            groupById.set(Number(group.room_group_id), {
              photos: parseGroupPhotos(group),
              name: (group.name || '').toLowerCase().trim(),
              rg_ext: group.rg_ext || {},
              size_sqm: group.area_sqm || group.size_sqm || group.size || null,
              view: Array.isArray(group.rg_ext?.view_trans) ? (group.rg_ext.view_trans[0] ?? null) : (group.view || null),
              bathroom_desc: group.name_struct?.bathroom || null,
              bedding_desc: group.name_struct?.bedding_type || null,
              room_amenities: Array.isArray(group.room_amenities)
                ? group.room_amenities.map((a: any) => this.formatAmenityName(typeof a === 'string' ? a : (a.name || '')))
                : []
            })
          }
        })

        const rooms: any[] = []
        if (hotelData.rates && hotelData.rates.length > 0) {
          hotelData.rates.forEach((rate: any) => {
            const roomPhotos: string[] = []
            if (rate.room_data_trans?.main_photo) {
              roomPhotos.push(rate.room_data_trans.main_photo.replace('{size}', '640x480'))
            }
            if (Array.isArray(rate.room_data_trans?.photos)) {
              (rate.room_data_trans.photos as any[]).slice(0, 5).forEach((p: any) => {
                const url = typeof p === 'string' ? p : (p.url || p.tmpl || '')
                if (url) roomPhotos.push(url.replace('{size}', '640x480'))
              })
            }

            const normalizeName = (s: string) => s.toLowerCase().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
            let matchedGroup: any | undefined

            if (groupById.size > 0) {
              const re = rate.rg_ext

              if (re) {
                // 2a. rg_ext exact match (class+bedding+bathroom+quality) WITH photos
                if (!matchedGroup) {
                  for (const g of groupById.values()) {
                    if (g.photos.length === 0) continue
                    if (g.rg_ext.class === re.class && g.rg_ext.bedding === re.bedding &&
                        g.rg_ext.bathroom === re.bathroom && g.rg_ext.quality === re.quality) {
                      matchedGroup = g; break
                    }
                  }
                }

                // 2b. rg_ext without quality WITH photos
                if (!matchedGroup) {
                  for (const g of groupById.values()) {
                    if (g.photos.length === 0) continue
                    if (g.rg_ext.class === re.class && g.rg_ext.bedding === re.bedding &&
                        g.rg_ext.bathroom === re.bathroom) {
                      matchedGroup = g; break
                    }
                  }
                }

                // 2c. rg_ext without bathroom WITH photos
                if (!matchedGroup) {
                  for (const g of groupById.values()) {
                    if (g.photos.length === 0) continue
                    if (g.rg_ext.class === re.class && g.rg_ext.bedding === re.bedding) {
                      matchedGroup = g; break
                    }
                  }
                }

                // 2d. rg_ext exact match WITHOUT photo requirement (size/view metadata)
                if (!matchedGroup) {
                  for (const g of groupById.values()) {
                    if (g.rg_ext.class === re.class && g.rg_ext.bedding === re.bedding &&
                        g.rg_ext.bathroom === re.bathroom && g.rg_ext.quality === re.quality) {
                      matchedGroup = g; break
                    }
                  }
                }

                // 2e. rg_ext without quality, no photo requirement
                if (!matchedGroup) {
                  for (const g of groupById.values()) {
                    if (g.rg_ext.class === re.class && g.rg_ext.bedding === re.bedding &&
                        g.rg_ext.bathroom === re.bathroom) {
                      matchedGroup = g; break
                    }
                  }
                }
              }

              // 2f. Direct room_group_id match
              if (!matchedGroup && rate.room_group_id !== undefined) {
                matchedGroup = groupById.get(Number(rate.room_group_id))
              }

              // 2g. Exact normalised name match
              if (!matchedGroup) {
                const rateName = normalizeName(rate.room_data_trans?.main_name || rate.room_name || '')
                const rateType = normalizeName(rate.room_data_trans?.main_room_type || '')
                for (const g of groupById.values()) {
                  const gNorm = normalizeName(g.name)
                  if (gNorm === rateName || gNorm === rateType) { matchedGroup = g; break }
                }
              }

              // 2h. Prefix/contains name match
              if (!matchedGroup) {
                const rateName = normalizeName(rate.room_data_trans?.main_name || rate.room_name || '')
                const rateType = normalizeName(rate.room_data_trans?.main_room_type || '')
                for (const g of groupById.values()) {
                  const gNorm = normalizeName(g.name)
                  if (gNorm.length > 3 && (rateName.startsWith(gNorm) || rateType.startsWith(gNorm) || gNorm.startsWith(rateName))) {
                    matchedGroup = g; break
                  }
                }
              }
            }

            if (matchedGroup && roomPhotos.length === 0) roomPhotos.push(...matchedGroup.photos)

            const finalPhotos = roomPhotos.filter(url => !url.includes('/extranet/'))
            const rdt = rate.room_data_trans || {}
            const rgExt = rate.rg_ext || {}
            const capacity: number = (rgExt.capacity && rgExt.capacity > 0) ? rgExt.capacity : 0
            const sizeSqm: number | null = matchedGroup?.size_sqm ?? rdt.area_sqm ?? rdt.size_sqm ?? null
            const view: string | null = matchedGroup?.view ?? null

            const rawNonFree: string[] = rate.non_free_amenities || []
            const keysPickup: string | null =
              rate.room_data_trans?.keys_pickup_instructions ||
              rate.keys_pickup_instructions ||
              null

            rooms.push({
              book_hash: rate.book_hash,
              room_name: rate.room_name || 'Standard rom',
              rg_ext: rgExt,
              meal_data: rate.meal_data || {},
              daily_prices: rate.daily_prices || [],
              payment_options: rate.payment_options || {},
              cancellation_penalties: rate.cancellation_penalties || null,
              tax_data: rate.payment_options?.payment_types?.[0]?.tax_data || null,
              amenities: [
                ...(rate.amenities_data || []).map((a: string) => this.formatAmenityName(a)),
                ...(matchedGroup?.room_amenities || [])
              ],
              non_free_amenities: rawNonFree.map((a: string) => this.formatAmenityName(a)),
              keys_pickup_instructions: keysPickup,
              allotment: rate.allotment || 0,
              capacity,
              size_sqm: sizeSqm,
              view,
              bathroom_desc: matchedGroup?.bathroom_desc || null,
              bedding_desc: matchedGroup?.bedding_desc || null,
              images: finalPhotos
            })
          })
        }

        // Dedupliser: fjern exact book_hash-duplikater, beholder billigste per romtype+måltid+avbestilling
        const dedupedRooms = (() => {
          const seenHashes = new Set<string>()
          const byKey = new Map<string, { idx: number; price: number }>()
          const result: typeof rooms = []

          const getPrice = (r: any): number => {
            const types = r.payment_options?.payment_types
            if (!types?.length) return 999999
            return parseFloat(types.slice().sort((a: any, b: any) =>
              parseFloat(a.amount || '999999') - parseFloat(b.amount || '999999')
            )[0].amount || '999999')
          }

          const mealKey = (m: any) => {
            if (!m) return 'none'
            if (m.has_all_inclusive) return 'ai'
            if (m.has_full_board) return 'fb'
            if (m.has_half_board) return 'hb'
            if (m.has_breakfast) return 'bb'
            return 'ro'
          }

          const cancelKey = (r: any): string => {
            const policies = r.cancellation_penalties?.policies
            if (!policies?.length) return 'unknown'
            const first = policies[0]
            if (first.amount_charge === '0' || first.amount_charge === 0) return 'free'
            return 'paid'
          }

          for (const room of rooms) {
            if (seenHashes.has(room.book_hash)) continue
            seenHashes.add(room.book_hash)

            const key = `${room.room_name.toLowerCase().trim()}|${mealKey(room.meal_data)}|${cancelKey(room)}`
            const price = getPrice(room)

            if (byKey.has(key)) {
              const existing = byKey.get(key)!
              if (price < existing.price) {
                result[existing.idx] = room
                existing.price = price
              }
            } else {
              byKey.set(key, { idx: result.length, price })
              result.push(room)
            }
          }
          return result
        })()

        return {
          success: true,
          hotel: {
            id: hotelData.id || params.hotelId,
            hid: hotelData.hid,
            name: hotelName,
            address: hotelAddress,
            image: hotelImage,
            images: this.parseAllImages(staticInfo?.images || hotelData.images),
            star_rating: starRating,
            amenity_groups: this.parseAmenityGroups(staticInfo?.amenity_groups),
            description: staticInfo?.description_struct || staticInfo?.description || hotelData.description || null,
            check_in_time: staticInfo?.check_in_time || null,
            check_out_time: staticInfo?.check_out_time || null,
            reviews,
            review_count: reviews.length,
            metapolicy_struct: staticInfo?.metapolicy_struct || null,
            rooms: dedupedRooms,
            total_rooms: dedupedRooms.length
          }
        }
      }

      throw new Error('Hotell ikke funnet')
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch hotel details' }
    }
  }

  async getHotelReviews(hotelId: string): Promise<any[]> {
    try {
      if (!this.apiKey || !this.accessToken) return []
      const staticInfo = await this.getHotelStaticInfo(hotelId)
      if (staticInfo?.reviews && Array.isArray(staticInfo.reviews) && staticInfo.reviews.length > 0) {
        return this.parseReviews(staticInfo.reviews)
      }
      return []
    } catch {
      return []
    }
  }

  private parseReviews(reviews: any[]): any[] {
    if (!reviews || !Array.isArray(reviews)) return []
    return reviews.slice(0, 10).map(review => ({
      author: review.author || review.user_name || 'Anonym',
      date: review.date || review.created_at || null,
      rating: review.rating || review.score || 0,
      title: review.title || null,
      text: review.text || review.comment || review.review || '',
      pros: review.pros || null,
      cons: review.cons || null
    })).filter(review => review.text && review.text.length > 10)
  }

  async prebookRate(params: {
    bookHash: string
    checkIn: string
    checkOut: string
    adults: number
    children?: number
    rooms?: number
    currency?: string
  }) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const now = new Date()
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
      const randPart = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, '0')
      const partnerOrderId = `SYD-${datePart}-${randPart}`

      const requestParams = {
        partner_order_id: partnerOrderId,
        book_hash: params.bookHash,
        price_increase_percent: 10,
        language: 'en',
        currency: params.currency || 'NOK',
        user_ip: '82.29.0.86'
      }

      const data = await this.makeRequest('/hotel/order/booking/form/', requestParams, 'POST')

      if (data?.status === 'error' && data?.error === 'sandbox_restriction') {
        return {
          success: false,
          error: 'Hotellbooking er ikke tilgjengelig i testmodus.',
        }
      }

      if (data?.data) {
        // Ratehawk returnerer ny book_hash fra prebook. Hvis den mangler (f.eks. sandkasse),
        // faller vi tilbake til den originale rate-hashen slik at finishBooking kan forsøkes.
        const returnedBookHash: string = data.data.book_hash || params.bookHash
        return {
          success: true,
          data: {
            book_hash: returnedBookHash,
            partner_order_id: data.data.partner_order_id || partnerOrderId,
            item_id: data.data.item_id,
            order_id: data.data.order_id,
            payment_types: data.data.payment_types,
            price_changed: data.data.price_changed ?? false,
            upsell_data: data.data.upsell_data
          }
        }
      }

      throw new Error(data?.error || 'Booking form creation failed')
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create booking form' }
    }
  }

  async finishBooking(params: {
    bookHash: string
    partnerOrderId: string
    userEmail: string
    userPhone: string
    firstName: string
    lastName: string
    childGuests?: { firstName: string; lastName: string; age: number }[]
    additionalRoomGuests?: { firstName: string; lastName: string }[]
    roomConfigs?: { adults: number; childAges: number[] }[]
    paymentType: 'deposit' | 'now'
    amount: string
    currencyCode: string
    amountSellB2b2c?: string
    remarks?: string
    roomCount?: number
    upsellData?: object[]
  }) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      const allChildGuests = (params.childGuests || []).map((child) => ({
        first_name: child.firstName,
        last_name: child.lastName,
        is_child: true as const,
        age: child.age
      }))

      const leadGuest = { first_name: params.firstName, last_name: params.lastName }

      // Build per-room guest list using roomConfigs for child distribution
      const roomGuestLeads = [
        leadGuest,
        ...(params.additionalRoomGuests || []).map(g => ({
          first_name: g.firstName || params.firstName,
          last_name: g.lastName || params.lastName,
        }))
      ]

      let rooms: { guests: object[] }[]

      if (params.roomConfigs && params.roomConfigs.length > 0) {
        // Distribute children to their correct rooms based on roomConfigs
        let childIndex = 0
        rooms = params.roomConfigs.map((roomConfig, i) => {
          const roomLead = roomGuestLeads[i] || leadGuest
          const roomChildCount = roomConfig.childAges.length
          const roomChildren = allChildGuests.slice(childIndex, childIndex + roomChildCount)
          childIndex += roomChildCount
          return { guests: [roomLead, ...roomChildren] }
        })
      } else {
        // Fallback: all children in room 1, same lead for all rooms
        const roomCount = Math.max(1, params.roomCount ?? 1)
        rooms = Array.from({ length: roomCount }, (_, i) => ({
          guests: i === 0
            ? [roomGuestLeads[i] || leadGuest, ...allChildGuests]
            : [roomGuestLeads[i] || leadGuest]
        }))
      }

      const requestParams: Record<string, unknown> = {
        book_hash: params.bookHash,
        user: {
          email: 'bookings@sydenklar.no',
          phone: params.userPhone,
          comment: params.remarks || ''
        },
        supplier_data: {
          first_name_original: params.firstName,
          last_name_original: params.lastName,
          phone: params.userPhone,
          email: 'bookings@sydenklar.no'
        },
        partner: {
          partner_order_id: params.partnerOrderId,
          comment: 'Booking via Sydenklar.no',
          amount_sell_b2b2c: params.amountSellB2b2c ?? '0',
        },
        language: 'en',
        rooms,
        payment_type: {
          type: params.paymentType,
          amount: params.amount,
          currency_code: params.currencyCode
        },
        return_path: 'https://sydenklar.no/booking-bekreftelse'
      }

      if (params.upsellData && params.upsellData.length > 0) {
        requestParams.upsell_data = params.upsellData
      }

      const data = await this.makeRequest('/hotel/order/booking/finish/', requestParams, 'POST')

      const FINAL_FINISH_ERRORS = ['booking_form_expired', 'rate_not_found']
      if (data?.status === 'error' && FINAL_FINISH_ERRORS.includes(data?.error)) {
        return { success: false as const, isFinal: true, error: data.error }
      }

      return {
        success: true as const,
        shouldPoll: true,
        data: {
          order_id: data?.data?.order_id || 0,
          partner_order_id: params.partnerOrderId,
          status: 'in_progress',
          item_id: data?.data?.item_id || 0
        }
      }
    } catch (error: any) {
      const statusCode = (error as any).statusCode
      if (!statusCode || statusCode >= 500) {
        return {
          success: true as const,
          shouldPoll: true,
          data: {
            order_id: 0,
            partner_order_id: params.partnerOrderId,
            status: 'in_progress',
            item_id: 0
          }
        }
      }
      return { success: false as const, isFinal: true, error: error.message || 'Failed to finish booking' }
    }
  }

  async checkBookingStatus(partnerOrderId: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }
      const data = await this.makeRequest('/hotel/order/booking/finish/status/', { partner_order_id: partnerOrderId }, 'POST')
      if (data?.status) {
        return {
          success: true,
          status: data.status,
          data: {
            partner_order_id: data.data?.partner_order_id,
            percent: data.data?.percent,
            data_3ds: data.data?.data_3ds
          },
          error: data.error
        }
      }
      throw new Error('Invalid status response')
    } catch (error: any) {
      return { success: false, status: 'error', error: error.message || 'Failed to check booking status' }
    }
  }

  async cancelBooking(partnerOrderId: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }
      const data = await this.makeRequest('/hotel/order/cancel/', { partner_order_id: partnerOrderId }, 'POST')
      if (data?.status === 'ok') {
        return {
          success: true,
          amountPayable: data.data?.amount_payable ?? null,
          amountRefunded: data.data?.amount_refunded ?? null,
          amountSell: data.data?.amount_sell ?? null,
        }
      }
      throw new Error(data?.error || 'Cancellation failed')
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to cancel booking' }
    }
  }

  async searchDestinations(query: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error('RateHawk API credentials missing')
      }

      try {
        const response = await this.makeRequest('/search/multicomplete/', {
          query: query || 'oslo',
          language: 'en'
        }, 'POST')

        const destinations: any[] = []

        if (response?.data?.regions && Array.isArray(response.data.regions)) {
          response.data.regions.slice(0, 10).forEach((region: any) => {
            destinations.push({
              id: region.id?.toString(),
              name: region.name,
              type: region.type?.toLowerCase() || 'region',
              country: region.country_code || ''
            })
          })
        }

        if (response?.data?.hotels && Array.isArray(response.data.hotels)) {
          response.data.hotels.slice(0, 5).forEach((hotel: any) => {
            destinations.push({
              id: hotel.hid?.toString() || hotel.id?.toString(),
              name: hotel.name,
              type: 'hotel',
              country: ''
            })
          })
        }

        if (destinations.length > 0) return destinations.slice(0, 20)
      } catch {
        // fall through to fallback
      }

      // Fallback: curated popular destinations
      const allDestinations = [
        { id: '2563', name: 'Oslo', country: 'Norge', type: 'city' },
        { id: '2275', name: 'Stockholm', country: 'Sverige', type: 'city' },
        { id: '1953', name: 'København', country: 'Danmark', type: 'city' },
        { id: '1382', name: 'Berlin', country: 'Tyskland', type: 'city' },
        { id: '1783', name: 'Amsterdam', country: 'Nederland', type: 'city' },
        { id: '1775', name: 'Paris', country: 'Frankrike', type: 'city' },
        { id: '1869', name: 'London', country: 'Storbritannia', type: 'city' },
        { id: '1991', name: 'Roma', country: 'Italia', type: 'city' },
        { id: '1912', name: 'Barcelona', country: 'Spania', type: 'city' },
        { id: '1854', name: 'Wien', country: 'Østerrike', type: 'city' },
        { id: '2103', name: 'Athen', country: 'Hellas', type: 'city' },
        { id: '1876', name: 'Budapest', country: 'Ungarn', type: 'city' },
        { id: '2395', name: 'New York', country: 'USA', type: 'city' },
        { id: '2477', name: 'Dubai', country: 'UAE', type: 'city' },
        { id: '2483', name: 'Tokyo', country: 'Japan', type: 'city' },
        { id: '2520', name: 'Bangkok', country: 'Thailand', type: 'city' },
        { id: '2508', name: 'Singapore', country: 'Singapore', type: 'city' },
        { id: '2428', name: 'Sydney', country: 'Australia', type: 'city' },
        { id: '2390', name: 'Miami', country: 'USA', type: 'city' },
        { id: '2409', name: 'Los Angeles', country: 'USA', type: 'city' },
      ]

      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        return allDestinations
          .filter(d => d.name.toLowerCase().includes(searchTerm) || d.country.toLowerCase().includes(searchTerm))
          .slice(0, 20)
      }

      return allDestinations.slice(0, 20)
    } catch (error) {
      console.error('Destination search error:', error)
      throw error
    }
  }

  async getHotelInfo(hotelId?: string, hid?: number): Promise<any | null> {
    return this.getHotelStaticInfo(hotelId, hid)
  }
}

export const ratehawkClient = new RateHawkClient()
