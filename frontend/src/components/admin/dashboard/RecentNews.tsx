import { CalendarDays, Newspaper } from 'lucide-react'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { DashboardNews } from '../../../types/admin'
import { formatDay } from '../../../utils/newsEvents'
import ImageTile from '../common/ImageTile'
import SectionCard from '../common/SectionCard'
import StatusBadge from '../common/StatusBadge'

export default function RecentNews({ news }: { news: DashboardNews[] }) {
  return (
    <SectionCard title="Recent News" icon={Newspaper} viewAllPath={ADMIN_PATHS.newsEvents}>
      {news.length === 0 && <p className="py-6 text-center text-sm text-muted">No news posts yet.</p>}
      <ul className="divide-y divide-line">
        {news.map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 py-1.25 first:pt-0 last:pb-0">
            <ImageTile src={item.imageUrl} alt={item.title} className="h-14 w-21.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-medium text-ink">{item.title}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <CalendarDays className="size-3.5" /> {formatDay(item.publishedAt)}
              </p>
            </div>
            <StatusBadge label={item.status} tone={item.status === 'published' ? 'success' : 'neutral'} />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
