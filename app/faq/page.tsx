import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FaqAccordion from '@/components/FaqAccordion'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ofte stilte spørsmål (FAQ) | Sydenklar',
  description: 'Svar på de vanligste spørsmålene om hotellbooking, betaling, avbestilling og mer på Sydenklar.no.',
  alternates: { canonical: 'https://www.sydenklar.no/faq' },
}

const FAQS = [
  {
    question: 'Hvordan bestiller jeg hotell på Sydenklar?',
    answer: 'Søk etter destinasjon, velg datoer og antall gjester, finn ønsket hotell og fullfør bestillingen. Du mottar en bekreftelse på e-post umiddelbart. Se vår fullstendige bestillingsveiledning for detaljer.',
  },
  {
    question: 'Er det trygt å betale på Sydenklar?',
    answer: 'Ja. All betaling skjer via Stripe, som er PCI DSS-sertifisert og bruker sterk kryptering. Vi lagrer aldri kortopplysningene dine på våre servere.',
  },
  {
    question: 'Kan jeg avbestille bookingen min?',
    answer: 'Det avhenger av romtypen du har valgt. Rater med «gratis avbestilling» kan kanselleres innen angitt frist. Ikke-refunderbare rater kan ikke avbestilles. Avbestillingsvilkårene vises alltid tydelig før du fullfører bestillingen.',
  },
  {
    question: 'Når trekkes pengene fra kontoen min?',
    answer: 'Betaling trekkes normalt ved bestillingstidspunktet. Noen hoteller tilbyr "betal på hotellet"-alternativ, der betaling skjer ved innsjekk — dette vises tydelig ved romvalg.',
  },
  {
    question: 'Kan jeg endre bookingen min?',
    answer: 'Endringer (datoer, romtype, antall gjester) avhenger av hotellets tilgjengelighet og vilkår. Kontakt oss på post@sydenklar.no med bookingrefereansen din, så hjelper vi deg.',
  },
  {
    question: 'Gjelder angrerettloven for hotellbooking?',
    answer: 'Nei. Angrerettloven §22 bokstav h gjør unntak for overnatting, transport og lignende tjenester på en bestemt dato. Dine rettigheter reguleres av hotellets egne avbestillingsvilkår.',
  },
  {
    question: 'Hvorfor er noen priser oppgitt uten frukost?',
    answer: 'Hoteller setter egne betingelser for hva som inkluderes. Noen rater inkluderer frukost, andre ikke. Dette fremgår alltid av romstypen du velger. Sjekk «Inkludert» i roomsdetaljer.',
  },
  {
    question: 'Hva gjør jeg hvis det er et problem ved hotellet?',
    answer: 'Ta først kontakt med hotellets resepsjon for å løse problemet på stedet. Dersom det ikke hjelper, kontakt oss på post@sydenklar.no eller ring 915 40 824.',
  },
  {
    question: 'Tilbyr Sydenklar pakkereiser med fly?',
    answer: 'Ja, vi jobber med å lansere fly + hotell-pakker snart. Meld deg på nyhetsbrevet for å bli varslet når pakkereiser er tilgjengelig.',
  },
  {
    question: 'Hvordan logger jeg inn på kontoen min?',
    answer: 'Klikk "Logg inn" i toppmenyen og skriv inn e-postadresse og passord. Har du ikke konto ennå, kan du opprette en gratis.',
  },
  {
    question: 'Hva gjør jeg hvis jeg ikke finner bookingbekreftelsen?',
    answer: 'Sjekk søppelpostmappen i e-postklienten din. Finner du den fortsatt ikke, kontakt oss på post@sydenklar.no med navn og bestillingsdato, så sender vi ny bekreftelse.',
  },
  {
    question: 'Hvordan melder jeg meg av nyhetsbrevet?',
    answer: 'Klikk "Meld deg av"-lenken nederst i en hvilken som helst e-post fra Sydenklar. Avmeldingen trer i kraft umiddelbart.',
  },
]

export default function FaqPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Hjelp</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Ofte stilte spørsmål</h1>
          <p className="text-white/55 text-base max-w-xl">Finner du ikke svar her? Ta kontakt på <a href="mailto:post@sydenklar.no" className="text-white/70 hover:text-white underline">post@sydenklar.no</a>.</p>
        </div>
      </div>

      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-2 mb-10">
            <FaqAccordion items={FAQS} />
          </div>

          <div className="bg-[var(--deep)] rounded-2xl p-8 text-center">
            <p className="font-display text-xl text-white mb-2">Fant du ikke svar?</p>
            <p className="text-white/50 text-sm mb-6">Vi hjelper deg gjerne direkte.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:post@sydenklar.no"
                className="inline-flex items-center justify-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
              >
                Send e-post
              </a>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
              >
                Kontaktskjema
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
