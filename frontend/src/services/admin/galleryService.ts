import api from '../../api/api'
import type {
  GalleryAlbum,
  GalleryCategory,
  GalleryCategorySummary,
  GalleryPageApi,
  GalleryPageContent,
  GallerySummary,
  Paginated,
  Photo,
  PhotoApi,
  PhotoForm,
  PhotoListParams,
} from '../../types/admin'
import { appendImage, toImage } from '../formData'

const BASE_URL = '/gallery/'
const PAGE_URL = '/gallery/page/'

function pageFromApi(data: GalleryPageApi): GalleryPageContent {
  return {
    hero: { title: data.hero_title, subtitle: data.hero_subtitle, image: toImage(data.hero_image) },
    cta: { title: data.cta_title, text: data.cta_text },
  }
}

export function photoFromApi(data: PhotoApi): Photo {
  return {
    id: data.id,
    image: data.image,
    title: data.title,
    category: data.category,
    categoryLabel: data.category_label,
    description: data.description,
    dateTaken: data.date_taken,
    tags: data.tags,
  }
}

export interface UploadOptions {
  files: File[]
  category: GalleryCategory
  dateTaken: string
  /** 0–100 */
  onProgress?: (percent: number) => void
}

export const galleryService = {
  async list({ category, search, date, ordering, page, pageSize }: PhotoListParams): Promise<Paginated<Photo>> {
    const { data } = await api.get<Paginated<PhotoApi>>(BASE_URL, {
      params: { category, search: search || undefined, date: date || undefined, ordering, page, page_size: pageSize },
    })
    return { count: data.count, results: data.results.map(photoFromApi) }
  },

  async summary(): Promise<GallerySummary> {
    const { data } = await api.get<GallerySummary>(`${BASE_URL}summary/`)
    return data
  },

  async update(photo: Photo, values: PhotoForm): Promise<Photo> {
    const form = new FormData()
    form.append('title', values.title)
    form.append('category', values.category)
    form.append('description', values.description)
    form.append('date_taken', values.dateTaken)
    form.append('tags', values.tags)
    if (values.image.file) form.append('image', values.image.file)
    const { data } = await api.patch<PhotoApi>(`${BASE_URL}${photo.id}/`, form)
    return photoFromApi(data)
  },

  /** Uploads several photos at once. Titles come from the file names. */
  async upload({ files, category, dateTaken, onProgress }: UploadOptions): Promise<Photo[]> {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    form.append('category', category)
    if (dateTaken) form.append('date_taken', dateTaken)
    const { data } = await api.post<PhotoApi[]>(`${BASE_URL}upload/`, form, {
      timeout: 5 * 60_000,
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    })
    return data.map(photoFromApi)
  },

  remove: async (id: number) => void (await api.delete(`${BASE_URL}${id}/`)),

  async getPage(): Promise<GalleryPageContent> {
    return pageFromApi((await api.get<GalleryPageApi>(PAGE_URL)).data)
  },

  async updatePage({ hero, cta }: GalleryPageContent): Promise<GalleryPageContent> {
    const form = new FormData()
    form.append('hero_title', hero.title)
    form.append('hero_subtitle', hero.subtitle)
    form.append('cta_title', cta.title)
    form.append('cta_text', cta.text)
    appendImage(form, 'hero_image', hero.image)
    return pageFromApi((await api.patch<GalleryPageApi>(PAGE_URL, form)).data)
  },

  /** Categories that have photos, with count and cover (public). */
  categories: async () => (await api.get<GalleryCategorySummary[]>(`${BASE_URL}categories/`)).data,

  /** A category's photos grouped by day, newest first (public). */
  albums: async (category: GalleryCategory) =>
    (await api.get<GalleryAlbum[]>(`${BASE_URL}albums/`, { params: { category } })).data,

  /** Every photo of one day in a category, oldest first (for the slideshow). */
  async dayPhotos(category: GalleryCategory, date: string): Promise<Photo[]> {
    const { data } = await api.get<Paginated<PhotoApi>>(BASE_URL, {
      params: { category, date_taken: date, ordering: 'oldest', page_size: 200 },
    })
    return data.results.map(photoFromApi)
  },
  bulkDelete: async (ids: number[]) => (await api.post<{ deleted: number }>(`${BASE_URL}bulk-delete/`, { ids })).data,
  bulkMove: async (ids: number[], category: GalleryCategory) =>
    (await api.post<{ moved: number }>(`${BASE_URL}bulk-move/`, { ids, category })).data,
}
