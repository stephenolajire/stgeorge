import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { DashboardEvent } from '../../../types/admin'
import { parishParts } from '../../../utils/newsEvents'
import { toneIcon } from '../../../utils/tone'
import SectionCard from '../common/SectionCard'
import StatusBadge from '../common/StatusBadge'

export default function UpcomingEvents({ events }: { events: DashboardEvent[] }) {
  return (
    <SectionCard title="Upcoming Events" icon={CalendarDays} viewAllPath={ADMIN_PATHS.newsEvents}>
      {events.length === 0 && <p className="py-6 text-center text-sm text-muted">No upcoming events. Add one in News &amp; Events.</p>}
      <ul className="divide-y divide-line">
        {events.map((event) => {
          const { day, month, timeLabel } = parishParts(event.startsAt)
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
                  <Clock className="size-3.5" /> {timeLabel}
                </p>
                <p className="flex items-center gap-1.5 truncate text-[0.6875rem] text-muted">
                  <MapPin className="size-3.5 shrink-0" /> {event.venue}
                </p>
              </div>
              <StatusBadge label={event.status} tone={event.status === 'today' ? 'warning' : 'success'} />
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
