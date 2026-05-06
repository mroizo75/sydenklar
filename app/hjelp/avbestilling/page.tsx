import Link from 'next/link'
import ProseLayout from '@/components/ProseLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avbestilling og refusjon | Sydenklar',
  description: 'Alt du trenger å vite om avbestilling av hotell på Sydenklar — frister, refusjon og prosedyre.',
  alternates: { canonical: 'https://www.sydenklar.no/hjelp/avbestilling' },
}

export default function AvbestillingPage() {
  return (
    <ProseLayout
      title="Avbestilling og refusjon"
      subtitle="Hjelp"
    >
      <p>Avbestillingsvilkårene varierer avhengig av hotell og romtype du har bestilt. Vilkårene vises tydelig på bestillingssiden før du fullfører kjøpet.</p>

      <h2>To typer rater</h2>

      <div className="grid sm:grid-cols-2 gap-4 my-6">
        <div className="bg-white rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="font-semibold text-green-800 text-sm">Gratis avbestilling</p>
          </div>
          <p className="text-[var(--muted)] text-sm leading-relaxed">Kan avbestilles gratis innen den angitte fristen. Etter fristen kan gebyr påløpe. Full refusjon behandles innen 5–10 virkedager.</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            <p className="font-semibold text-red-800 text-sm">Ikke-refunderbar</p>
          </div>
          <p className="text-[var(--muted)] text-sm leading-relaxed">Kan ikke avbestilles eller endres. Beløpet refunderes ikke uansett årsak. Disse ratene er som regel rimeligere.</p>
        </div>
      </div>

      <div className="warning-box">
        <p className="!mb-0"><strong>Husk:</strong> Angrerettloven gjelder ikke for overnatting (angrerettloven §22 bokstav h). Dine rettigheter reguleres av hotellets avbestillingsvilkår som vist ved bestilling.</p>
      </div>

      <h2>Slik avbestiller du</h2>
      <ol>
        <li><strong>Logg inn</strong> på din konto på sydenklar.no under «Min konto».</li>
        <li>Finn den aktuelle bookingen og klikk «Avbestill».</li>
        <li>Bekreft avbestillingen. Du mottar bekreftelse på e-post.</li>
      </ol>
      <p>Alternativt kan du sende bookingrefereansen din til <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>, så ordner vi det for deg.</p>

      <h2>Refusjon</h2>
      <p>For bookinger med gratis avbestilling behandles refusjonen innen <strong>5–10 virkedager</strong> etter at avbestillingen er bekreftet. Beløpet krediteres samme betalingsmetode som ble brukt ved bestilling.</p>
      <p>Behandlingstiden kan variere avhengig av kortutsteders prosesseringstid.</p>

      <h2>Force majeure</h2>
      <p>Ved ekstraordinære omstendigheter som naturkatastrofer, pandemi eller politisk uro, oppfordrer vi deg til å kontakte oss. Vi gjør vårt beste for å finne en løsning i samarbeid med hotellet, selv om ordinære avbestillingsvilkår gjelder.</p>

      <h2>Endring av booking</h2>
      <p>Behov for å endre datoer eller annet? Ta kontakt med oss på <a href="mailto:post@sydenklar.no">post@sydenklar.no</a>. Mulighet for endring avhenger av hotellets tilgjengelighet og vilkår.</p>

      <hr />
      <p className="text-sm">Spørsmål? <a href="mailto:post@sydenklar.no">post@sydenklar.no</a> · <a href="tel:+4791540824">915 40 824</a> · Se også <Link href="/vilkar">kjøpsvilkår</Link> og <Link href="/faq">FAQ</Link>.</p>
    </ProseLayout>
  )
}
