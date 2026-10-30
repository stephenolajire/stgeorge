import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../../services/admin/authService'

export const currentUserQueryKey = ['auth', 'me'] as const

/** The signed-in user. Fails with 401 when nobody is signed in. */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authService.me,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => queryClient.setQueryData(currentUserQueryKey, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.logout,
    // Forget everything loaded for the previous user, even if the server call failed.
    onSettled: () => queryClient.clear(),
  })
}
