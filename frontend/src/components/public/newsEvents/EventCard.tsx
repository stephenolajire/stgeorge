import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react'
import type { EventItem } from '../../../types/admin'
import { parishParts, toneFor } from '../../../utils/newsEvents'
import StatusBadge from '../../admin/common/StatusBadge'

/** Event card: photo with a navy date badge, time, place and category. The whole card opens the details. */
export default function EventCard({ event, onOpen }: { event: EventItem; onOpen: () => void }) {
  const when = parishParts(event.startsAt)
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-primary/30">
            <CalendarDays className="size-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex w-14 flex-col items-center rounded-md bg-primary py-1.5 text-white shadow-card">
          <span className="font-display text-xl leading-none font-bold">{when.day}</span>
          <span className="mt-0.5 text-[0.625rem] font-semibold tracking-wider text-accent">{when.month}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[1.0625rem] leading-snug font-bold text-primary">
          <button type="button" onClick={onOpen} className="text-left after:absolute after:inset-0 focus:outline-none">
            {event.title}
          </button>
        </h3>
        <ul className="mt-2.5 space-y-1.5 text-[0.8125rem] text-ink-soft">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-gold" /> {when.dateLabel} · {when.timeLabel}
          </li>
          {event.location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-gold" /> <span className="line-clamp-1">{event.location}</span>
            </li>
          )}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-4">
          <StatusBadge label={event.categoryLabel} tone={toneFor('events', event.category)} />
          <span className="grid size-8 place-items-center rounded-full border border-line text-primary transition group-hover:border-accent group-hover:bg-accent" aria-hidden>
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
