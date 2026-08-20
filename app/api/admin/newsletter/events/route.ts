import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { listEvents, createEvent } from '@/lib/newsletter-db'
import type { CreateEventPayload } from '@/lib/newsletter-types'

export async function GET() {
  try {
    await requireAdminUser()
    const events = await listEvents()
    return NextResponse.json(events)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser()
    const body = await req.json() as CreateEventPayload

    if (!body.name?.trim())      return NextResponse.json({ error: 'name er påkrevd' },      { status: 400 })
    if (!body.slug?.trim())      return NextResponse.json({ error: 'slug er påkrevd' },      { status: 400 })
    if (!body.startDate?.trim()) return NextResponse.json({ error: 'startDate er påkrevd' }, { status: 400 })
    if (!body.endDate?.trim())   return NextResponse.json({ error: 'endDate er påkrevd' },   { status: 400 })

    const event = await createEvent(body)
    return NextResponse.json(event, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
