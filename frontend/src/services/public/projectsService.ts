import { projectsService } from '../admin/projectsService'

// Read-only calls for the public Projects page.
export const publicProjectsService = {
  getPage: projectsService.getPage,
  list: projectsService.list,
  summary: projectsService.summary,
}
