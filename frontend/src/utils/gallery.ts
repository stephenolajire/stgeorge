import { BookOpen, CalendarDays, Image, Landmark, Shapes, UsersRound, Wine, type LucideIcon } from 'lucide-react'
import type { GalleryCategory, GalleryDateFilter, GallerySort } from '../types/admin'

/** Gallery categories in tab order. Keys match the server's Category choices. */
export const GALLERY_CATEGORIES: { value: GalleryCategory; label: string; icon: LucideIcon }[] = [
  { value: 'mass_liturgy', label: 'Mass & Liturgy', icon: BookOpen },
  { value: 'parish_events', label: 'Parish Events', icon: CalendarDays },
  { value: 'community', label: 'Community', icon: Landmark },
  { value: 'sacraments', label: 'Sacraments', icon: Wine },
  { value: 'youth', label: 'Youth', icon: UsersRound },
  { value: 'others', label: 'Others', icon: Shapes },
]

export const ALL_PHOTOS_ICON = Image

export const DATE_FILTER_OPTIONS: { value: Exclude<GalleryDateFilter, ''>; label: string }[] = [
  { value: 'month', label: 'This Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: 'year', label: 'This Year' },
]

export const SORT_OPTIONS: { value: GallerySort; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A–Z)' },
]

export const PAGE_SIZES = [12, 24, 48]

export const PHOTO_MAX_MB = 10
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILES_PER_UPLOAD = 20

/** URL part for a category: "mass_liturgy" -> "mass-liturgy". */
export const categorySlug = (category: GalleryCategory) => category.replace('_', '-')

/** The category for a URL part, or null if there is none. */
export function categoryFromSlug(slug: string | undefined): GalleryCategory | null {
  const value = slug?.replace('-', '_')
  return GALLERY_CATEGORIES.find((c) => c.value === value)?.value ?? null
}

/** "Today", "Yesterday", or e.g. "Thursday, 29 October 2026". */
export function albumDateLabel(iso: string, now: Date = new Date()): string {
  const [y, m, d] = iso.split('-').map(Number)
  const day = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Today as YYYY-MM-DD (local time), for date inputs. */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "2026-10-29" -> "Oct 29, 2026" (no timezone shift). */
export function formatPhotoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
