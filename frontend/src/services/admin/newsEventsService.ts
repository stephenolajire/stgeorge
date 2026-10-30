import api from '../../api/api'
import type {
  CategoryOption,
  EventApi,
  EventItem,
  NewsApi,
  NewsEventsPageApi,
  NewsEventsPageContent,
  NewsItem,
  Paginated,
  PostForm,
  PostKind,
  PostListParams,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const PAGE_URL = '/news-events/page/'
const URLS: Record<PostKind, string> = { events: '/events/', news: '/news/' }

const base = (d: EventApi | NewsApi) => ({
  id: d.id,
  title: d.title,
  shortDescription: d.short_description,
  content: d.content,
  image: d.image,
  category: d.category,
  categoryLabel: d.category_label,
  isPublished: d.is_published,
  isFeatured: d.is_featured,
})
export const eventFromApi = (d: EventApi): EventItem => ({ ...base(d), startsAt: d.starts_at, location: d.location })
export const newsFromApi = (d: NewsApi): NewsItem => ({ ...base(d), publishedOn: d.published_on })

function toFormData(kind: PostKind, v: PostForm, hadImage: boolean): FormData {
  const form = new FormData()
  form.append('title', v.title)
  form.append('short_description', v.shortDescription)
  form.append('content', v.content)
  form.append('category', v.category)
  form.append('is_published', String(v.isPublished))
  form.append('is_featured', String(v.isFeatured))
  if (kind === 'events') {
    // Sent without a time zone: the server reads it as parish time.
    form.append('starts_at', `${v.date}T${v.time || '00:00'}`)
    form.append('location', v.location)
  } else {
    form.append('published_on', v.date)
  }
  appendImage(form, 'image', v.image, hadImage)
  return form
}

const params = ({ search, status, category, when, page, pageSize }: PostListParams) => ({
  search: search || undefined,
  status: status || undefined,
  category: category || undefined,
  when: when || undefined,
  page,
  page_size: pageSize,
})

export const newsEventsService = {
  async listEvents(p: PostListParams): Promise<Paginated<EventItem>> {
    const { data } = await api.get<Paginated<EventApi>>(URLS.events, { params: params(p) })
    return { count: data.count, results: data.results.map(eventFromApi) }
  },
  async listNews(p: PostListParams): Promise<Paginated<NewsItem>> {
    const { data } = await api.get<Paginated<NewsApi>>(URLS.news, { params: params(p) })
    return { count: data.count, results: data.results.map(newsFromApi) }
  },
  categories: async (kind: PostKind) => (await api.get<CategoryOption[]>(`${URLS[kind]}categories/`)).data,
  summary: async (kind: PostKind) => (await api.get<{ all: number; published: number; draft: number }>(`${URLS[kind]}summary/`)).data,

  async save(kind: PostKind, item: EventItem | NewsItem | null, values: PostForm) {
    const form = toFormData(kind, values, Boolean(item?.image))
    const url = item ? `${URLS[kind]}${item.id}/` : URLS[kind]
    const { data } = item ? await api.patch(url, form) : await api.post(url, form)
    return kind === 'events' ? eventFromApi(data) : newsFromApi(data)
  },
  async setFlags(kind: PostKind, id: number, flags: { is_published?: boolean; is_featured?: boolean }) {
    await api.patch(`${URLS[kind]}${id}/`, flags)
  },
  remove: async (kind: PostKind, id: number) => void (await api.delete(`${URLS[kind]}${id}/`)),

  async getPage(): Promise<NewsEventsPageContent> {
    const { data } = await api.get<NewsEventsPageApi>(PAGE_URL)
    return pageFromApi(data)
  },
  async updatePage({ hero, cta }: NewsEventsPageContent): Promise<NewsEventsPageContent> {
    const form = new FormData()
    form.append('hero_title', hero.title)
    form.append('hero_subtitle', hero.subtitle)
    form.append('cta_title', cta.title)
    form.append('cta_text', cta.text)
    appendImage(form, 'hero_image', hero.image)
    return pageFromApi((await api.patch<NewsEventsPageApi>(PAGE_URL, form)).data)
  },
}

function pageFromApi(d: NewsEventsPageApi): NewsEventsPageContent {
  return {
    hero: { title: d.hero_title, subtitle: d.hero_subtitle, image: toImage(d.hero_image) },
    cta: { title: d.cta_title, text: d.cta_text },
  }
}
