import { ArrowRight, CalendarDays, Clock, MapPin, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { EventItem, QuickLink } from '../../../types/admin'
import { longDateParts, parishParts } from '../../../utils/newsEvents'
import Eyebrow from '../Eyebrow'
import QuickLinkCard from './QuickLinkCard'

function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="size-9 shrink-0 text-gold" strokeWidth={1.75} />
      <span className="pt-0.5 text-[0.9375rem] leading-snug font-bold text-primary">{children}</span>
    </li>
  )
}

// The event photo fades into the background towards the text.
const FADE_LEFT = 'linear-gradient(to right, transparent, black 35%)'

/** The next (or featured) event, with its photo on the right, and the quick-link cards below it. */
export default function UpcomingEvent({ event, links }: { event: EventItem | null; links: QuickLink[] }) {
  if (!event && !links.length) return null
  const when = event && longDateParts(event.startsAt)
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-mist via-white to-cream">
      {event?.image && (
        <img
          src={event.image}
          alt=""
          className="absolute top-0 right-0 hidden h-full w-[55%] object-cover object-top lg:block"
          style={{ maskImage: FADE_LEFT, WebkitMaskImage: FADE_LEFT }}
        />
      )}
      <div className="relative container-public py-14 lg:py-20">
        {event && when && (
          <div className="max-w-2xl">
            {event.image && <img src={event.image} alt="" className="mb-8 aspect-[16/10] w-full rounded-lg object-cover lg:hidden" />}
            <Eyebrow>Upcoming Event</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-tight font-bold text-primary sm:text-[3.5rem]">{event.title}</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{event.shortDescription}</p>
            <ul className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
              <Fact icon={CalendarDays}>
                {when.weekday},<br />
                {when.date}
              </Fact>
              <Fact icon={Clock}>{parishParts(event.startsAt).timeLabel}</Fact>
              {event.location && <Fact icon={MapPin}><span className="block max-w-48">{event.location}</span></Fact>}
            </ul>
            <Link
              to={PUBLIC_PATHS.newsEvents}
              className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-md bg-primary px-7 text-sm font-semibold text-white shadow-card transition hover:bg-primary-hover"
            >
              View All Events <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
        {links.length > 0 && (
          <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${event ? 'mt-14 lg:mt-16' : ''}`}>
            {links.map((link) => (
              <QuickLinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
