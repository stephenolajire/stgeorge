import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { publicProjectsService } from '../../services/public/projectsService'
import type { ProjectListParams } from '../../types/admin'

export const useProjectsPageContent = () => useQuery({ queryKey: ['public', 'projects-page'], queryFn: publicProjectsService.getPage })
export const usePublicProjects = (params: ProjectListParams) =>
  useQuery({ queryKey: ['public', 'projects', params], queryFn: () => publicProjectsService.list(params), placeholderData: keepPreviousData })
export const usePublicProjectSummary = () => useQuery({ queryKey: ['public', 'projects-summary'], queryFn: publicProjectsService.summary })
