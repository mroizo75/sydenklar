import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Kontakt oss',
  description: 'Kontakt Sydenklar om booking, avbestilling og betaling. Vi svarer på post@sydenklar.no.',
  alternates: { canonical: 'https://www.sydenklar.no/kontakt' },
  openGraph: {
    title: 'Kontakt oss | Sydenklar',
    description: 'Kontakt Sydenklar om booking, avbestilling og betaling.',
    url: 'https://www.sydenklar.no/kontakt',
  },
}

export default function KontaktLayout({ children }: { children: ReactNode }) {
  return children
}
