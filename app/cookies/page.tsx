import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookiepolicy | Sydenklar',
  description: 'Informasjon om informasjonskapsler (cookies) på Sydenklar.no — hvilke vi bruker og hvorfor.',
  alternates: { canonical: 'https://www.sydenklar.no/cookies' },
}

export default function CookiesPage() {
  return (
    <ProseLayout
      title="Cookiepolicy"
      subtitle="Juridisk"
      lastUpdated="6. mai 2026"
    >
      <p>Sydenklar.no bruker informasjonskapsler (cookies) for å sikre at nettsiden fungerer som den skal og for å gi deg en god brukeropplevelse. Denne siden forklarer hvilke cookies vi bruker og hva de brukes til.</p>

      <h2>Hva er cookies?</h2>
      <p>En cookie er en liten tekstfil som lagres i nettleseren din når du besøker en nettside. Cookies gjør det mulig for nettsiden å huske deg og dine preferanser mellom besøkene.</p>

      <h2>1. Nødvendige cookies</h2>
      <p>Disse er strengt nødvendige for at nettsiden skal fungere og kan ikke deaktiveres.</p>
      <ul>
        <li><strong>Sesjonscookie</strong> — holder deg innlogget mens du navigerer på siden. Slettes når du lukker nettleseren.</li>
        <li><strong>CSRF-token</strong> — beskytter skjema og API-kall mot forfalskning av forespørsler (cross-site request forgery).</li>
        <li><strong>Stripe</strong> — Stripe setter cookies for å sikre og validere betalingstransaksjoner. Se <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener">Stripes cookiepolicy</a>.</li>
      </ul>

      <h2>2. Funksjonelle cookies</h2>
      <p>Disse husker dine valg og forbedrer brukeropplevelsen.</p>
      <ul>
        <li><strong>Søkehistorikk</strong> — lagrer dine siste søk lokalt i nettleseren (localStorage), ikke sendt til våre servere.</li>
        <li><strong>Valutapreferanse</strong> — husker valgt valuta mellom besøkene.</li>
      </ul>

      <h2>3. Statistikkcookies</h2>
      <p>Vi bruker for øyeblikket ingen tredjeparts analyseverktøy. Dersom dette endres, vil denne policyen oppdateres og du vil bli varslet.</p>

      <h2>4. Markedsføringscookies</h2>
      <p>Vi bruker ingen tredjeparts markedsføringscookies eller annonse-trackere på sydenklar.no per nå.</p>

      <h2>Slik administrerer du cookies</h2>
      <p>Du kan styre og slette cookies via nettleserens innstillinger. Vær oppmerksom på at deaktivering av nødvendige cookies kan påvirke funksjonaliteten til siden.</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/nb/kb/forbedret-sporingsbeskyttelse-i-firefox" target="_blank" rel="noopener">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/no-no/HT201265" target="_blank" rel="noopener">Safari</a></li>
        <li><a href="https://support.microsoft.com/nb-no/microsoft-edge/slette-informasjonskapsler-i-microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
      </ul>

      <h2>Endringer i cookiepolicyen</h2>
      <p>Vi kan oppdatere denne policyen. Vesentlige endringer vil varsles på nettsiden. Gjeldende versjon er alltid tilgjengelig på sydenklar.no/cookies.</p>

      <hr />
      <p className="text-sm">Spørsmål om cookies? Kontakt oss på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>.</p>
    </ProseLayout>
  )
}
