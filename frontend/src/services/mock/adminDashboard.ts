import { Calendar, Clock, Eye, FileText, Image, Mail, Smartphone, Users } from 'lucide-react'
import { ADMIN_PATHS } from '../../routes/adminRoute'
import type { DashboardData, VisitorPoint } from '../../types/admin'

// Placeholder data until the Django API is ready. Replace with a service call
// that returns the same DashboardData shape.

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()

// Daily visitors for October, traced from the design.
const visitorCounts = [
  60, 42, 31, 40, 51, 48, 46, 55, 66, 86, 107, 120, 131, 115, 96, 70, 82, 96, 112, 126, 115, 101, 80, 100, 120,
  126, 133, 150, 166, 154,
]

const visitors: VisitorPoint[] = visitorCounts.map((count, i) => ({
  date: `2026-10-${String(i + 1).padStart(2, '0')}`,
  visitors: count,
}))

export const adminDashboardMock: DashboardData = {
  stats: [
    { label: 'Total News', value: 24, note: '3 this month', trend: 'up', icon: FileText, tone: 'info' },
    { label: 'Upcoming Events', value: 8, note: '2 this month', trend: 'up', icon: Calendar, tone: 'success' },
    { label: 'Gallery Photos', value: 156, note: '12 this month', trend: 'up', icon: Image, tone: 'violet' },
    { label: 'Parish Groups', value: 12, note: 'Active groups', icon: Users, tone: 'warning' },
    { label: 'Contact Messages', value: 7, note: '3 unread', trend: 'down', icon: Mail, tone: 'danger' },
  ],
  visitors,
  overviewMetrics: [
    { label: 'Total Views', value: '2,481', change: 18, icon: Eye, tone: 'info' },
    { label: 'Unique Visitors', value: '1,302', change: 22, icon: Users, tone: 'info' },
    { label: 'Avg. Session', value: '3m 12s', change: 6, icon: Clock, tone: 'info' },
    { label: 'Mobile Users', value: '68%', change: 4, icon: Smartphone, tone: 'info' },
  ],
  quickActions: [
    { label: 'Add News Post', path: ADMIN_PATHS.newsEvents, icon: FileText, tone: 'info' },
    { label: 'Create Event', path: ADMIN_PATHS.newsEvents, icon: Calendar, tone: 'success' },
    { label: 'Upload Photos', path: ADMIN_PATHS.gallery, icon: Image, tone: 'violet' },
    { label: 'Update Mass Times', path: ADMIN_PATHS.massTimes, icon: Clock, tone: 'warning' },
    { label: 'View Messages', path: ADMIN_PATHS.messages, icon: Mail, tone: 'danger', badge: 3 },
  ],
  recentMessages: [
    { id: 1, senderName: 'Adeola Martins', subject: 'Mass Intention Request', receivedAt: hoursAgo(2), isRead: false },
    { id: 2, senderName: 'Chinedu Okafor', subject: 'Enquiry about Baptism', receivedAt: hoursAgo(5), isRead: false },
    { id: 3, senderName: 'Grace Adebayo', subject: 'Parish Membership', receivedAt: hoursAgo(26), isRead: true },
  ],
  upcomingEvents: [
    {
      id: 1,
      title: 'Adult Harvest Thanksgiving Mass',
      startsAt: '2026-11-08T09:00:00',
      venue: 'St. George Catholic Church',
      status: 'upcoming',
      tone: 'warning',
    },
    {
      id: 2,
      title: 'Advent Retreat',
      startsAt: '2026-11-29T16:00:00',
      venue: 'Parish Hall, Ofatedo',
      status: 'upcoming',
      tone: 'info',
    },
    {
      id: 3,
      title: 'Christmas Day Solemn Mass',
      startsAt: '2026-12-25T09:00:00',
      venue: 'St. George Catholic Church',
      status: 'upcoming',
      tone: 'danger',
    },
  ],
  recentNews: [
    { id: 1, title: 'Monthly Bible Sharing', publishedAt: '2026-10-25', status: 'published' },
    { id: 2, title: 'New Parish Schedule', publishedAt: '2026-10-18', status: 'published' },
    { id: 3, title: 'Charity Outreach Success', publishedAt: '2026-10-12', status: 'published' },
  ],
  gallery: [
    { id: 1, title: 'Sanctuary' },
    { id: 2, title: 'Choir' },
    { id: 3, title: 'Ordination' },
    { id: 4, title: 'St. George statue' },
    { id: 5, title: 'Church building' },
    { id: 6, title: 'Advent candles' },
  ],
}
