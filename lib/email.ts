import { Resend } from 'resend'
import { render } from '@react-email/render'
import { BookingConfirmationEmail, type BookingConfirmationProps } from '@/emails/BookingConfirmation'

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY mangler i environment')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM || 'booking@sydenklar.no'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'

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
    const err = error as { message?: string }
    console.error('[email] Kunne ikke sende bekreftelses-e-post:', err.message)
  }
}

export async function sendPaymentLinkEmail(params: {
  to: string
  guestName: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  amount: number
  currency: string
  paymentUrl: string
  partnerOrderId: string
}): Promise<void> {
  try {
    const resend = getResend()
    const amountFmt = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: params.currency, maximumFractionDigits: 0 }).format(params.amount)
    const checkInFmt = new Date(params.checkIn).toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })
    const checkOutFmt = new Date(params.checkOut).toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #F8F9FB; padding: 32px 24px;">
        <div style="background: #0F1923; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
          <p style="margin: 0 0 8px; color: #C9A84C; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;">Sydenklar.no</p>
          <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 400;">Din reise er klar til betaling</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
            Hei ${params.guestName},<br><br>
            Vi har klargjort en hotellbooking til deg. Trykk på knappen nedenfor for å fullføre betalingen og bekrefte reisen.
          </p>
          <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
              <tr><td style="padding: 6px 0; color: #6B7280; width: 130px;">Hotell</td><td style="padding: 6px 0; font-weight: 600;">${params.hotelName}</td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Rom</td><td style="padding: 6px 0; border-top: 1px solid #F3F4F6;">${params.roomName}</td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Innsjekk</td><td style="padding: 6px 0; border-top: 1px solid #F3F4F6;">${checkInFmt}</td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Utsjekk</td><td style="padding: 6px 0; border-top: 1px solid #F3F4F6;">${checkOutFmt} (${params.nights} netter)</td></tr>
              <tr><td style="padding: 6px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Gjester</td><td style="padding: 6px 0; border-top: 1px solid #F3F4F6;">${params.adults} voksne</td></tr>
              <tr style="background: rgba(201,168,76,0.05);"><td style="padding: 10px 8px; color: #6B7280; border-top: 2px solid #E5E7EB; font-weight: 700;">Totalt</td><td style="padding: 10px 8px; border-top: 2px solid #E5E7EB; font-weight: 700; font-size: 18px; color: #0F1923;">${amountFmt}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${params.paymentUrl}" style="display: inline-block; background: #E5623E; color: #fff; padding: 16px 40px; border-radius: 32px; text-decoration: none; font-size: 16px; font-weight: 700; letter-spacing: 0.3px;">
              Betal og bekreft reisen →
            </a>
          </div>
          <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-align: center; line-height: 1.6;">
            Bestillingsnr: <strong>${params.partnerOrderId}</strong><br>
            Linken er gyldig i 24 timer. Har du spørsmål? Svar på denne e-posten eller kontakt oss på <a href="mailto:post@sydenklar.no" style="color: #E5623E;">post@sydenklar.no</a>
          </p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: `Sydenklar.no <${FROM}>`,
      to: params.to,
      subject: `Klar til betaling: ${params.hotelName} ${checkInFmt}`,
      html,
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('[email] Kunne ikke sende betalingslink-e-post:', err.message)
  }
}

export async function sendAdminBookingNotification(params: {
  partnerOrderId: string
  guestName: string
  guestEmail: string
  hotelName: string
  checkIn: string
  checkOut: string
  adults: number
  amount: number
  currency: string
}): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  if (adminEmails.length === 0) return

  try {
    const resend = getResend()
    const adminUrl = `${BASE_URL}/admin/bestilling/${params.partnerOrderId}`
    const amountFmt = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: params.currency, maximumFractionDigits: 0 }).format(params.amount)

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #F8F9FB;">
        <div style="background: #0F1923; border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
          <p style="margin: 0; color: #C9A84C; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;">Ny bestilling</p>
          <h1 style="margin: 8px 0 0; color: #fff; font-size: 22px; font-weight: 400;">${params.hotelName}</h1>
        </div>
        <div style="background: #fff; padding: 28px 24px; border: 1px solid #E5E7EB; border-top: none;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6B7280; width: 140px;">Bestillingsnr.</td><td style="padding: 8px 0; font-weight: 700; font-family: monospace; color: #0F1923;">${params.partnerOrderId}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Gjest</td><td style="padding: 8px 0; border-top: 1px solid #F3F4F6;">${params.guestName} &lt;${params.guestEmail}&gt;</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Inn/ut</td><td style="padding: 8px 0; border-top: 1px solid #F3F4F6;">${params.checkIn} → ${params.checkOut}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Voksne</td><td style="padding: 8px 0; border-top: 1px solid #F3F4F6;">${params.adults}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280; border-top: 1px solid #F3F4F6;">Beløp</td><td style="padding: 8px 0; border-top: 1px solid #F3F4F6; font-weight: 700; color: #15803D; font-size: 18px;">${amountFmt}</td></tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #0F1923; color: #fff; padding: 12px 28px; border-radius: 28px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Se bestilling i admin →
            </a>
          </div>
        </div>
      </div>
    `

    await resend.emails.send({
      from: `Sydenklar.no <${FROM}>`,
      to: adminEmails,
      subject: `✅ Ny bestilling: ${params.hotelName} — ${amountFmt}`,
      html,
    })
  } catch {
    // Intern varsling er ikke kritisk
  }
}
