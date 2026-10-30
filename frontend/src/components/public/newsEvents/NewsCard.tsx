import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react'
import type { NewsItem } from '../../../types/admin'
import { formatDay, toneFor } from '../../../utils/newsEvents'
import StatusBadge from '../../admin/common/StatusBadge'

/** News card: photo, date, title, summary, category and "Read More". */
export default function NewsCard({ post, onOpen }: { post: NewsItem; onOpen: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="aspect-[16/9] overflow-hidden bg-mist">
        {post.image ? (
          <img src={post.image} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-primary/30">
            <Newspaper className="size-12" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-xs text-ink-soft">
          <CalendarDays className="size-3.5 text-gold" /> {formatDay(post.publishedOn)}
        </p>
        <h3 className="mt-1.5 font-display text-[1.0625rem] leading-snug font-bold text-primary">{post.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink-soft">{post.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <StatusBadge label={post.categoryLabel} tone={toneFor('news', post.category)} />
          <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-primary hover:text-gold">
            Read More <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
