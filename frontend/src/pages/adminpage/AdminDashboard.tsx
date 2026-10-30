import { useState } from 'react'
import GalleryHighlights from '../../components/admin/dashboard/GalleryHighlights'
import QuickActions from '../../components/admin/dashboard/QuickActions'
import RecentMessages from '../../components/admin/dashboard/RecentMessages'
import RecentNews from '../../components/admin/dashboard/RecentNews'
import StatsGrid from '../../components/admin/dashboard/StatsGrid'
import UpcomingEvents from '../../components/admin/dashboard/UpcomingEvents'
import WebsiteOverview from '../../components/admin/dashboard/WebsiteOverview'
import WelcomeHeader from '../../components/admin/dashboard/WelcomeHeader'
import { useCurrentUser } from '../../hooks/admin/authHook'
import { adminDashboardMock as data } from '../../services/mock/adminDashboard'
import { firstName } from '../../utils/authUser'
import { CHURCH } from '../../utils/siteConfig'

export default function AdminDashboard() {
  const { data: user } = useCurrentUser()
  const [today] = useState(() => new Date())

  return (
    <div className="space-y-4">
      <WelcomeHeader firstName={user ? firstName(user) : ''} church={CHURCH} today={today} />

      <StatsGrid stats={data.stats} />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <WebsiteOverview visitors={data.visitors} metrics={data.overviewMetrics} />
        </div>
        <section className="card space-y-5 p-4 pt-3 xl:col-span-5">
          <QuickActions actions={data.quickActions} />
          <RecentMessages messages={data.recentMessages} />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <UpcomingEvents events={data.upcomingEvents} />
        <RecentNews news={data.recentNews} />
        <GalleryHighlights photos={data.gallery} />
      </div>
    </div>
  )
}
