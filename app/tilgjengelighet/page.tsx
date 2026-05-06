import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tilgjengelighetserklæring | Sydenklar',
  description: 'Sydenklar sitt arbeid med universell utforming og tilgjengelighet på nett etter WCAG 2.1.',
  alternates: { canonical: 'https://www.sydenklar.no/tilgjengelighet' },
}

export default function TilgjengelighetPage() {
  return (
    <ProseLayout
      title="Tilgjengelighetserklæring"
      subtitle="Universell utforming"
      lastUpdated="6. mai 2026"
    >
      <p>Sydenklar AS er forpliktet til å gjøre sydenklar.no tilgjengelig for alle, uavhengig av funksjonsnedsettelse. Denne erklæringen er utarbeidet i henhold til <strong>forskrift om universell utforming av IKT-løsninger</strong> (FOR-2013-06-21-732) og bygger på <strong>WCAG 2.1</strong>-retningslinjene.</p>

      <h2>Vår status</h2>
      <p>Vi arbeider løpende med å forbedre tilgjengeligheten på sydenklar.no. Nettsiden er delvis i samsvar med WCAG 2.1 nivå AA. Vi er klar over at det fremdeles finnes områder som ikke oppfyller alle krav, og vi jobber aktivt med å utbedre disse.</p>

      <h2>Kjente mangler</h2>
      <ul>
        <li>Noen bilder mangler alternative tekster (alt-tekst) — pågår.</li>
        <li>Visse interaktive komponenter har ikke fullstendige ARIA-etiketter — pågår.</li>
        <li>Fargekontrast i enkelte sekundære tekstfarger er under 4,5:1 — pågår.</li>
      </ul>

      <h2>Hva vi gjør</h2>
      <ul>
        <li>Semantisk HTML5-struktur med korrekte overskriftsnivåer.</li>
        <li>Tastaturnavigasjon er tilgjengelig for hovedelementer.</li>
        <li>Responsivt design som fungerer på mobil, nettbrett og desktop.</li>
        <li>Tekststørrelser kan skaleres i nettleseren uten tap av funksjonalitet.</li>
        <li>Fokusindikatorer er synlige på interaktive elementer.</li>
      </ul>

      <h2>Gi oss tilbakemelding</h2>
      <p>Opplever du tilgjengelighetsproblemer på sydenklar.no? Vi ønsker å høre fra deg slik at vi kan forbedre oss. Ta kontakt på:</p>
      <ul>
        <li>E-post: <a href="mailto:post@sydenklar.no">post@sydenklar.no</a></li>
        <li>Telefon: <a href="tel:+4791540824">915 40 824</a></li>
      </ul>

      <h2>Klageadgang</h2>
      <p>Dersom du mener vi ikke har håndtert din forespørsel på tilfredsstillende vis, kan du klage til <a href="https://www.uutilsynet.no" target="_blank" rel="noopener">Digitaliseringsdirektoratets tilsynsorgan for universell utforming</a> (uutilsynet.no).</p>

      <hr />
      <p className="text-sm">Denne erklæringen vil oppdateres løpende som arbeidet med universell utforming skrider frem.</p>
    </ProseLayout>
  )
}
