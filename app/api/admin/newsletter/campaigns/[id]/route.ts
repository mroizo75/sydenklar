import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getCampaign, updateCampaign, deleteCampaign } from '@/lib/newsletter-db'
import type { UpdateCampaignPayload } from '@/lib/newsletter-types'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params
    const campaign = await getCampaign(id)
    if (!campaign) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    return NextResponse.json(campaign)
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
    const body = await req.json() as UpdateCampaignPayload

    const existing = await getCampaign(id)
    if (!existing) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    if (existing.status === 'sent') return NextResponse.json({ error: 'Kan ikke redigere sendte kampanjer' }, { status: 400 })

    const updated = await updateCampaign(id, body)
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

    const existing = await getCampaign(id)
    if (!existing) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    if (existing.status === 'sent') return NextResponse.json({ error: 'Kan ikke slette sendte kampanjer' }, { status: 400 })

    await deleteCampaign(id)
    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
