import type { MediaImage } from './about'
import type { Tone } from './common'

export type PostKind = 'events' | 'news'
export type PostStatusFilter = '' | 'published' | 'draft'
export type EventWhen = '' | 'upcoming' | 'past' | 'month'

interface PostBase {
  id: number
  title: string
  shortDescription: string
  /** Plain text; a blank line starts a new paragraph. */
  content: string
  image: string | null
  category: string
  categoryLabel: string
  isPublished: boolean
  isFeatured: boolean
}

export interface EventItem extends PostBase {
  /** ISO date-time with the parish's offset, e.g. 2026-11-29T16:00:00+01:00 */
  startsAt: string
  location: string
}

export interface NewsItem extends PostBase {
  /** YYYY-MM-DD */
  publishedOn: string
}

export type PostItem = EventItem | NewsItem

/** What the admin edit panel works with (both kinds; unused fields are ignored). */
export interface PostForm {
  title: string
  shortDescription: string
  content: string
  category: string
  image: MediaImage | null
  isPublished: boolean
  isFeatured: boolean
  /** Event: YYYY-MM-DD and HH:MM in parish time. News: the publish date. */
  date: string
  time: string
  location: string
}

export interface PostListParams {
  search?: string
  status?: PostStatusFilter
  /** One or more category keys. */
  category?: string
  when?: EventWhen
  page: number
  pageSize?: number
}

export interface CategoryOption {
  value: string
  label: string
}

export interface CategoryStyle {
  tone: Tone
}

export interface NewsEventsPageContent {
  hero: { title: string; subtitle: string; image: MediaImage | null }
  cta: { title: string; text: string }
}

// --- Shapes sent by the Django API ---

interface PostBaseApi {
  id: number
  title: string
  short_description: string
  content: string
  image: string | null
  category: string
  category_label: string
  is_published: boolean
  is_featured: boolean
}

export interface EventApi extends PostBaseApi {
  starts_at: string
  location: string
}

export interface NewsApi extends PostBaseApi {
  published_on: string
}

export interface NewsEventsPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  cta_title: string
  cta_text: string
}
