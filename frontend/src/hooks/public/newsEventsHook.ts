import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { publicNewsEventsService } from '../../services/public/newsEventsService'
import type { EventItem, EventWhen, NewsItem, Paginated, PostKind } from '../../types/admin'

export interface PublicPostFilters {
  search: string
  /** Comma-separated category values; empty for all. */
  category: string
  when?: EventWhen
}

export function useNewsEventsPageContent() {
  return useQuery({ queryKey: ['public', 'news-events-page'], queryFn: publicNewsEventsService.getPage })
}

/** Published events or news, one page at a time ("Load More"). Pass `enabled: false` to skip a section. */
export function usePublicPosts(kind: PostKind, filters: PublicPostFilters, pageSize: number, enabled = true) {
  return useInfiniteQuery<Paginated<EventItem | NewsItem>>({
    queryKey: ['public', 'news-events', kind, filters, pageSize],
    queryFn: ({ pageParam }) => {
      const params = { status: '' as const, when: filters.when ?? ('' as const), search: filters.search, category: filters.category, page: pageParam as number, pageSize }
      return kind === 'events' ? publicNewsEventsService.listEvents(params) : publicNewsEventsService.listNews(params)
    },
    initialPageParam: 1,
    getNextPageParam: (last, all) => (all.reduce((n, p) => n + p.results.length, 0) < last.count ? all.length + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled,
  })
}
