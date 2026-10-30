import type { PostKind, Tone } from '../types/admin'
import { PARISH_TIME_ZONE } from './siteConfig'

/** Badge colour for each category. Keys match the server's EventCategory / NewsCategory. */
export const CATEGORY_TONES: Record<PostKind, Record<string, Tone>> = {
  events: {
    mass: 'info',
    retreat: 'violet',
    celebration: 'danger',
    thanksgiving: 'warning',
    prayer: 'info',
    youth: 'danger',
    talk: 'success',
    other: 'neutral',
  },
  news: { announcement: 'warning', parish_activity: 'info', outreach: 'success', other: 'neutral' },
}

export const toneFor = (kind: PostKind, category: string): Tone => CATEGORY_TONES[kind][category] ?? 'neutral'

export const EVENT_WHEN_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'month', label: 'This Month' },
  { value: 'past', label: 'Past Events' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

/** Parts of a moment in parish time: for date badges, labels and the editor's date/time inputs. */
export function parishParts(iso: string) {
  const at = new Date(iso)
  const get = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: PARISH_TIME_ZONE, ...options }).format(at)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: PARISH_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  )
  return {
    /** YYYY-MM-DD */
    date: `${parts.year}-${parts.month}-${parts.day}`,
    /** HH:MM (24-hour) */
    time: `${parts.hour}:${parts.minute}`,
    day: parts.day,
    month: get({ month: 'short' }).toUpperCase(),
    year: parts.year,
    /** "Nov 29, 2026" */
    dateLabel: get({ month: 'short', day: 'numeric', year: 'numeric' }),
    /** "4:00 PM" */
    timeLabel: get({ hour: 'numeric', minute: '2-digit' }),
  }
}

/** "2026-10-25" -> "Oct 25, 2026" (calendar date, no time zone shift). */
export function formatDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Today in parish time, YYYY-MM-DD. */
export const parishToday = () => parishParts(new Date().toISOString()).date
