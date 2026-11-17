import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Hotell',
  robots: { index: false, follow: false },
}

export default function HotellBookingLayout({ children }: { children: ReactNode }) {
  return children
}
