import { Resend } from 'resend'
import { render } from '@react-email/render'
import { CampaignEmail } from '@/emails/CampaignEmail'
import type { NewsletterCampaign } from './newsletter-types'

const BASE_URL       = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.sydenklar.no'
const FROM_ADDRESS   = process.env.RESEND_FROM ?? 'post@sydenklar.no'
const BATCH_SIZE     = 50

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw { code: 'CONFIG_ERROR', message: 'RESEND_API_KEY mangler' }
  return new Resend(key)
}

function buildUnsubscribeUrl(token: string): string {
  return `${BASE_URL}/nyhetsbrev/avmeldt?token=${token}`
}

export async function sendCampaignBatch(
  campaign: NewsletterCampaign,
  subscribers: { email: string; firstName?: string; unsubscribeToken: string }[]
): Promise<void> {
  const resend = getResend()

  for (let offset = 0; offset < subscribers.length; offset += BATCH_SIZE) {
    const batch = subscribers.slice(offset, offset + BATCH_SIZE)

    const emails = await Promise.all(
      batch.map(async sub => {
        const html = await render(CampaignEmail({
          subject:        campaign.subject,
          sections:       campaign.sections,
          theme:          campaign.theme,
          firstName:      sub.firstName,
          unsubscribeUrl: buildUnsubscribeUrl(sub.unsubscribeToken),
          baseUrl:        BASE_URL,
        }))
        return {
          from:    `Sydenklar.no <${FROM_ADDRESS}>`,
          to:      sub.email,
          subject: campaign.subject,
          html,
          headers: {
            'List-Unsubscribe': `<${buildUnsubscribeUrl(sub.unsubscribeToken)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }
      })
    )

    await resend.batch.send(emails)

    // Rate-limit buffer between batches
    if (offset + BATCH_SIZE < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
