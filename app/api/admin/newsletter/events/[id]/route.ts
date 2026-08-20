import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getEvent, updateEvent, deleteEvent } from '@/lib/newsletter-db'
import type { UpdateEventPayload } from '@/lib/newsletter-types'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params
    const event = await getEvent(id)
    if (!event) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    return NextResponse.json(event)
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params
    const body = await req.json() as UpdateEventPayload

    const existing = await getEvent(id)
    if (!existing) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const updated = await updateEvent(id, body)
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params

    const existing = await getEvent(id)
    if (!existing) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    await deleteEvent(id)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
