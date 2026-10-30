import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '../../services/admin/projectsService'
import type { Project, ProjectForm, ProjectListParams } from '../../types/admin'

export const projectsKeys = {
  all: ['admin', 'projects'] as const,
  list: (params: ProjectListParams) => ['admin', 'projects', 'list', params] as const,
  summary: ['admin', 'projects', 'summary'] as const,
  categories: ['admin', 'projects', 'categories'] as const,
  page: ['admin', 'projects', 'page'] as const,
}
export const updateProjectsPageMutationKey = ['update-projects-page'] as const

export const useProjects = (params: ProjectListParams) =>
  useQuery({ queryKey: projectsKeys.list(params), queryFn: () => projectsService.list(params), placeholderData: keepPreviousData })
export const useProjectSummary = () => useQuery({ queryKey: projectsKeys.summary, queryFn: projectsService.summary })
export const useProjectCategories = () => useQuery({ queryKey: projectsKeys.categories, queryFn: projectsService.categories, staleTime: Infinity })
export const useProjectsPage = () => useQuery({ queryKey: projectsKeys.page, queryFn: projectsService.getPage })

/** After any change: reload the admin lists and counts, and the public pages. */
function useRefresh() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: projectsKeys.all })
    queryClient.invalidateQueries({ queryKey: ['public'] })
  }
}

export function useSaveProject() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: ({ project, values }: { project: Project | null; values: ProjectForm }) => projectsService.save(project, values),
    onSuccess: refresh,
  })
}

export function useSetProjectStatus() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: ({ id, status }: { id: number; status: Project['status'] }) => projectsService.setStatus(id, status), onSuccess: refresh })
}

export function useDeleteProject() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: projectsService.remove, onSuccess: refresh })
}

export function useUpdateProjectsPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: updateProjectsPageMutationKey,
    mutationFn: projectsService.updatePage,
    onSuccess: (saved) => {
      queryClient.setQueryData(projectsKeys.page, saved)
      queryClient.invalidateQueries({ queryKey: ['public'] })
    },
  })
}
