import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeService } from '../../services/admin/homeService'

export const homePageKey = ['admin', 'home'] as const
export const subscribersKey = ['admin', 'subscribers'] as const
export const updateHomePageMutationKey = ['update-home-page'] as const

export const useHomePage = () => useQuery({ queryKey: homePageKey, queryFn: homeService.getPage })

export function useUpdateHomePage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateHomePageMutationKey,
    mutationFn: homeService.updatePage,
    onSuccess: (saved) => {
      queryClient.setQueryData(homePageKey, saved)
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}

export const useSubscribers = (params: { search: string; page: number }) =>
  useQuery({ queryKey: [...subscribersKey, params], queryFn: () => homeService.listSubscribers(params), placeholderData: keepPreviousData })

export function useRemoveSubscriber() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: homeService.removeSubscriber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscribersKey }),
  })
}
