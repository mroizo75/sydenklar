import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personvernerklæring | Sydenklar',
  description: 'Les om hvordan Sydenklar behandler dine personopplysninger i henhold til GDPR og norsk personopplysningslov.',
  alternates: { canonical: 'https://www.sydenklar.no/personvern' },
}

export default function PersonvernPage() {
  return (
    <ProseLayout
      title="Personvernerklæring"
      subtitle="Juridisk"
      lastUpdated="6. mai 2026"
    >
      <div className="info-box">
        <p className="!mb-0"><strong>Behandlingsansvarlig:</strong> Sydenklar AS (under registrering), Horgenveien 75, 3303 Hokksund. E-post: <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>. Telefon: 915 40 824.</p>
      </div>

      <h2>1. Hvilke personopplysninger samler vi inn?</h2>
      <p>Vi samler inn følgende opplysninger når du bruker sydenklar.no:</p>
      <ul>
        <li><strong>Kontaktinformasjon:</strong> Navn, e-postadresse og telefonnummer ved booking eller kontoregistrering.</li>
        <li><strong>Betalingsinformasjon:</strong> Kortdetaljer behandles utelukkende av Stripe og lagres ikke hos oss.</li>
        <li><strong>Bookingdata:</strong> Innsjekk/utsjekk-datoer, antall gjester, romstype og bekreftelsesnummer.</li>
        <li><strong>Nyhetsbrev:</strong> E-postadresse og valgfritt fornavn ved påmelding.</li>
        <li><strong>Tekniske data:</strong> IP-adresse, nettlesertype og bruksmønster for feilsøking og sikkerhet.</li>
      </ul>

      <h2>2. Formål og rettslig grunnlag</h2>
      <ul>
        <li><strong>Gjennomføring av booking</strong> — nødvendig for å oppfylle avtale (GDPR art. 6 nr. 1 b).</li>
        <li><strong>Betaling og faktura</strong> — nødvendig for å oppfylle avtale og regnskapsplikt (GDPR art. 6 nr. 1 b og c).</li>
        <li><strong>Nyhetsbrev</strong> — samtykke (GDPR art. 6 nr. 1 a). Du kan trekke samtykke når som helst.</li>
        <li><strong>Kundeservice</strong> — berettiget interesse (GDPR art. 6 nr. 1 f).</li>
        <li><strong>Sikkerhet og feilsøking</strong> — berettiget interesse (GDPR art. 6 nr. 1 f).</li>
      </ul>

      <h2>3. Databehandlere vi benytter</h2>
      <p>Vi deler opplysninger med følgende aktører i det omfang som er nødvendig for å levere tjenesten:</p>
      <ul>
        <li><strong>Supabase Inc.</strong> — Databaselagring (EU-region). Databehandleravtale inngått.</li>
        <li><strong>Stripe Inc.</strong> — Betalingsbehandling. PCI DSS-sertifisert. Se <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripes personvern</a>.</li>
        <li><strong>Resend Inc.</strong> — E-postutsending (bekreftelser og nyhetsbrev).</li>
      </ul>
      <p>Vi selger aldri dine opplysninger til tredjeparter og deler ikke data til markedsformål uten ditt samtykke.</p>

      <h2>4. Lagringstid</h2>
      <ul>
        <li><strong>Bookingdata:</strong> Oppbevares i 5 år etter fullført opphold av hensyn til regnskapsplikt (bokføringsloven §13).</li>
        <li><strong>Nyhetsbrev-abonnenter:</strong> Inntil du melder deg av, deretter slettes innen 30 dager.</li>
        <li><strong>Kontodata:</strong> Inntil du sletter kontoen din.</li>
        <li><strong>Tekniske logger:</strong> Slettes etter 90 dager.</li>
      </ul>

      <h2>5. Dine rettigheter</h2>
      <p>Du har etter GDPR og norsk personopplysningslov rett til:</p>
      <ul>
        <li><strong>Innsyn</strong> — be om kopi av alle opplysninger vi har om deg.</li>
        <li><strong>Retting</strong> — be om at feil opplysninger korrigeres.</li>
        <li><strong>Sletting</strong> — be om at opplysningene slettes («retten til å bli glemt»).</li>
        <li><strong>Portabilitet</strong> — be om å få data i maskinlesbart format.</li>
        <li><strong>Begrensning</strong> — be om at behandlingen begrenses i visse tilfeller.</li>
        <li><strong>Innsigelse</strong> — protestere mot behandling basert på berettiget interesse.</li>
      </ul>
      <p>Send forespørsler til <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>. Vi svarer innen 30 dager.</p>
      <p>Du kan også klage til <a href="https://www.datatilsynet.no" target="_blank" rel="noopener">Datatilsynet</a> (datatilsynet.no).</p>

      <h2>6. Cookies</h2>
      <p>Vi bruker informasjonskapsler (cookies) for å sikre grunnleggende funksjonalitet og forbedre brukeropplevelsen. Se vår <a href="/cookies">cookiepolicy</a> for detaljer.</p>

      <h2>7. Sikkerhet</h2>
      <p>Vi bruker SSL/TLS-kryptering for all dataoverføring. Betalingsdata behandles aldri på våre servere — dette håndteres utelukkende av Stripe i et PCI DSS-sertifisert miljø.</p>

      <h2>8. Endringer i personvernerklæringen</h2>
      <p>Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles på e-post til registrerte brukere. Gjeldende versjon er alltid tilgjengelig på sydenklar.no/personvern.</p>

      <hr />
      <p className="text-sm">Spørsmål? Kontakt oss på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a> eller ring <a href="tel:+4791540824">915 40 824</a>.</p>
    </ProseLayout>
  )
}
