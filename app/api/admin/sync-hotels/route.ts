import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { getHotelCount, getLastSync } from '@/lib/hotel-static-db'

const SYNC_SECRET = process.env.SYNC_SECRET || ''

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') || ''
  return SYNC_SECRET !== '' && auth === `Bearer ${SYNC_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const count    = getHotelCount()
  const lastSync = getLastSync()

  return NextResponse.json({
    hotels_in_db: count,
    last_sync: lastSync
      ? {
          type: lastSync.type,
          ended_at: new Date(lastSync.ended_at * 1000).toISOString(),
          inserted: lastSync.inserted,
        }
      : null,
  })
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const type: string = body?.type === 'incremental' ? 'incremental' : 'full'

  const scriptPath = path.join(process.cwd(), 'scripts', 'sync-hotels.ts')
  const tsxBin     = path.join(process.cwd(), 'node_modules', '.bin', 'tsx')

  const child = spawn(tsxBin, [scriptPath, type], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  })
  child.unref()

  return NextResponse.json({
    started: true,
    type,
    message: `${type === 'full' ? 'Full' : 'Inkrementell'} sync startet i bakgrunnen`,
  })
}
