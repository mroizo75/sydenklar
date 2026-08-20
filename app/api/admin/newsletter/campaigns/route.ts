import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { listCampaigns, createCampaign } from '@/lib/newsletter-db'
import type { CreateCampaignPayload } from '@/lib/newsletter-types'

export async function GET() {
  try {
    await requireAdminUser()
    const campaigns = await listCampaigns()
    return NextResponse.json(campaigns)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser()
    const body = await req.json() as CreateCampaignPayload

    if (!body.name?.trim())    return NextResponse.json({ error: 'name er påkrevd' },    { status: 400 })
    if (!body.subject?.trim()) return NextResponse.json({ error: 'subject er påkrevd' }, { status: 400 })
    if (!body.type)            return NextResponse.json({ error: 'type er påkrevd' },    { status: 400 })

    const campaign = await createCampaign(body)
    return NextResponse.json(campaign, { status: 201 })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
