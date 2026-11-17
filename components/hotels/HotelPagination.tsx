import Link from 'next/link'

interface HotelPaginationProps {
  page: number
  pageCount: number
  path: string
}

function pageHref(path: string, page: number): string {
  if (page <= 1) return path
  return `${path}?side=${page}`
}

export function HotelPagination({ page, pageCount, path }: HotelPaginationProps) {
  if (pageCount <= 1) return null

  const prev = page > 1 ? pageHref(path, page - 1) : null
  const next = page < pageCount ? pageHref(path, page + 1) : null

  return (
    <nav aria-label="Sider med hoteller" className="mt-10 flex items-center justify-center gap-4">
      {prev ? (
        <Link href={prev} className="text-sm font-medium text-[var(--deep)] hover:text-[var(--coral)]">
          Forrige
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]">Forrige</span>
      )}
      <span className="text-sm text-[var(--muted)]">
        Side {page} av {pageCount}
      </span>
      {next ? (
        <Link href={next} className="text-sm font-medium text-[var(--deep)] hover:text-[var(--coral)]">
          Neste
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]">Neste</span>
      )}
    </nav>
  )
}
