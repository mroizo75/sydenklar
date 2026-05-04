import { Resend } from 'resend'
import { render } from '@react-email/render'
import { BookingConfirmationEmail, type BookingConfirmationProps } from '@/emails/BookingConfirmation'

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY mangler i environment')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM || 'booking@sydenklar.no'

export async function sendBookingConfirmationEmail(params: BookingConfirmationProps & { to: string }): Promise<void> {
  try {
    const resend = getResend()
    const html = await render(BookingConfirmationEmail(params))

    await resend.emails.send({
      from: `Sydenklar.no <${FROM}>`,
      to: params.to,
      subject: `Bookingbekreftelse – ${params.hotelName} (${params.partnerOrderId})`,
      html,
    })
  } catch (error: unknown) {
    // E-post er ikke kritisk — log og fortsett
    const err = error as { message?: string }
    console.error('[email] Kunne ikke sende bekreftelses-e-post:', err.message)
  }
}
