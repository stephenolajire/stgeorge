import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clergyService } from '../../services/admin/clergyService'
import type { Member, MemberFormValues, MemberListParams, Paginated } from '../../types/admin'

export const clergyKeys = {
  all: ['admin', 'clergy'] as const,
  list: (params: MemberListParams) => ['admin', 'clergy', 'list', params] as const,
  summary: ['admin', 'clergy', 'summary'] as const,
}

export function useClergyMembers(params: MemberListParams) {
  return useQuery({
    queryKey: clergyKeys.list(params),
    queryFn: () => clergyService.list(params),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  })
}

export function useClergySummary() {
  return useQuery({ queryKey: clergyKeys.summary, queryFn: clergyService.summary })
}

/** Lists and counts change after any edit, so refresh everything clergy-related. */
function useInvalidateClergy() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: clergyKeys.all })
}

export function useSaveMember() {
  const invalidate = useInvalidateClergy()
  return useMutation({
    mutationFn: ({ member, values }: { member: Member | null; values: MemberFormValues }) =>
      member ? clergyService.update(member, values) : clergyService.create(values),
    onSuccess: invalidate,
  })
}

export function useSetMemberActive() {
  const invalidate = useInvalidateClergy()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => clergyService.setActive(id, isActive),
    onSuccess: invalidate,
  })
}

export function useDeleteMember() {
  const invalidate = useInvalidateClergy()
  return useMutation({ mutationFn: clergyService.remove, onSuccess: invalidate })
}

/** Reorders the members on the current page, updating the table immediately. */
export function useReorderMembers(params: MemberListParams) {
  const queryClient = useQueryClient()
  const key = clergyKeys.list(params)
  return useMutation({
    mutationFn: (members: Member[]) => clergyService.reorder(members.map((m) => m.id)),
    onMutate: async (members) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Paginated<Member>>(key)
      if (previous) queryClient.setQueryData(key, { ...previous, results: members })
      return { previous }
    },
    onError: (_error, _members, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clergyKeys.all }),
  })
}
