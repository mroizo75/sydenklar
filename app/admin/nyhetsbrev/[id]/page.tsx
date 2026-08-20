import { requireAdminUser } from '@/lib/admin-auth'
import { getCampaign, listEvents } from '@/lib/newsletter-db'
import { notFound } from 'next/navigation'
import { CampaignEditor } from './CampaignEditor'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const campaign = await getCampaign(id)
  return { title: campaign ? `${campaign.name} — Admin` : 'Kampanje — Admin' }
}

export default async function CampaignPage({ params }: Props) {
  await requireAdminUser()
  const { id } = await params
  const [campaign, events] = await Promise.all([getCampaign(id), listEvents()])

  if (!campaign) notFound()

  return <CampaignEditor campaign={campaign} events={events} campaignId={id} />
}
