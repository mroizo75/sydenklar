export interface RoomConfig {
  adults: number
  childAges: number[]
}

/**
 * Encode roomConfigs to a compact URL-safe string.
 * Format: "1:0,17|1:10" — each room is "adults:childAge1,childAge2", rooms separated by "|".
 * Example: [{adults:1, childAges:[0,17]}, {adults:1, childAges:[10]}] → "1:0,17|1:10"
 */
export function encodeRoomCfg(configs: RoomConfig[]): string {
  return configs
    .map(r => `${r.adults}:${r.childAges.join(",")}`)
    .join("|")
}

/**
 * Decode a roomCfg string back to RoomConfig[].
 * Returns null on invalid input so callers can fall back to legacy params.
 */
export function decodeRoomCfg(str: string | null | undefined): RoomConfig[] | null {
  if (!str) return null
  try {
    const rooms = str.split("|").map(part => {
      const colonIdx = part.indexOf(":")
      const adultsStr = colonIdx >= 0 ? part.slice(0, colonIdx) : part
      const childStr = colonIdx >= 0 ? part.slice(colonIdx + 1) : ""
      const adults = Math.max(1, parseInt(adultsStr, 10) || 1)
      const childAges = childStr
        ? childStr.split(",").map(Number).filter(n => Number.isFinite(n) && n >= 0 && n <= 17)
        : []
      return { adults, childAges }
    })
    if (rooms.length === 0) return null
    return rooms
  } catch {
    return null
  }
}
