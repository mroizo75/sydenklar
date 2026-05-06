import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllArticles, getArticleBySlug, formatPublishedAt } from '@/lib/reisetips'
import { SITE_URL } from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  return {
    title: `${article.title} | Sydenklar Reisetips`,
    description: article.description,
    alternates: { canonical: `${SITE_URL}/reisetips/${slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/reisetips/${slug}`,
      publishedTime: article.publishedAt,
      images: article.coverImage
        ? [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }]
        : undefined,
    },
  }
}

export default async function ReisetipsArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Reisetips', item: `${SITE_URL}/reisetips` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/reisetips/${slug}` },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    image: article.coverImage || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Sydenklar',
      url: SITE_URL,
    },
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--sand-light)]">
      <Header />

      {/* Cover image */}
      {article.coverImage && (
        <div className="relative w-full aspect-[21/9] bg-[var(--sand)] overflow-hidden pt-16">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        </div>
      )}

      {/* Header block */}
      <div className={`bg-[var(--deep)] px-4 ${article.coverImage ? 'pt-8 pb-10' : 'pt-24 pb-10'}`}>
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/40 text-xs mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">Hjem</Link>
            <span>/</span>
            <Link href="/reisetips" className="hover:text-white/70 transition-colors">Reisetips</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <span key={tag} className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-display text-3xl lg:text-4xl text-white mb-3 leading-tight">
            {article.title}
          </h1>
          <p className="text-white/40 text-sm">
            Sydenklar Reisetips · {formatPublishedAt(article.publishedAt)}
          </p>
        </div>
      </div>

      {/* Article body */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose-sydenklar">
            <MDXRemote source={article.content} />
          </div>

          {/* CTA */}
          <div className="mt-12 bg-[var(--deep)] rounded-2xl p-8 text-center">
            <p className="font-display text-xl text-white mb-2">Klar for din neste reise?</p>
            <p className="text-white/50 text-sm mb-5">Søk blant over 2 millioner hoteller — alltid beste pris</p>
            <Link
              href="/hoteller"
              className="inline-flex items-center gap-2 bg-[var(--coral)] hover:bg-[var(--coral-dark)] text-white font-medium px-8 py-3 rounded-full transition-colors text-sm"
            >
              Søk hoteller nå
            </Link>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link href="/reisetips" className="text-[var(--muted)] hover:text-[var(--deep)] text-sm transition-colors">
              ← Tilbake til alle reisetips
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    </main>
  )
}
