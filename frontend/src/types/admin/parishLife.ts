import type { AboutHero, MediaImage } from './about'

export type HighlightIcon = 'church' | 'users' | 'book' | 'hands' | 'calendar' | 'cross' | 'music' | 'heart'

/** A small card in the strip under the banner. */
export interface Highlight {
  id: number
  title: string
  text: string
  icon: HighlightIcon
}

/** A card in "Growing Together in Faith". */
export interface Activity {
  id: number
  title: string
  shortDescription: string
  /** Plain text; a blank line starts a new paragraph. */
  content: string
  image: string | null
  isPublished: boolean
}

export interface ParishLifeIntro {
  title: string
  /** Plain text; a blank line starts a new paragraph. */
  text: string
  image: MediaImage | null
}

/** The whole Parish Life page as the admin and the public page use it. */
export interface ParishLifeContent {
  hero: AboutHero
  intro: ParishLifeIntro
  highlights: Highlight[]
  activities: Activity[]
}

export type HighlightForm = Omit<Highlight, 'id'>

export interface ActivityForm {
  title: string
  shortDescription: string
  content: string
  image: MediaImage | null
  isPublished: boolean
}

// --- Shapes sent by the Django API ---

export interface HighlightApi {
  id: number
  title: string
  text: string
  icon: HighlightIcon
}

export interface ActivityApi {
  id: number
  title: string
  short_description: string
  content: string
  image: string | null
  is_published: boolean
}

export interface ParishLifePageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  intro_title: string
  intro_text: string
  intro_image: string | null
  highlights: HighlightApi[]
  activities: ActivityApi[]
}
