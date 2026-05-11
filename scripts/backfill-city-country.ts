/**
 * Backfill city_name and country_name for hotels that are missing this data.
 *
 * Calls POST /hotel/info/ for each hotel with null city_name,
 * then upserts the full fresh record back into the DB.
 *
 * Usage: tsx scripts/backfill-city-country.ts [--dry-run]
 *
 * Rate limit: 1 request/sec to avoid hammering the API.
 */

import https from 'https'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import {
  upsertHotelBatch,
  getHotelCount,
} from '../lib/hotel-static-db'
import Database from 'better-sqlite3'

const BASE_URL = (process.env.RATEHAWK_BASE_URL || 'https://api.worldota.net/api/b2b/v3').replace(/\/$/, '')
const KEY_ID   = process.env.RATEHAWK_KEY_ID || ''
const API_KEY  = process.env.RATEHAWK_API_KEY || ''
const DB_PATH  = path.join(process.cwd(), 'data', 'hotel-static.db')
const DRY_RUN  = process.argv.includes('--dry-run')

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${KEY_ID}:${API_KEY}`).toString('base64')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchHotelInfo(id: string, hid: number | null): Promise<any | null> {
  return new Promise((resolve) => {
    const params: Record<string, any> = { language: 'en' }
    if (hid) params.hid = hid
    else params.id = id

    const body = JSON.stringify(params)
    const req = https.request(
      {
        hostname: new URL(BASE_URL).hostname,
        port: 443,
        path: new URL(BASE_URL).pathname + '/hotel/info/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Authorization: authHeader(),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', c => (raw += c))
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw)
            resolve(parsed?.data ?? null)
          } catch {
            resolve(null)
          }
        })
      },
    )
    req.on('error', () => resolve(null))
    req.write(body)
    req.end()
  })
}

async function run() {
  if (!KEY_ID || !API_KEY) {
    console.error('❌  Mangler RATEHAWK_KEY_ID eller RATEHAWK_API_KEY i .env.local')
    process.exit(1)
  }

  const db = new Database(DB_PATH)

  const hotels = db
    .prepare(
      `SELECT id, hid, name FROM hotels
       WHERE city_name IS NULL OR country_name IS NULL
       ORDER BY star_rating DESC`
    )
    .all() as { id: string; hid: number | null; name: string }[]

  const total = getHotelCount()
  console.log(`\n🔧  Backfill city/country for hoteller`)
  console.log(`   Total i DB        : ${total}`)
  console.log(`   Mangler by/land   : ${hotels.length}`)
  if (DRY_RUN) console.log(`   Modus             : DRY RUN (ingen endringer)`)
  console.log()

  if (hotels.length === 0) {
    console.log('✅  Alle hoteller har allerede by og land – ingen backfill nødvendig.\n')
    return
  }

  let updated = 0
  let failed  = 0
  let skipped = 0

  for (let i = 0; i < hotels.length; i++) {
    const h = hotels[i]
    const progress = `[${(i + 1).toString().padStart(3)}/${hotels.length}]`

    process.stdout.write(`${progress} ${h.name?.substring(0, 45).padEnd(45)} `)

    if (DRY_RUN) {
      console.log('(dry-run)')
      continue
    }

    const data = await fetchHotelInfo(h.id, h.hid)

    if (!data) {
      console.log('❌  Ingen data fra API')
      failed++
      await sleep(500)
      continue
    }

    const cityName    = data.city?.name ?? data.region?.name
    const countryName = data.region?.country_name ?? data.country?.name

    if (!cityName && !countryName) {
      console.log('⚠️   Ingen by/land i API-svar')
      skipped++
      await sleep(300)
      continue
    }

    try {
      upsertHotelBatch([data])
      console.log(`✓  ${cityName ?? '?'}, ${countryName ?? '?'}`)
      updated++
    } catch {
      console.log('❌  DB-feil ved upsert')
      failed++
    }

    // 1 request per second to stay within RateHawk rate limits
    await sleep(1000)
  }

  console.log(`\n📊  Resultat:`)
  console.log(`   Oppdatert : ${updated}`)
  console.log(`   Hoppet over : ${skipped}`)
  console.log(`   Feilet    : ${failed}`)
  console.log(`   Totalt behandlet : ${hotels.length}`)
  console.log()
}

run().catch(err => {
  console.error('❌  Uventet feil:', err)
  process.exit(1)
})
