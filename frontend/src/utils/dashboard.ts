import { Calendar, Clock, Eye, FileText, Image, Mail, Smartphone, Users } from 'lucide-react'
import { ADMIN_PATHS } from '../routes/adminRoute'
import type { DashboardStat, DashboardSummary, OverviewMetric, QuickAction, VisitorOverview } from '../types/admin'

const thisMonth = (n: number) => `${n.toLocaleString()} this month`

/** The five cards at the top of the dashboard. */
export function dashboardStats({ counts: c }: DashboardSummary): DashboardStat[] {
  return [
    { label: 'Total News', value: c.news, note: thisMonth(c.newsThisMonth), trend: c.newsThisMonth ? 'up' : undefined, icon: FileText, tone: 'info' },
    { label: 'Upcoming Events', value: c.upcomingEvents, note: thisMonth(c.eventsThisMonth), trend: c.eventsThisMonth ? 'up' : undefined, icon: Calendar, tone: 'success' },
    { label: 'Gallery Photos', value: c.photos, note: thisMonth(c.photosThisMonth), trend: c.photosThisMonth ? 'up' : undefined, icon: Image, tone: 'violet' },
    { label: 'Parish Groups', value: c.activeGroups, note: 'Active groups', icon: Users, tone: 'warning' },
    { label: 'Contact Messages', value: c.messages, note: `${c.unreadMessages.toLocaleString()} unread`, trend: c.unreadMessages ? 'down' : undefined, icon: Mail, tone: 'danger' },
  ]
}

export function quickActions(unread: number): QuickAction[] {
  return [
    { label: 'Add News Post', path: ADMIN_PATHS.newsEvents, icon: FileText, tone: 'info' },
    { label: 'Create Event', path: ADMIN_PATHS.newsEvents, icon: Calendar, tone: 'success' },
    { label: 'Upload Photos', path: ADMIN_PATHS.gallery, icon: Image, tone: 'violet' },
    { label: 'Update Mass Times', path: ADMIN_PATHS.massTimes, icon: Clock, tone: 'warning' },
    { label: 'View Messages', path: ADMIN_PATHS.messages, icon: Mail, tone: 'danger', badge: unread || undefined },
  ]
}

/** 192 -> "3m 12s" */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  return m < 60 ? `${m}m ${seconds % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`
}

/** The four figures under the visitor chart. */
export function overviewMetrics({ totals: t, changes: c }: VisitorOverview): OverviewMetric[] {
  return [
    { label: 'Total Views', value: t.views.toLocaleString(), change: c.views, icon: Eye, tone: 'info' },
    { label: 'Unique Visitors', value: t.visitors.toLocaleString(), change: c.visitors, icon: Users, tone: 'info' },
    { label: 'Avg. Session', value: formatDuration(t.avgSessionSeconds), change: c.avgSessionSeconds, icon: Clock, tone: 'info' },
    { label: 'Mobile Users', value: `${t.mobilePercent}%`, change: c.mobilePercent, icon: Smartphone, tone: 'info' },
  ]
}
