import { NextRequest, NextResponse } from 'next/server'
import { getDueCampaigns, getActiveSubscribers, markCampaignSent, updateCampaign } from '@/lib/newsletter-db'
import { sendCampaignBatch } from '@/lib/newsletter-sender'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })
    }
  }

  const results: { id: string; name: string; status: 'sent' | 'error'; error?: string; recipients?: number }[] = []

  try {
    const due = await getDueCampaigns()

    if (due.length === 0) {
      return NextResponse.json({ processed: 0, results })
    }

    const subscribers = await getActiveSubscribers()

    for (const campaign of due) {
      try {
        await sendCampaignBatch(campaign, subscribers)
        await markCampaignSent(campaign.id, subscribers.length)
        results.push({ id: campaign.id, name: campaign.name, status: 'sent', recipients: subscribers.length })
      } catch (err: unknown) {
        const e = err as { message?: string }
        await updateCampaign(campaign.id, { status: 'draft' })
        results.push({ id: campaign.id, name: campaign.name, status: 'error', error: e.message })
      }
    }

    return NextResponse.json({ processed: due.length, results })
  } catch (err: unknown) {
    const e = err as { message?: string }
    return NextResponse.json({ error: e.message ?? 'Intern feil', results }, { status: 500 })
  }
}
