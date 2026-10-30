import type { IconTone } from './common'

/** An image already stored on the server (url) or picked locally and not yet uploaded (file). */
export interface MediaImage {
  url: string
  file?: File
}

export interface AboutHero {
  title: string
  subtitle: string
  image: MediaImage | null
}

export interface AboutMainContent {
  /** Plain text; line breaks are kept. */
  description: string
  image: MediaImage | null
}

export interface ParishInformation {
  established: string
  diocese: string
  parishPriest: string
  location: string
}

export interface AboutPageContent {
  hero: AboutHero
  mainContent: AboutMainContent
  /** Plain text */
  mission: string
  /** Plain text */
  vision: string
  parishInfo: ParishInformation
}

export interface KeyStatistic extends IconTone {
  label: string
  value: string
  /** Draw the icon solid instead of outlined. */
  filled?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
}

/** About page as sent and received by the Django API (/api/about/). */
export interface AboutPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  description: string
  main_image: string | null
  mission: string
  vision: string
  established: string
  diocese: string
  parish_priest: string
  location: string
  updated_at: string
}
