import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { newsEventsService } from '../../services/admin/newsEventsService'
import type { EventItem, NewsItem, Paginated, PostForm, PostKind, PostListParams } from '../../types/admin'

export const newsEventsKeys = {
  all: ['admin', 'news-events'] as const,
  list: (kind: PostKind, params: PostListParams) => ['admin', 'news-events', kind, 'list', params] as const,
  summary: (kind: PostKind) => ['admin', 'news-events', kind, 'summary'] as const,
  categories: (kind: PostKind) => ['admin', 'news-events', kind, 'categories'] as const,
  page: ['admin', 'news-events-page'] as const,
}
export const updateNewsEventsPageMutationKey = ['admin', 'news-events-page', 'update'] as const

export function usePosts(kind: PostKind, params: PostListParams) {
  return useQuery<Paginated<EventItem | NewsItem>>({
    queryKey: newsEventsKeys.list(kind, params),
    queryFn: () => (kind === 'events' ? newsEventsService.listEvents(params) : newsEventsService.listNews(params)),
    placeholderData: keepPreviousData,
  })
}

export const usePostSummary = (kind: PostKind) =>
  useQuery({ queryKey: newsEventsKeys.summary(kind), queryFn: () => newsEventsService.summary(kind) })

export const usePostCategories = (kind: PostKind) =>
  useQuery({ queryKey: newsEventsKeys.categories(kind), queryFn: () => newsEventsService.categories(kind), staleTime: Infinity })

function usePostMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsEventsKeys.all })
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}

export const useSavePost = () =>
  usePostMutation(({ kind, item, values }: { kind: PostKind; item: EventItem | NewsItem | null; values: PostForm }) =>
    newsEventsService.save(kind, item, values),
  )
export const useSetPostFlags = () =>
  usePostMutation(({ kind, id, flags }: { kind: PostKind; id: number; flags: { is_published?: boolean; is_featured?: boolean } }) =>
    newsEventsService.setFlags(kind, id, flags),
  )
export const useDeletePost = () => usePostMutation(({ kind, id }: { kind: PostKind; id: number }) => newsEventsService.remove(kind, id))

export const useNewsEventsPage = () => useQuery({ queryKey: newsEventsKeys.page, queryFn: newsEventsService.getPage })

export function useUpdateNewsEventsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateNewsEventsPageMutationKey,
    mutationFn: newsEventsService.updatePage,
    onSuccess: (saved) => {
      queryClient.setQueryData(newsEventsKeys.page, saved)
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}
