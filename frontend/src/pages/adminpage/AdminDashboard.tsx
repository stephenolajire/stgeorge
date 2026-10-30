import { useState } from 'react'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import GalleryHighlights from '../../components/admin/dashboard/GalleryHighlights'
import QuickActions from '../../components/admin/dashboard/QuickActions'
import RecentMessages from '../../components/admin/dashboard/RecentMessages'
import RecentNews from '../../components/admin/dashboard/RecentNews'
import StatsGrid from '../../components/admin/dashboard/StatsGrid'
import UpcomingEvents from '../../components/admin/dashboard/UpcomingEvents'
import WebsiteOverview from '../../components/admin/dashboard/WebsiteOverview'
import WelcomeHeader from '../../components/admin/dashboard/WelcomeHeader'
import { useCurrentUser } from '../../hooks/admin/authHook'
import { useDashboardSummary, useVisitorOverview } from '../../hooks/admin/dashboardHook'
import type { OverviewRange } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'
import { firstName } from '../../utils/authUser'
import { dashboardStats, overviewMetrics, quickActions } from '../../utils/dashboard'
import { CHURCH } from '../../utils/siteConfig'

export default function AdminDashboard() {
  const { data: user } = useCurrentUser()
  const [today] = useState(() => new Date())
  const [range, setRange] = useState<OverviewRange>('30d')
  const summary = useDashboardSummary()
  const overview = useVisitorOverview(range)

  const welcome = <WelcomeHeader firstName={user ? firstName(user) : ''} church={CHURCH} today={today} />
  if (summary.isPending) {
    return (
      <div className="space-y-4">
        {welcome}
        <LoadingCard label="Loading dashboard..." />
      </div>
    )
  }
  if (summary.isError) {
    return (
      <div className="space-y-4">
        {welcome}
        <ErrorCard message={getErrorMessage(summary.error, 'Could not load the dashboard.')} onRetry={() => summary.refetch()} />
      </div>
    )
  }

  const data = summary.data
  return (
    <div className="space-y-4">
      {welcome}

      <StatsGrid stats={dashboardStats(data)} />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <WebsiteOverview
            range={range}
            onRangeChange={setRange}
            visitors={overview.data?.series}
            metrics={overview.data && overviewMetrics(overview.data)}
            error={overview.isError ? getErrorMessage(overview.error, 'Could not load visitor numbers.') : undefined}
          />
        </div>
        <section className="card space-y-5 p-4 pt-3 xl:col-span-5">
          <QuickActions actions={quickActions(data.counts.unreadMessages)} />
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
