import type { MediaImage } from './about'

export type GalleryCategory = 'mass_liturgy' | 'parish_events' | 'community' | 'sacraments' | 'youth' | 'others'
export type GalleryDateFilter = '' | 'month' | '3months' | 'year'
export type GallerySort = 'newest' | 'oldest' | 'title'

export interface Photo {
  id: number
  image: string
  title: string
  category: GalleryCategory
  categoryLabel: string
  description: string
  /** YYYY-MM-DD */
  dateTaken: string
  /** Comma-separated */
  tags: string
}

export interface PhotoForm {
  title: string
  category: GalleryCategory
  description: string
  dateTaken: string
  tags: string
  /** Unchanged ({url}) or a newly picked file. */
  image: MediaImage
}

export interface PhotoListParams {
  category?: GalleryCategory
  search?: string
  date?: GalleryDateFilter
  ordering: GallerySort
  page: number
  pageSize: number
}

export interface GallerySummary {
  counts: Record<'all' | GalleryCategory, number>
}

/** Photo as sent by the Django API (/api/gallery/). */
export interface PhotoApi {
  id: number
  image: string
  title: string
  category: GalleryCategory
  category_label: string
  description: string
  date_taken: string
  tags: string
}

/** A category on the public Gallery page: its photo count and newest photo. */
export interface GalleryCategorySummary {
  value: GalleryCategory
  label: string
  count: number
  cover: string | null
}

/** One day's photos within a category. */
export interface GalleryAlbum {
  /** YYYY-MM-DD */
  date: string
  count: number
  cover: string
}

/** Text and hero image of the public Gallery page (admin "Page Content" tab). */
export interface GalleryPageContent {
  hero: { title: string; subtitle: string; image: MediaImage | null }
  cta: { title: string; text: string }
}

export interface GalleryPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  cta_title: string
  cta_text: string
}
