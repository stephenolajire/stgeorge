import { useQuery } from '@tanstack/react-query'
import { publicParishLifeService } from '../../services/public/parishLifeService'

export function useParishLifeContent() {
  return useQuery({ queryKey: ['public', 'parish-life'], queryFn: publicParishLifeService.getPage })
}

export function useParishGroups() {
  return useQuery({ queryKey: ['public', 'parish-groups'], queryFn: publicParishLifeService.getGroups })
}
