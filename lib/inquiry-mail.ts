import { Resend } from 'resend'
import { offerTotal, type TripInquiry, type TripOffer } from './inquiries'
import { facilityLabel } from './hotel-preferences'

const FROM = process.env.RESEND_FROM || 'kontakt@sydenklar.no'
const TO = 'post@sydenklar.no'

const KIND_LABEL: Record<string, string> = {
  hotell: 'Hotell — egen bestilling',
  transfer: 'Transfer — egen bestilling',
  leiebil: 'Leiebil — egen bestilling',
  tog: 'Tog — egen bestilling',
  annet: 'Tilleggstjeneste — egen bestilling',
}

function resend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY mangler')
  return new Resend(key)
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function nok(amount: number): string {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(amount)
}

function dateNb(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function serviceSummary(inquiry: TripInquiry): string {
  const people = inquiry.adults + inquiry.children
  const wanted = [
    inquiry.services.hotell && (inquiry.services.starsMin ? `Hotellkatalog fra ${inquiry.services.starsMin} stjerner` : 'Hotellkatalog'),
    inquiry.services.transfer && 'Transfer',
    inquiry.services.leiebil && 'Leiebil',
    inquiry.services.tog && 'Tog',
  ].filter(Boolean)
  const parts = [
    `${people} personer til ${inquiry.destination}`,
    inquiry.flexibleDates
      ? `${inquiry.checkIn}–${inquiry.checkOut} (omtrentlig, sjekk nabodager for bedre pris)`
      : `${inquiry.checkIn}–${inquiry.checkOut} (datoene er viktige)`,
    wanted.length ? `Ønsker: ${wanted.join(', ')}` : 'Ingen tjenester valgt',
    inquiry.budgetNok ? `Budsjett ${nok(inquiry.budgetNok)}` : 'Budsjett ikke oppgitt',
  ]
  if (inquiry.services.facilities.length) {
    parts.push(`Fasiliteter: ${inquiry.services.facilities.map(facilityLabel).join(', ')}`)
  }
  if (inquiry.notes) parts.push(inquiry.notes)
  return parts.join('\n')
}

export async function sendInquiryEmails(inquiry: TripInquiry): Promise<void> {
  const client = resend()
  const budget = inquiry.budgetNok ? nok(inquiry.budgetNok) : 'Ikke oppgitt'
  const guests = `${inquiry.adults} voksne${inquiry.children ? `, ${inquiry.children} barn` : ''}${inquiry.childAges ? ` (${inquiry.childAges})` : ''}`

  await client.emails.send({
    from: `Sydenklar <${FROM}>`,
    to: TO,
    replyTo: inquiry.email,
    subject: `Skreddersydd forespørsel: ${inquiry.destination}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; color: #0F1923;">
        <p style="margin: 0 0 8px; color: #C9A84C; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Ny forespørsel</p>
        <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">${esc(inquiry.destination)}</h1>
        <p><strong>${esc(inquiry.name)}</strong> &lt;${esc(inquiry.email)}&gt;<br>${esc(inquiry.phone)}</p>
        <p>${esc(dateNb(inquiry.checkIn))} – ${esc(dateNb(inquiry.checkOut))}${inquiry.flexibleDates ? ' — omtrentlig, flytt dagene om det gir bedre pris' : ' — datoene er viktige'}<br>
        ${esc(guests)}, ${inquiry.rooms} rom<br>Budsjett: ${esc(budget)}</p>
        <p style="white-space: pre-wrap; background: #F8F9FB; padding: 12px 14px; border-radius: 8px;">${esc(serviceSummary(inquiry))}</p>
        ${inquiry.flightHelp ? `<p><strong>Flyformidling:</strong> ${esc(inquiry.departureAirport || 'avgangssted ikke oppgitt')}. Ikke ta med flypris i tilbudet.</p>` : '<p>Kunden ba ikke om hjelp til fly.</p>'}
        ${inquiry.notes ? `<p style="white-space: pre-wrap;"><strong>Merknad</strong><br>${esc(inquiry.notes)}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sydenklar.no'}/admin/foresporsler/${inquiry.id}">Åpne i admin og send tilbud</a></p>
      </div>
    `,
  })

  await client.emails.send({
    from: `Sydenklar <${FROM}>`,
    to: inquiry.email,
    replyTo: TO,
    subject: 'Vi har fått forespørselen din',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; color: #374151;">
        <p style="margin: 0 0 8px; color: #C9A84C; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Sydenklar.no</p>
        <h1 style="color: #0F1923; font-size: 22px; font-weight: 500;">Takk, ${esc(inquiry.name.split(' ')[0] || inquiry.name)}</h1>
        <p>Vi har fått ønsket ditt om ${esc(inquiry.destination)} for ${inquiry.adults + inquiry.children} personer. Du hører fra oss med et tilbud, vanligvis innen én virkedag. Vil du heller ta det på telefon, ring 915 40 824.</p>
        <p>${inquiry.services.hotell ? 'Hotellene sender vi som en katalog du kan bla i. ' : ''}Transfer, leiebil og tog prises hver for seg. Fly selger vi ikke.</p>
        <p style="color: #6B7280; font-size: 13px;">Spørsmål? Svar på denne e-posten, eller skriv til post@sydenklar.no.</p>
      </div>
    `,
  })
}

export async function sendOfferEmail(inquiry: TripInquiry, offer: TripOffer): Promise<void> {
  const client = resend()
  const rows = offer.lines
    .map(
      line => `
      <tr>
        <td style="padding: 12px 0; border-top: 1px solid #F3F4F6; vertical-align: top;">
          <div style="font-size: 11px; letter-spacing: 0.4px; text-transform: uppercase; color: #9CA3AF;">${esc(KIND_LABEL[line.kind] ?? line.kind)}</div>
          <div style="font-weight: 600; color: #0F1923; margin-top: 2px;">${esc(line.title)}</div>
          ${line.detail ? `<div style="color: #6B7280; font-size: 13px; margin-top: 2px;">${esc(line.detail)}</div>` : ''}
        </td>
        <td style="padding: 12px 0; border-top: 1px solid #F3F4F6; text-align: right; font-weight: 600; color: #0F1923; white-space: nowrap; vertical-align: top;">${esc(nok(line.priceNok))}</td>
      </tr>`,
    )
    .join('')

  const flightBlock = offer.flightNote
    ? `
      <div style="margin-top: 20px; background: #F8F9FB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px;">
        <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #6B7280;">Fly — formidles separat</p>
        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${esc(offer.flightNote)}</p>
        <p style="margin: 8px 0 0; color: #6B7280; font-size: 13px;">Dette beløpet inngår ikke i summen over, og er ikke en bestilling hos Sydenklar.</p>
      </div>`
    : ''

  await client.emails.send({
    from: `Sydenklar <${FROM}>`,
    to: inquiry.email,
    replyTo: TO,
    subject: `Tilbud: ${inquiry.destination} — egne bestillinger`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F8F9FB; padding: 28px 16px;">
        <div style="background: #0F1923; border-radius: 12px 12px 0 0; padding: 28px 24px;">
          <p style="margin: 0 0 8px; color: #C9A84C; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Sydenklar.no</p>
          <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 400;">Tilbud til ${esc(inquiry.destination)}</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">Hei ${esc(inquiry.name.split(' ')[0] || inquiry.name)},</p>
          ${offer.intro ? `<p style="margin: 0 0 16px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${esc(offer.intro)}</p>` : ''}
          <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">Under er tjenestene priset hver for seg. Hver linje er en egen bestilling hos Sydenklar, med egne vilkår. Dette er ikke en pakkereise.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${rows}
            <tr>
              <td style="padding: 14px 0 4px; border-top: 2px solid #E5E7EB; font-weight: 700; color: #0F1923;">Sum for egne bestillinger</td>
              <td style="padding: 14px 0 4px; border-top: 2px solid #E5E7EB; text-align: right; font-weight: 700; font-size: 18px; color: #0F1923;">${esc(nok(offerTotal(offer)))}</td>
            </tr>
          </table>
          ${flightBlock}
          <p style="margin: 20px 0 0; color: #6B7280; font-size: 13px;">Tilbudet gjelder til ${esc(dateNb(offer.validUntil))}. Svar på denne e-posten om du vil gå videre, så setter vi i gang hver bestilling for seg.</p>
        </div>
      </div>
    `,
  })
}
