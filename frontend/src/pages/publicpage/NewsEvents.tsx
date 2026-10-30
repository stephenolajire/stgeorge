import { Search } from 'lucide-react'
import { useState } from 'react'
import PageLoader from '../../components/admin/common/PageLoader'
import PostPreviewModal from '../../components/admin/newsEvents/PostPreviewModal'
import CallToAction from '../../components/public/CallToAction'
import PageHero from '../../components/public/PageHero'
import EventCard from '../../components/public/newsEvents/EventCard'
import NewsCard from '../../components/public/newsEvents/NewsCard'
import PostSection from '../../components/public/newsEvents/PostSection'
import { useNewsEventsPageContent, usePublicPosts } from '../../hooks/public/newsEventsHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { usePageTitle } from '../../hooks/usePageTitle'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import type { EventItem, NewsItem, PostKind } from '../../types/admin'

type View = 'all' | 'events' | 'news' | 'activities' | 'celebrations'

/**
 * What each chip shows. `null` hides that section; a string limits it to those categories
 * (values match the server's EventCategory / NewsCategory).
 */
const VIEWS: Record<View, { label: string; events: string | null; news: string | null }> = {
  all: { label: 'All', events: '', news: '' },
  events: { label: 'Upcoming Events', events: '', news: null },
  news: { label: 'News & Announcements', events: null, news: '' },
  activities: { label: 'Parish Activities', events: 'youth,talk,retreat,prayer', news: 'parish_activity' },
  celebrations: { label: 'Special Celebrations', events: 'celebration,thanksgiving', news: null },
}

export default function NewsEvents() {
  usePageTitle('News & Events')
  const [view, setView] = useState<View>('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<{ kind: PostKind; item: EventItem | NewsItem } | null>(null)
  const debounced = useDebouncedValue(search.trim())

  const { events: eventCategories, news: newsCategories } = VIEWS[view]
  const overview = view === 'all'
  const content = useNewsEventsPageContent()
  const events = usePublicPosts('events', { search: debounced, category: eventCategories ?? '', when: 'upcoming' }, overview ? 4 : 8, eventCategories !== null)
  const news = usePublicPosts('news', { search: debounced, category: newsCategories ?? '' }, overview ? 3 : 6, newsCategories !== null)

  if (content.isPending) return <PageLoader />
  if (content.isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-ink">Sorry, this page could not be loaded.</p>
        <button type="button" onClick={() => content.refetch()} className="mt-4 text-sm font-semibold text-brand hover:underline">
          Try again
        </button>
      </div>
    )
  }

  const page = content.data
  const eventItems = (events.data?.pages.flatMap((p) => p.results) ?? []) as EventItem[]
  const newsItems = (news.data?.pages.flatMap((p) => p.results) ?? []) as NewsItem[]
  const show = (next: View) => {
    setView(next)
    window.scrollTo({ top: document.getElementById('news-events-list')?.offsetTop ?? 0, behavior: 'smooth' })
  }
  const nothingFound = debounced ? `Nothing matches “${debounced}”.` : null

  return (
    <>
      <PageHero title={page.hero.title} subtitle={page.hero.subtitle} image={page.hero.image} crumb="News & Events" />

      <div id="news-events-list" className="container-public scroll-mt-20 space-y-12 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filter news and events" className="-mx-1 flex gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] lg:flex-wrap">
            {(Object.keys(VIEWS) as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`inline-flex h-11 shrink-0 items-center rounded-full border px-5 text-[0.8125rem] font-medium transition ${
                  view === v ? 'border-accent bg-accent text-primary shadow-card' : 'border-line bg-surface text-ink hover:border-accent/60'
                }`}
              >
                {VIEWS[v].label}
              </button>
            ))}
          </nav>
          <label className="relative w-full lg:w-72">
            <span className="sr-only">Search news and events</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search news & events..."
              className="form-input h-11 rounded-full pl-11"
            />
          </label>
        </div>

        {eventCategories !== null && (
          <PostSection
            eyebrow="Upcoming Events"
            title="Events in Our Parish"
            count={eventItems.length}
            empty={events.isPending ? 'Loading events...' : (nothingFound ?? 'No upcoming events at the moment. Please check back soon.')}
            columns="sm:grid-cols-2 lg:grid-cols-4"
            onViewAll={overview ? () => show('events') : undefined}
            onLoadMore={!overview && events.hasNextPage ? () => events.fetchNextPage() : undefined}
            loadingMore={events.isFetchingNextPage}
          >
            {eventItems.map((e) => (
              <EventCard key={e.id} event={e} onOpen={() => setOpen({ kind: 'events', item: e })} />
            ))}
          </PostSection>
        )}

        {newsCategories !== null && (
          <PostSection
            eyebrow="Latest News"
            title="Stay Updated"
            count={newsItems.length}
            empty={news.isPending ? 'Loading news...' : (nothingFound ?? 'No news has been posted yet.')}
            columns="sm:grid-cols-2 lg:grid-cols-3"
            onViewAll={overview ? () => show('news') : undefined}
            onLoadMore={!overview && news.hasNextPage ? () => news.fetchNextPage() : undefined}
            loadingMore={news.isFetchingNextPage}
          >
            {newsItems.map((n) => (
              <NewsCard key={n.id} post={n} onOpen={() => setOpen({ kind: 'news', item: n })} />
            ))}
          </PostSection>
        )}
      </div>

      {(page.cta.title || page.cta.text) && (
        <CallToAction
          eyebrow="Be Part of Our Events"
          title={page.cta.title}
          text={page.cta.text}
          buttonLabel="Get Involved"
          to={PUBLIC_PATHS.contact}
          image={page.hero.image}
        />
      )}

      {open && <PostPreviewModal kind={open.kind} item={open.item} onClose={() => setOpen(null)} />}
    </>
  )
}
