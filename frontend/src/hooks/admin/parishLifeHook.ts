import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parishGroupsService } from '../../services/admin/parishGroupsService'
import { parishLifeService } from '../../services/admin/parishLifeService'

export const parishLifePageKey = ['admin', 'parish-life'] as const
export const parishGroupsKey = ['admin', 'parish-groups'] as const

export function useParishLifePage() {
  return useQuery({ queryKey: parishLifePageKey, queryFn: parishLifeService.getPage })
}

export function useAdminParishGroups() {
  return useQuery({ queryKey: parishGroupsKey, queryFn: parishGroupsService.list })
}

export function useUpdateParishLifePage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: parishLifeService.updatePage,
    onSuccess: (saved) => queryClient.setQueryData(parishLifePageKey, saved),
  })
}

/**
 * Wraps a card save/delete/reorder call so the given list (default: the Parish Life page) refreshes
 * afterwards. Also refreshes the public pages' copies.
 */
export function useCardMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>, queryKey: readonly unknown[] = parishLifePageKey) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}
