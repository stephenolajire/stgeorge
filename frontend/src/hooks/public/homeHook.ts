import { useMutation, useQuery } from '@tanstack/react-query'
import { publicHomeService } from '../../services/public/homeService'

export const useHomeContent = () => useQuery({ queryKey: ['public', 'home'], queryFn: publicHomeService.getPage })
export const useNextEvent = () => useQuery({ queryKey: ['public', 'news-events', 'next'], queryFn: publicHomeService.nextEvent })
export const useLatestNews = () => useQuery({ queryKey: ['public', 'news-events', 'latest'], queryFn: publicHomeService.latestNews })
export const useSubscribe = () => useMutation({ mutationFn: ({ email, website }: { email: string; website: string }) => publicHomeService.subscribe(email, website) })
