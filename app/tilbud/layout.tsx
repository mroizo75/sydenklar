import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Hotelltilbud',
  description: 'Utvalgte hotelltilbud fra Sydenklar. Sammenlign pris og bestill overnatting direkte.',
  alternates: { canonical: 'https://www.sydenklar.no/tilbud' },
  openGraph: {
    title: 'Hotelltilbud | Sydenklar',
    description: 'Utvalgte hotelltilbud fra Sydenklar. Sammenlign pris og bestill overnatting direkte.',
    url: 'https://www.sydenklar.no/tilbud',
  },
}

export default function TilbudLayout({ children }: { children: ReactNode }) {
  return children
}
