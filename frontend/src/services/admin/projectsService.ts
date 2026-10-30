import api from '../../api/api'
import type {
  CategoryOption,
  Paginated,
  Project,
  ProjectApi,
  ProjectForm,
  ProjectListParams,
  ProjectsPageApi,
  ProjectsPageContent,
  ProjectSummary,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const URL = '/projects/'
const PAGE_URL = '/projects/page/'

export const projectFromApi = (d: ProjectApi): Project => ({
  id: d.id,
  title: d.title,
  category: d.category,
  categoryLabel: d.category_label,
  status: d.status,
  statusLabel: d.status_label,
  shortDescription: d.short_description,
  content: d.content,
  image: d.image,
  progress: d.progress,
  targetAmount: d.target_amount,
  targetDate: d.target_date,
})

function toFormData(v: ProjectForm, hadImage: boolean) {
  const form = new FormData()
  form.append('title', v.title)
  form.append('category', v.category)
  form.append('status', v.status)
  form.append('short_description', v.shortDescription)
  form.append('content', v.content)
  form.append('progress', v.status === 'completed' ? '100' : v.progress || '0')
  // Empty values clear the amount/date.
  form.append('target_amount', v.targetAmount.replace(/[^\d]/g, ''))
  form.append('target_date', v.targetDate)
  appendImage(form, 'image', v.image, hadImage)
  return form
}

export const projectsService = {
  async list({ search, status, category, ordering, page, pageSize }: ProjectListParams): Promise<Paginated<Project>> {
    const { data } = await api.get<Paginated<ProjectApi>>(URL, {
      params: { search: search || undefined, status: status || undefined, category: category || undefined, ordering, page, page_size: pageSize },
    })
    return { count: data.count, results: data.results.map(projectFromApi) }
  },
  summary: async () => (await api.get<ProjectSummary>(`${URL}summary/`)).data,
  categories: async () => (await api.get<CategoryOption[]>(`${URL}categories/`)).data,

  async save(project: Project | null, values: ProjectForm): Promise<Project> {
    const form = toFormData(values, Boolean(project?.image))
    const { data } = project ? await api.patch<ProjectApi>(`${URL}${project.id}/`, form) : await api.post<ProjectApi>(URL, form)
    return projectFromApi(data)
  },
  setStatus: async (id: number, status: Project['status']) => projectFromApi((await api.patch<ProjectApi>(`${URL}${id}/`, { status })).data),
  remove: async (id: number) => void (await api.delete(`${URL}${id}/`)),

  async getPage(): Promise<ProjectsPageContent> {
    const { data } = await api.get<ProjectsPageApi>(PAGE_URL)
    return { hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) } }
  },
  async updatePage({ hero }: ProjectsPageContent): Promise<ProjectsPageContent> {
    const form = new FormData()
    form.append('hero_title', hero.title)
    form.append('hero_subtitle', hero.subtitle)
    appendImage(form, 'hero_image', hero.image)
    const { data } = await api.patch<ProjectsPageApi>(PAGE_URL, form)
    return { hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) } }
  },
}
