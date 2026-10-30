import { useState } from 'react'
import PageLoader from '../../components/admin/common/PageLoader'
import PostPreviewModal from '../../components/admin/newsEvents/PostPreviewModal'
import AboutParish from '../../components/public/home/AboutParish'
import HomeHero from '../../components/public/home/HomeHero'
import HomeHighlights from '../../components/public/home/HomeHighlights'
import LatestUpdates from '../../components/public/home/LatestUpdates'
import Newsletter from '../../components/public/home/Newsletter'
import UpcomingEvent from '../../components/public/home/UpcomingEvent'
import { useHomeContent, useLatestNews, useNextEvent } from '../../hooks/public/homeHook'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { NewsItem } from '../../types/admin'

export default function Home() {
  usePageTitle('')
  const { data: content, isPending, isError, refetch } = useHomeContent()
  const { data: event = null } = useNextEvent()
  const { data: news = [] } = useLatestNews()
  const [open, setOpen] = useState<NewsItem | null>(null)

  if (isPending) return <PageLoader />
  if (isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-ink">Sorry, this page could not be loaded.</p>
        <button type="button" onClick={() => refetch()} className="mt-4 text-sm font-semibold text-brand hover:underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <HomeHero hero={content.hero} />
      <HomeHighlights highlights={content.highlights} />
      <UpcomingEvent event={event} links={content.links} />
      <AboutParish about={content.about} />
      <LatestUpdates heading={content.news} posts={news as NewsItem[]} onOpen={setOpen} />
      {content.newsletter.title && <Newsletter newsletter={content.newsletter} />}
      {open && <PostPreviewModal kind="news" item={open} onClose={() => setOpen(null)} />}
    </>
  )
}
