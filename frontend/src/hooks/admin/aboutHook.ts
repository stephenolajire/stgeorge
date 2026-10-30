import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aboutService } from '../../services/admin/aboutService'

export const aboutQueryKey = ['admin', 'about'] as const

export function useAboutPage() {
  return useQuery({
    queryKey: aboutQueryKey,
    queryFn: aboutService.get,
  })
}

export function useUpdateAboutPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aboutService.update,
    onSuccess: (saved) => queryClient.setQueryData(aboutQueryKey, saved),
  })
}
