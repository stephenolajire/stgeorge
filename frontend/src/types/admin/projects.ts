import type { MediaImage } from './about'

export type ProjectStatus = 'ongoing' | 'completed' | 'upcoming'
export type ProjectOrdering = 'latest' | 'oldest' | 'title' | 'progress'

export interface Project {
  id: number
  title: string
  category: string
  categoryLabel: string
  status: ProjectStatus
  statusLabel: string
  shortDescription: string
  /** Plain text; a blank line starts a new paragraph. */
  content: string
  image: string | null
  /** 0-100 */
  progress: number
  /** Whole naira */
  targetAmount: number | null
  /** YYYY-MM-DD */
  targetDate: string | null
}

export interface ProjectForm {
  title: string
  category: string
  status: ProjectStatus
  shortDescription: string
  content: string
  image: MediaImage | null
  progress: string
  targetAmount: string
  targetDate: string
}

export interface ProjectListParams {
  search?: string
  status?: ProjectStatus | ''
  category?: string
  ordering?: ProjectOrdering
  page: number
  pageSize?: number
}

export type ProjectSummary = Record<ProjectStatus | 'all', number>

export interface ProjectsPageContent {
  hero: { title: string; subtitle: string; image: MediaImage | null }
}

// ---- API shapes (snake_case) ----

export interface ProjectApi {
  id: number
  title: string
  category: string
  category_label: string
  status: ProjectStatus
  status_label: string
  short_description: string
  content: string
  image: string | null
  progress: number
  target_amount: number | null
  target_date: string | null
}

export interface ProjectsPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
}
