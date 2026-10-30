import { useQuery } from '@tanstack/react-query'
import { publicAboutService } from '../../services/public/aboutService'

export function useAboutContent() {
  return useQuery({ queryKey: ['public', 'about'], queryFn: publicAboutService.getContent })
}

export function useParishLeadership() {
  return useQuery({ queryKey: ['public', 'leadership'], queryFn: publicAboutService.getLeadership })
}
