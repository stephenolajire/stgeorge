import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../../services/admin/contactService'
import type { ContactMessage, MessageListParams, MessageStatus } from '../../types/admin'

export const contactKeys = {
  all: ['admin', 'contact'] as const,
  list: (params: MessageListParams) => ['admin', 'contact', 'list', params] as const,
  summary: ['admin', 'contact', 'summary'] as const,
  page: ['admin', 'contact-page'] as const,
}
export const updateContactPageMutationKey = ['admin', 'contact-page', 'update'] as const

export function useMessages(params: MessageListParams) {
  return useQuery({ queryKey: contactKeys.list(params), queryFn: () => contactService.list(params), placeholderData: keepPreviousData })
}

/** Tab counts; also drives the unread badge in the sidebar. */
export function useMessageCounts() {
  return useQuery({ queryKey: contactKeys.summary, queryFn: contactService.summary, staleTime: 30_000 })
}

function useMessageMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }) })
}

export const useSetMessageStatus = () =>
  useMessageMutation(({ id, status }: { id: number; status: Exclude<MessageStatus, 'replied'> }) => contactService.setStatus(id, status))
export const useReplyToMessage = () =>
  useMessageMutation(({ message, subject, body }: { message: ContactMessage; subject: string; body: string }) =>
    contactService.reply(message.id, subject, body),
  )
export const useDeleteMessage = () => useMessageMutation(contactService.remove)
export const useBulkDeleteMessages = () => useMessageMutation(contactService.bulkDelete)
export const useMarkAllRead = () => useMessageMutation(() => contactService.markAllRead())

export function useContactPage() {
  return useQuery({ queryKey: contactKeys.page, queryFn: contactService.getPage })
}

export function useUpdateContactPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateContactPageMutationKey,
    mutationFn: contactService.updatePage,
    onSuccess: (saved) => {
      queryClient.setQueryData(contactKeys.page, saved)
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}
