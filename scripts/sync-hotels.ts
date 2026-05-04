/**
 * Hotel static data sync from RateHawk dump API.
 * Usage: tsx scripts/sync-hotels.ts [full|incremental|status]
 *
 * Full sync   – downloads /hotel/info/dump/ (weekly, ~10–30 min)
 * Incremental – downloads /hotel/info/incremental/dump/ (daily)
 * Status      – shows DB stats
 */

import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { createReadStream, createWriteStream } from 'fs'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import {
  upsertHotelBatch,
  logSyncStart,
  logSyncEnd,
  getHotelCount,
  getLastSync,
} from '../lib/hotel-static-db'

const BASE_URL = (process.env.RATEHAWK_BASE_URL || 'https://api.worldota.net/api/b2b/v3').replace(/\/$/, '')
const KEY_ID   = process.env.RATEHAWK_KEY_ID  || ''
const API_KEY  = process.env.RATEHAWK_API_KEY || ''
const DATA_DIR = path.join(process.cwd(), 'data')

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${KEY_ID}:${API_KEY}`).toString('base64')
}

async function apiPost(endpoint: string, body: Record<string, unknown> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(BASE_URL + endpoint)
    const postData = JSON.stringify(body)

    const req = https.request(
      {
        hostname: fullUrl.hostname,
        port: 443,
        path: fullUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          Authorization: authHeader(),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve(JSON.parse(raw)) }
          catch { reject(new Error(`Ugyldig JSON fra API: ${raw.slice(0, 200)}`)) }
        })
      },
    )
    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = createWriteStream(destPath)

    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        downloadFile(res.headers.location!, destPath).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Nedlasting feilet: HTTP ${res.statusCode}`))
        return
      }

      let downloaded = 0
      res.on('data', (chunk) => {
        downloaded += chunk.length
        if (downloaded % (50 * 1024 * 1024) < chunk.length) {
          process.stdout.write(`\r  Lastet ned: ${(downloaded / 1024 / 1024).toFixed(0)} MB`)
        }
      })
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
      file.on('error', (e) => { fs.unlink(destPath, () => {}); reject(e) })
    }).on('error', reject)
  })
}

function decompressZst(inputPath: string, outputPath: string): void {
  try {
    execSync(`zstd -d "${inputPath}" -o "${outputPath}" --force --quiet`, { stdio: 'ignore' })
    return
  } catch {
    // zstd not available – try fzstd (pure JS)
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { decompress } = require('fzstd') as { decompress: (buf: Uint8Array) => Uint8Array }
    const compressed = fs.readFileSync(inputPath)
    const decompressed = decompress(compressed)
    fs.writeFileSync(outputPath, decompressed)
  } catch {
    throw new Error(
      'Kan ikke dekomprimere .zst – installer system-zstd: sudo apt install zstd',
    )
  }
}

async function importJsonl(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: createReadStream(filePath, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    })

    const BATCH = 500
    let batch: unknown[] = []
    let total = 0

    rl.on('line', (line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      try {
        batch.push(JSON.parse(trimmed))
        if (batch.length >= BATCH) {
          total += upsertHotelBatch(batch)
          batch = []
          if (total % 5_000 === 0) {
            process.stdout.write(`\r  Importert: ${total.toLocaleString()}`)
          }
        }
      } catch {
        // Skip malformed lines
      }
    })

    rl.on('close', () => {
      if (batch.length > 0) total += upsertHotelBatch(batch)
      resolve(total)
    })

    rl.on('error', reject)
  })
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function cleanUp(...files: string[]): void {
  for (const f of files) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f) } catch { /* ignore */ }
  }
}

