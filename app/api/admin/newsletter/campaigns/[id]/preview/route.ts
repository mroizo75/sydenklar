import { NextRequest, NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin-auth'
import { getCampaign } from '@/lib/newsletter-db'
import { CampaignEmail } from '@/emails/CampaignEmail'
import { render } from '@react-email/render'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminUser()
    const { id } = await params

    const campaign = await getCampaign(id)
    if (!campaign) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.sydenklar.no'

    const html = await render(CampaignEmail({
      subject:        campaign.subject,
      sections:       campaign.sections,
      theme:          campaign.theme,
      unsubscribeUrl: `${baseUrl}/nyhetsbrev/avmeldt?token=preview`,
      baseUrl,
    }))

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number }
    if (e.status === 401) return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    return NextResponse.json({ error: e.message ?? 'Intern feil' }, { status: 500 })
  }
}
