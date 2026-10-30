import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sacramentsService } from '../../services/admin/sacramentsService'
import type { Sacrament, SacramentForm } from '../../types/admin'

export const sacramentsKey = ['admin', 'sacraments'] as const
export const sacramentsPageKey = ['admin', 'sacraments-page'] as const

export function useSacramentsPage() {
  return useQuery({ queryKey: sacramentsPageKey, queryFn: sacramentsService.getPage })
}

export const updateSacramentsPageMutationKey = ['admin', 'sacraments-page', 'update'] as const

export function useUpdateSacramentsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateSacramentsPageMutationKey,
    mutationFn: sacramentsService.updatePage,
    onSuccess: (saved) => queryClient.setQueryData(sacramentsPageKey, saved),
  })
}

export function useSacraments() {
  return useQuery({ queryKey: sacramentsKey, queryFn: sacramentsService.list })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: sacramentsKey })
}

export function useSaveSacrament() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ sacrament, values }: { sacrament: Sacrament | null; values: SacramentForm }) =>
      sacrament ? sacramentsService.update(sacrament, values) : sacramentsService.create(values),
    onSuccess: invalidate,
  })
}

export function useSetSacramentPublished() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => sacramentsService.setPublished(id, isPublished),
    onSuccess: invalidate,
  })
}

export function useDeleteSacrament() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: sacramentsService.remove, onSuccess: invalidate })
}

/**
 * Saves a new order. `visible` is the list as shown (possibly filtered), already reordered;
 * the full cached list is updated immediately so the table does not jump.
 */
export function useReorderSacraments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (visible: Sacrament[]) => sacramentsService.reorder(visible.map((s) => s.id)),
    onMutate: async (visible) => {
      await queryClient.cancelQueries({ queryKey: sacramentsKey })
      const previous = queryClient.getQueryData<Sacrament[]>(sacramentsKey)
      if (previous) {
        // Put the visible items back into the slots they occupied, in their new order.
        const ids = new Set(visible.map((s) => s.id))
        const queue = [...visible]
        queryClient.setQueryData(
          sacramentsKey,
          previous.map((s) => (ids.has(s.id) ? queue.shift()! : s)),
        )
      }
      return { previous }
    },
    onError: (_e, _v, context) => {
      if (context?.previous) queryClient.setQueryData(sacramentsKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: sacramentsKey }),
  })
}
