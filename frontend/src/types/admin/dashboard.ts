import type { IconTone, Tone, Trend } from './common'

export interface DashboardStat extends IconTone {
  label: string
  value: number
  /** e.g. "3 this month" */
  note: string
  /** Omit for a neutral note with no arrow. */
  trend?: Trend
}

export type OverviewRange = '7d' | '30d' | '90d'

export interface VisitorPoint {
  /** ISO date, e.g. "2026-10-01" */
  date: string
  visitors: number
}

export interface OverviewMetric extends IconTone {
  label: string
  value: string
  /** Percentage change vs the previous period; null when there is nothing to compare with. */
  change: number | null
}

export interface QuickAction extends IconTone {
  label: string
  path: string
  badge?: number
}

export interface RecentMessage {
  id: number
  senderName: string
  subject: string
  receivedAt: string
  isRead: boolean
}

export type EventStatus = 'today' | 'upcoming'

export interface DashboardEvent {
  id: number
  title: string
  /** ISO date-time with the parish's offset */
  startsAt: string
  venue: string
  status: EventStatus
  tone: Tone
}

export type PublishStatus = 'published' | 'draft'

export interface DashboardNews {
  id: number
  title: string
  /** ISO date */
  publishedAt: string
  status: PublishStatus
  imageUrl?: string
}

export interface GalleryPhoto {
  id: number
  title: string
  imageUrl?: string
}

/** Counts and latest items from GET /api/dashboard/. */
export interface DashboardSummary {
  counts: {
    news: number
    newsThisMonth: number
    upcomingEvents: number
    eventsThisMonth: number
    photos: number
    photosThisMonth: number
    activeGroups: number
    messages: number
    unreadMessages: number
  }
  recentMessages: RecentMessage[]
  upcomingEvents: DashboardEvent[]
  recentNews: DashboardNews[]
  gallery: GalleryPhoto[]
}

/** Website visitors from GET /api/analytics/overview/. */
export interface VisitorOverview {
  series: VisitorPoint[]
  totals: VisitorTotals
  changes: Record<keyof VisitorTotals, number | null>
}

export interface VisitorTotals {
  views: number
  visitors: number
  avgSessionSeconds: number
  mobilePercent: number
}

// ---- API shapes (snake_case) ----

export interface DashboardSummaryApi {
  stats: {
    news: { total: number; this_month: number }
    events: { upcoming: number; this_month: number }
    photos: { total: number; this_month: number }
    groups: { active: number }
    messages: { total: number; unread: number }
  }
  recent_messages: { id: number; name: string; subject: string; created_at: string; is_read: boolean }[]
  upcoming_events: { id: number; title: string; starts_at: string; location: string; category: string }[]
  recent_news: { id: number; title: string; published_on: string; is_published: boolean; image: string | null }[]
  gallery: { id: number; title: string; image: string | null }[]
}

export interface VisitorOverviewApi {
  series: VisitorPoint[]
  totals: { views: number; visitors: number; avg_session_seconds: number; mobile_percent: number }
  changes: { views: number | null; visitors: number | null; avg_session_seconds: number | null; mobile_percent: number | null }
}
