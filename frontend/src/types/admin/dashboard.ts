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
  /** Percentage change vs the previous period. */
  change: number
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

export type EventStatus = 'upcoming' | 'ongoing' | 'past'

export interface DashboardEvent {
  id: number
  title: string
  /** ISO date-time */
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

export interface DashboardData {
  stats: DashboardStat[]
  visitors: VisitorPoint[]
  overviewMetrics: OverviewMetric[]
  quickActions: QuickAction[]
  recentMessages: RecentMessage[]
  upcomingEvents: DashboardEvent[]
  recentNews: DashboardNews[]
  gallery: GalleryPhoto[]
}
