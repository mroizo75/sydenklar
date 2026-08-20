import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getCampaign, getActiveSubscribers, markCampaignSent } from '@/lib/newsletter-db'
import { sendCampaignBatch } from '@/lib/newsletter-sender'

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params

    const campaign = await getCampaign(id)
    if (!campaign) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    if (campaign.status === 'sent') return NextResponse.json({ error: 'Kampanjen er allerede sendt' }, { status: 400 })

    const subscribers = await getActiveSubscribers()
    if (subscribers.length === 0) return NextResponse.json({ error: 'Ingen aktive abonnenter' }, { status: 400 })

    await sendCampaignBatch(campaign, subscribers)
    await markCampaignSent(id, subscribers.length)

    return NextResponse.json({ sent: subscribers.length })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
