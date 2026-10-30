import api from '../../api/api'
import type { DashboardSummary, DashboardSummaryApi, OverviewRange, VisitorOverview, VisitorOverviewApi } from '../../types/admin'
import { parishToday, parishParts, toneFor } from '../../utils/newsEvents'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data: d } = await api.get<DashboardSummaryApi>('/dashboard/')
    const today = parishToday()
    return {
      counts: {
        news: d.stats.news.total,
        newsThisMonth: d.stats.news.this_month,
        upcomingEvents: d.stats.events.upcoming,
        eventsThisMonth: d.stats.events.this_month,
        photos: d.stats.photos.total,
        photosThisMonth: d.stats.photos.this_month,
        activeGroups: d.stats.groups.active,
        messages: d.stats.messages.total,
        unreadMessages: d.stats.messages.unread,
      },
      recentMessages: d.recent_messages.map((m) => ({ id: m.id, senderName: m.name, subject: m.subject, receivedAt: m.created_at, isRead: m.is_read })),
      upcomingEvents: d.upcoming_events.map((e) => ({
        id: e.id,
        title: e.title,
        startsAt: e.starts_at,
        venue: e.location,
        status: parishParts(e.starts_at).date === today ? 'today' : 'upcoming',
        tone: toneFor('events', e.category),
      })),
      recentNews: d.recent_news.map((n) => ({
        id: n.id,
        title: n.title,
        publishedAt: n.published_on,
        status: n.is_published ? 'published' : 'draft',
        imageUrl: n.image ?? undefined,
      })),
      gallery: d.gallery.map((p) => ({ id: p.id, title: p.title, imageUrl: p.image ?? undefined })),
    }
  },

  async getVisitorOverview(range: OverviewRange): Promise<VisitorOverview> {
    const { data: d } = await api.get<VisitorOverviewApi>('/analytics/overview/', { params: { range } })
    return {
      series: d.series,
      totals: { views: d.totals.views, visitors: d.totals.visitors, avgSessionSeconds: d.totals.avg_session_seconds, mobilePercent: d.totals.mobile_percent },
      changes: {
        views: d.changes.views,
        visitors: d.changes.visitors,
        avgSessionSeconds: d.changes.avg_session_seconds,
        mobilePercent: d.changes.mobile_percent,
      },
    }
  },
}
