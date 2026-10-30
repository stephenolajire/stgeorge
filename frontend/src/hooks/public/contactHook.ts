import { useMutation, useQuery } from '@tanstack/react-query'
import { publicContactService } from '../../services/public/contactService'

/** Contact page content; also gives the footer its address, phone, email and hours. */
export const useContactContent = () =>
  useQuery({ queryKey: ['public', 'contact-page'], queryFn: publicContactService.getPage, staleTime: 5 * 60_000 })

export const useContactSubjects = () =>
  useQuery({ queryKey: ['public', 'contact-subjects'], queryFn: publicContactService.subjects, staleTime: Infinity })

export const useSendContactMessage = () => useMutation({ mutationFn: publicContactService.send })
