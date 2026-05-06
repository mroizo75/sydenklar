import Link from 'next/link'
import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Slik bestiller du hotell | Sydenklar',
  description: 'Steg-for-steg veiledning for å søke, velge og bestille hotell på Sydenklar.no.',
  alternates: { canonical: 'https://www.sydenklar.no/hjelp/bestilling' },
}

const STEPS = [
  {
    num: '01',
    title: 'Søk etter hotell',
    text: 'Skriv inn destinasjon, innsjekk- og utsjekkdato samt antall gjester i søkefeltet på forsiden. Trykk "Søk" for å se tilgjengelige hoteller.',
  },
  {
    num: '02',
    title: 'Velg hotell og romtype',
    text: 'Bla gjennom søkeresultatene. Du kan filtrere på stjerneklasse, pris og fasiliteter. Klikk på et hotell for å se detaljer, bilder og tilgjengelige romtyper.',
  },
  {
    num: '03',
    title: 'Velg rom og avbestillingsvilkår',
    text: 'Velg ønsket romtype. Legg merke til om raten er gratis avbestillingbar eller ikke-refunderbar — dette vises tydelig for hvert alternativ.',
  },
  {
    num: '04',
    title: 'Fyll inn gjesteopplysninger',
    text: 'Oppgi navn og e-postadresse for hovedgjest. Sørg for at navn stemmer overens med reisedokumenter.',
  },
  {
    num: '05',
    title: 'Betal trygt',
    text: 'Fullfør betalingen med Visa, Mastercard eller annen tilgjengelig betalingsmetode. All betaling er kryptert og håndteres av Stripe.',
  },
  {
    num: '06',
    title: 'Motta bekreftelse',
    text: 'Du mottar en bookingbekreftelse på e-post innen få minutter. Ta vare på denne — den inneholder bookingrefereanse og innsjekkinformasjon.',
  },
]

export default function BestillingPage() {
  return (
    <ProseLayout
      title="Slik bestiller du hotell"
      subtitle="Bestillingsveiledning"
    >
      <p>Å bestille hotell på Sydenklar er raskt og enkelt. Følg stegene nedenfor, og har du spørsmål underveis er vi alltid tilgjengelig på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>.</p>

      <div className="space-y-6 my-8">
        {STEPS.map(step => (
          <div key={step.num} className="flex gap-5">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--deep)] flex items-center justify-center">
              <span className="text-[var(--gold)] text-xs font-bold">{step.num}</span>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-[var(--deep)] text-base mb-1">{step.title}</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <p className="!mb-0"><strong>Tips:</strong> Oppretter du en konto kan du følge alle bestillingene dine, laste ned kvitteringer og avbestille direkte fra «Min konto».</p>
      </div>

      <h2>Betaling og sikkerhet</h2>
      <p>Sydenklar bruker <strong>Stripe</strong> for all betalingsbehandling. Vi lagrer aldri kortopplysningene dine — disse behandles utelukkende i Stripes PCI DSS-sertifiserte miljø. Du vil se «Sydenklar» på kontoutskriften din.</p>

      <h2>Trenger du hjelp?</h2>
      <p>
        Kontakt oss på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a> eller ring <a href="tel:+4791540824">915 40 824</a>. Se også <Link href="/faq">ofte stilte spørsmål</Link> eller <Link href="/hjelp/avbestilling">avbestillingsveiledningen</Link>.
      </p>
    </ProseLayout>
  )
}
