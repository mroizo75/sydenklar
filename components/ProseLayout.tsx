import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Props {
  title: string
  subtitle?: string
  lastUpdated?: string
  children: React.ReactNode
}

export default function ProseLayout({ title, subtitle, lastUpdated, children }: Props) {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      {/* Hero */}
      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {subtitle && (
            <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">
              {subtitle}
            </p>
          )}
          <h1 className="font-display text-3xl lg:text-4xl text-white">{title}</h1>
          {lastUpdated && (
            <p className="text-white/35 text-sm mt-3">Sist oppdatert: {lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto prose-sydenklar">
          {children}
        </div>
      </div>

      <Footer />
    </main>
  )
}
