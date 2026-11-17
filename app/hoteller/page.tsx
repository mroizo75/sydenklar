import type { Metadata } from 'next'
import HotelSearchPage from '@/components/hotels/HotelSearchPage'

const CANONICAL = 'https://www.sydenklar.no/hoteller'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const hasQuery = Object.values(params).some(value => {
    if (Array.isArray(value)) return value.some(Boolean)
    return Boolean(value)
  })

  if (hasQuery) {
    return {
      title: 'Hotellsøk',
      description: 'Live hotellsøk hos Sydenklar. Velg datoer for å se priser og ledige rom.',
      robots: { index: false, follow: true },
    }
  }

  return {
    title: 'Søk og sammenlign hoteller',
    description:
      'Søk blant hoteller i Norge og utlandet. Sammenlign priser, se beliggenhet og bestill overnatting direkte hos Sydenklar.',
    alternates: { canonical: CANONICAL },
    openGraph: {
      title: 'Søk og sammenlign hoteller | Sydenklar',
      description:
        'Søk blant hoteller i Norge og utlandet. Sammenlign priser, se beliggenhet og bestill overnatting direkte hos Sydenklar.',
      url: CANONICAL,
    },
  }
}

export default function HotellerPage() {
  return <HotelSearchPage />
}