async function fullSync(): Promise<void> {
  console.log('\n🏨  Sydenklar – Full hotel-dump sync')

  if (!KEY_ID || !API_KEY) {
    console.error('❌ Mangler RATEHAWK_KEY_ID eller RATEHAWK_API_KEY i .env.local')
    process.exit(1)
  }

  ensureDataDir()
  const logId  = logSyncStart('full')
  const zstPath  = path.join(DATA_DIR, 'hotel-dump.jsonl.zst')
  const jsonlPath = path.join(DATA_DIR, 'hotel-dump.jsonl')

  try {
    console.log('→ Henter dump-URL fra RateHawk...')
    const res = await apiPost('/hotel/info/dump/')
    const dumpUrl: string = res?.data?.url

    if (!dumpUrl) {
      throw new Error(`Ingen dump-URL i svar: ${JSON.stringify(res)}`)
    }

    console.log('→ Laster ned dump-fil...')
    await downloadFile(dumpUrl, zstPath)
    process.stdout.write('\n')

    console.log('→ Dekomprimerer...')
    decompressZst(zstPath, jsonlPath)
    cleanUp(zstPath)

    console.log('→ Importerer til SQLite...')
    const total = await importJsonl(jsonlPath)
    cleanUp(jsonlPath)

    logSyncEnd(logId, total)
    console.log(`\n✅ Full sync ferdig – importert ${total.toLocaleString()} hoteller\n`)
  } catch (err: any) {
    cleanUp(zstPath, jsonlPath)
    logSyncEnd(logId, 0, err.message)
    console.error('\n❌ Sync feilet:', err.message)
    process.exit(1)
  }
}

async function incrementalSync(): Promise<void> {
  console.log('\n🔄  Sydenklar – Inkrementell hotel-sync')

  if (!KEY_ID || !API_KEY) {
    console.error('❌ Mangler RATEHAWK_KEY_ID eller RATEHAWK_API_KEY i .env.local')
    process.exit(1)
  }

  ensureDataDir()

  const lastSync = getLastSync()
  let lastUpdateTime: string

  if (lastSync?.ended_at) {
    const d = new Date(lastSync.ended_at * 1000)
    lastUpdateTime = d.toISOString().replace('T', ' ').slice(0, 19)
  } else {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000)
    lastUpdateTime = d.toISOString().replace('T', ' ').slice(0, 19)
  }

  console.log(`  Siste sync: ${lastUpdateTime}`)

  const logId    = logSyncStart('incremental')
  const zstPath  = path.join(DATA_DIR, 'hotel-incremental.jsonl.zst')
  const jsonlPath = path.join(DATA_DIR, 'hotel-incremental.jsonl')

  try {
    console.log('→ Henter inkrementell dump-URL...')
    const res = await apiPost('/hotel/info/incremental/dump/', { last_update_time: lastUpdateTime })
    const dumpUrl: string = res?.data?.url

    if (!dumpUrl) {
      logSyncEnd(logId, 0)
      console.log('✅ Ingen nye oppdateringer siden siste sync\n')
      return
    }

    console.log('→ Laster ned inkrementell dump...')
    await downloadFile(dumpUrl, zstPath)
    process.stdout.write('\n')

    console.log('→ Dekomprimerer...')
    decompressZst(zstPath, jsonlPath)
    cleanUp(zstPath)

    console.log('→ Importerer til SQLite...')
    const total = await importJsonl(jsonlPath)
    cleanUp(jsonlPath)

    logSyncEnd(logId, total)
    console.log(`\n✅ Inkrementell sync ferdig – oppdatert ${total.toLocaleString()} hoteller\n`)
  } catch (err: any) {
    cleanUp(zstPath, jsonlPath)
    logSyncEnd(logId, 0, err.message)
    console.error('\n❌ Inkrementell sync feilet:', err.message)
    process.exit(1)
  }
}

function showStatus(): void {
  const count    = getHotelCount()
  const lastSync = getLastSync()

  console.log('\n📊  Sydenklar – Hotel database status')
  console.log(`  Hoteller i DB : ${count.toLocaleString()}`)

  if (lastSync?.ended_at) {
    const date = new Date(lastSync.ended_at * 1000).toLocaleString('nb-NO')
    console.log(`  Siste sync    : ${lastSync.type} – ${date}`)
    console.log(`  Importert     : ${(lastSync.inserted ?? 0).toLocaleString()}`)
  } else {
    console.log('  Siste sync    : Aldri utført')
  }
  console.log()
}

// --- Entrypoint ---

const cmd = process.argv[2]

if (cmd === 'full')          fullSync()
else if (cmd === 'incremental') incrementalSync()
else if (cmd === 'status')   showStatus()
else {
  console.log('Bruk: tsx scripts/sync-hotels.ts [full|incremental|status]')
  process.exit(1)
}
