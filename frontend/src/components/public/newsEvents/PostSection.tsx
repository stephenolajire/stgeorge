import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import Eyebrow from '../Eyebrow'

interface PostSectionProps {
  eyebrow: string
  title: string
  /** "View All" in the header (on the overview), or "Load More" under the cards. */
  onViewAll?: () => void
  onLoadMore?: () => void
  loadingMore?: boolean
  empty: string
  count: number
  columns: string
  children: ReactNode
}

/** A heading with a grid of cards, plus View All / Load More buttons. */
export default function PostSection({ eyebrow, title, onViewAll, onLoadMore, loadingMore, empty, count, columns, children }: PostSectionProps) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow line>{eyebrow}</Eyebrow>
          <h2 className="mt-1.5 font-display text-2xl font-bold text-primary sm:text-[1.875rem]">{title}</h2>
        </div>
        {onViewAll && count > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex h-9.5 items-center gap-2 rounded-md border border-primary px-5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            View All <ArrowRight className="size-4" />
          </button>
        )}
      </div>
      {count === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line bg-surface py-12 text-center text-sm text-ink-soft">{empty}</p>
      ) : (
        <div className={`mt-6 grid gap-5 ${columns}`}>{children}</div>
      )}
      {onLoadMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-7 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  )
}
