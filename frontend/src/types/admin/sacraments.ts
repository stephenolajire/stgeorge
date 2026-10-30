import type { AboutHero, MediaImage } from './about'
import type { Highlight, HighlightApi } from './parishLife'

/** Symbol in the round badge on a sacrament's card. */
export type SacramentIcon = 'water' | 'fire' | 'chalice' | 'hands' | 'oil' | 'cross' | 'rings' | 'dove'

export interface Sacrament {
  id: number
  title: string
  icon: SacramentIcon
  shortDescription: string
  /** Plain text; a blank line starts a new paragraph. */
  content: string
  image: string | null
  isPublished: boolean
}

export interface SacramentForm {
  title: string
  icon: SacramentIcon
  shortDescription: string
  content: string
  image: MediaImage | null
  isPublished: boolean
}

/** Sacrament as sent by the Django API (/api/sacraments/). */
export interface SacramentApi {
  id: number
  title: string
  icon: SacramentIcon
  short_description: string
  content: string
  image: string | null
  is_published: boolean
  order: number
}

/** Everything else on the public Sacraments page (edited on the admin "Page Content" tab). */
export interface SacramentsPageContent {
  hero: AboutHero
  intro: { title: string; text: string }
  quote: { text: string; source: string }
  list: { title: string; subtitle: string }
  cta: { title: string; text: string }
  /** Cards in the strip under the sacraments. Same shape as Parish Life highlights. */
  features: Highlight[]
}

export interface SacramentsPageApi {
  hero_title: string
  hero_subtitle: string
  hero_image: string | null
  intro_title: string
  intro_text: string
  quote_text: string
  quote_source: string
  list_title: string
  list_subtitle: string
  cta_title: string
  cta_text: string
  features: HighlightApi[]
}
