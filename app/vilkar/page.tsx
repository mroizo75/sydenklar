import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vilkår og betingelser | Sydenklar',
  description: 'Kjøpsvilkår og generelle betingelser for bruk av Sydenklar.no — hotellbooking, betaling og avbestilling.',
  alternates: { canonical: 'https://www.sydenklar.no/vilkar' },
}

export default function VilkarPage() {
  return (
    <ProseLayout
      title="Vilkår og betingelser"
      subtitle="Juridisk"
      lastUpdated="6. mai 2026"
    >
      <div className="info-box">
        <p className="!mb-0">Disse vilkårene gjelder for alle kjøp og tjenester på sydenklar.no. Ved å gjennomføre en bestilling aksepterer du disse vilkårene. Selger er <strong>Sydenklar AS</strong> (under registrering), Horgenveien 75, 3303 Hokksund. E-post: <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>.</p>
      </div>

      <h2>1. Om tjenesten</h2>
      <p>Sydenklar er en norsk reiseportal som lar deg søke, sammenligne og bestille hoteller og overnatting verden over. Sydenklar AS er selger og kontraktsmotpart for alle bestillinger gjort på sydenklar.no.</p>
      <p>Vi forbeholder oss retten til å endre priser, tilgjengelighet og vilkår uten forhåndsvarsel, i tråd med oppdatert tilgjengelighet fra våre leverandører.</p>

      <h2>2. Booking og bekreftelse</h2>
      <p>En booking er bindende når du mottar en skriftlig bekreftelse på e-post fra Sydenklar. Bekreftelsen inneholder bookingdetaljer, beløp og eventuelle avbestillingsfrister.</p>
      <p>Det er ditt ansvar å kontrollere at all informasjon i bekreftelsen er korrekt. Feil må meldes til oss umiddelbart på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>.</p>

      <h2>3. Priser og betaling</h2>
      <p>Alle priser er oppgitt i norske kroner (NOK) og inkluderer gjeldende skatter og avgifter, med mindre annet er tydelig angitt. Noen hoteller kan ha lokale skatter eller gebyrer som betales direkte på hotellet ved innsjekk.</p>
      <p>Betaling gjennomføres sikkert via <strong>Stripe</strong>. Vi aksepterer Visa, Mastercard, American Express og andre betalingsmetoder som tilbys ved kassen. Kortopplysninger lagres ikke hos Sydenklar.</p>
      <p>Beløpet trekkes ved bestillingstidspunktet, med mindre det gjelder en «betal på hotellet»-rate, der betaling skjer ved innsjekk.</p>

      <h2>4. Avbestilling og refusjon</h2>
      <p>Avbestillingsvilkår varierer per hotell og romtype, og vises tydelig før du fullfører bestillingen. Det finnes to hovedtyper:</p>
      <ul>
        <li><strong>Gratis avbestilling:</strong> Kan avbestilles uten kostnad innen angitt frist. Refusjon behandles innen 5–10 virkedager.</li>
        <li><strong>Ikke-refunderbar rate:</strong> Kan ikke avbestilles eller endres. Ingen refusjon gis.</li>
      </ul>
      <p>For å avbestille logger du inn på din konto og følger avbestillingsprosedyren, eller kontakter oss på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a> med bookingrefereansen din.</p>

      <h2>5. Angrerett</h2>
      <div className="warning-box">
        <p className="!mb-0"><strong>Merk:</strong> Angrerettloven §22 bokstav h gjør unntak for overnatting, transport, serveringstjenester og fritidsaktiviteter på en bestemt dato eller i et bestemt tidsrom. Kjøp av hotellrom på Sydenklar er derfor <strong>ikke</strong> gjenstand for 14-dagers angrerett. Dine rettigheter reguleres av hotellets egne avbestillingsvilkår slik de fremgår av bekreftelsen.</p>
      </div>

      <h2>6. Pakkereiser</h2>
      <p>Sydenklar tilbyr snart kombinerte pakkereiser med fly og hotell. Slike pakker vil være regulert av <strong>lov av 15. juni 2018 nr. 32 om pakkereiser og reisegaranti</strong> (Pakkereiseloven), som gjennomfører EU-direktiv 2015/2302 i norsk rett. Ved lansering av pakketilbud vil egne vilkår for pakkereiser gjelde og presenteres tydelig ved bestilling.</p>

      <h2>7. Reisedokumenter og innreisekrav</h2>
      <p>Det er ditt ansvar å ha gyldig pass, visum og oppfylle helseformelle krav for destinasjonen. Sydenklar er ikke ansvarlig for nektet innreise eller konsekvenser av manglende dokumenter.</p>

      <h2>8. Ansvarsbegrensning</h2>
      <p>Sydenklar er ikke ansvarlig for force majeure-hendelser, herunder naturkatastrofer, pandemier, streik, politisk uro eller andre hendelser utenfor vår kontroll som påvirker gjennomføringen av en reise.</p>
      <p>Sydenklar sitt erstatningsansvar er under enhver omstendighet begrenset til det beløpet du har betalt for den aktuelle bestillingen.</p>

      <h2>9. Klager og tvistløsning</h2>
      <p>Klager skal rettes til <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>. Vi bestreber å besvare alle klager innen 5 virkedager.</p>
      <p>Dersom vi ikke kommer til enighet, kan du bringe saken inn for <a href="https://www.forbrukerradet.no" target="_blank" rel="noopener">Forbrukerrådet</a> eller <a href="https://www.eu-oplysningen.dk/odr" target="_blank" rel="noopener">EU-kommisjonens nettbaserte klageportal (ODR)</a>.</p>

      <h2>10. Gjeldende lov og verneting</h2>
      <p>Disse vilkårene er underlagt norsk rett. Tvister som ikke løses i minnelighet, behandles av Numedal og Nedre Numedal tingrett som verneting.</p>

      <hr />
      <p className="text-sm">Spørsmål om kjøp eller vilkår? Ta kontakt på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a> eller ring <a href="tel:+4791540824">915 40 824</a>.</p>
    </ProseLayout>
  )
}
