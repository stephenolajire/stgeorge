import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { DashboardEvent } from '../../../types/admin'
import { formatDayMonth, formatTime } from '../../../utils/format'
import { toneIcon } from '../../../utils/tone'
import SectionCard from '../common/SectionCard'
import StatusBadge from '../common/StatusBadge'

export default function UpcomingEvents({ events }: { events: DashboardEvent[] }) {
  return (
    <SectionCard title="Upcoming Events" icon={CalendarDays} viewAllPath={ADMIN_PATHS.newsEvents}>
      <ul className="divide-y divide-line">
        {events.map((event) => {
          const { day, month } = formatDayMonth(event.startsAt)
          return (
            <li key={event.id} className="flex items-center gap-3.5 py-1.25 first:pt-0 last:pb-0">
              <div
                className={`${toneIcon[event.tone]} flex size-14 shrink-0 flex-col items-center justify-center rounded-lg`}
              >
                <span className="font-display text-xl leading-none font-bold">{day}</span>
                <span className="mt-1 text-xs font-medium">{month}</span>
              </div>
              <div className="min-w-0 flex-1 space-y-px">
                <p className="truncate text-[0.8125rem] font-medium text-ink">{event.title}</p>
                <p className="flex items-center gap-1.5 text-[0.6875rem] text-muted">
                  <Clock className="size-3.5" /> {formatTime(event.startsAt)}
                </p>
                <p className="flex items-center gap-1.5 truncate text-[0.6875rem] text-muted">
                  <MapPin className="size-3.5 shrink-0" /> {event.venue}
                </p>
              </div>
              <StatusBadge label={event.status} tone="success" />
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
