import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllArticles, formatPublishedAt } from '@/lib/reisetips'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Reisetips og reiseinspirasjon | Sydenklar',
  description: 'Guider, hotelltopper og reiseinspirasjoner fra Sydenklar. Finn de beste tipsene for din neste ferie — fra norske fjorder til sol og varme.',
  alternates: { canonical: 'https://www.sydenklar.no/reisetips' },
  openGraph: {
    title: 'Reisetips og reiseinspirasjon | Sydenklar',
    description: 'Guider, hotelltopper og reiseinspirasjoner fra Sydenklar.',
    url: 'https://www.sydenklar.no/reisetips',
  },
}

export default function ReisetipsPage() {
  const articles = getAllArticles()

  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      {/* Hero */}
      <div className="bg-[var(--deep)] pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-[var(--gold)] text-xs tracking-[3px] uppercase font-semibold mb-3">Reisetips</p>
          <h1 className="font-display text-3xl lg:text-4xl text-white mb-4">Reiseinspirasjon fra Sydenklar</h1>
          <p className="text-white/55 text-base max-w-xl">Guider, hotelltopper og praktiske tips — for deg som vil reise smart og godt.</p>
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <p className="text-[var(--muted)] text-center py-20">Ingen artikler ennå.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link
                  key={article.slug}
                  href={`/reisetips/${article.slug}`}
                  className="group bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--coral)] transition-colors flex flex-col"
                >
                  {/* Cover */}
                  <div className="aspect-[16/9] relative overflow-hidden bg-[var(--sand)]">
                    {article.coverImage && (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-[var(--sand)] text-[var(--muted)] text-xs px-2.5 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-display text-lg text-[var(--deep)] leading-snug mb-2 group-hover:text-[var(--coral)] transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-[var(--muted)] text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[var(--muted)] text-xs">
                        {formatPublishedAt(article.publishedAt)}
                      </span>
                      <span className="text-[var(--coral)] text-xs font-medium group-hover:underline">
                        Les mer →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
