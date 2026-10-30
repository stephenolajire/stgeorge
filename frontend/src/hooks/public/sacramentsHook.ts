import { useQuery } from '@tanstack/react-query'
import { publicSacramentsService } from '../../services/public/sacramentsService'

export function useSacramentsPageContent() {
  return useQuery({ queryKey: ['public', 'sacraments-page'], queryFn: publicSacramentsService.getPage })
}

export function usePublishedSacraments() {
  return useQuery({ queryKey: ['public', 'sacraments'], queryFn: publicSacramentsService.getSacraments })
}
