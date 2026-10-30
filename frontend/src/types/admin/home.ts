import type { MediaImage } from './about'
import type { Highlight, HighlightApi } from './parishLife'

/** Pages a quick-link card can open. Keys match the server's LinkTarget. */
export type LinkTarget = 'mass_times' | 'sacraments' | 'parish_life' | 'about' | 'news_events' | 'gallery' | 'contact'

export interface QuickLink {
  id: number
  title: string
  text: string
  image: string | null
  linkLabel: string
  target: LinkTarget
}

export interface QuickLinkForm {
  title: string
  text: string
  image: MediaImage | null
  linkLabel: string
  target: LinkTarget
}

export interface HomeHero {
  /** Text after the last comma is shown smaller, on its own line. */
  title: string
  tagline: string
  text: string
  quote: string
  image: MediaImage | null
}

export interface HomeAbout {
  title: string
  text: string
  image: MediaImage | null
}

export interface HomeNewsHeading {
  title: string
  subtitle: string
}

export interface HomeNewsletter {
  title: string
  text: string
  image: MediaImage | null
}

/** The editable parts of the Home page (saved with "Save Changes"). */
export interface HomeSections {
  hero: HomeHero
  about: HomeAbout
  news: HomeNewsHeading
  newsletter: HomeNewsletter
}

export interface HomeContent extends HomeSections {
  highlights: Highlight[]
  links: QuickLink[]
}

export interface Subscriber {
  id: number
  email: string
  createdAt: string
}

// ---- API shapes (snake_case) ----

export interface QuickLinkApi {
  id: number
  title: string
  text: string
  image: string | null
  link_label: string
  target: LinkTarget
  order: number
}

export interface HomePageApi {
  hero_title: string
  hero_tagline: string
  hero_text: string
  hero_quote: string
  hero_image: string | null
  about_title: string
  about_text: string
  about_image: string | null
  news_title: string
  news_subtitle: string
  newsletter_title: string
  newsletter_text: string
  newsletter_image: string | null
  highlights: HighlightApi[]
  links: QuickLinkApi[]
}

export interface SubscriberApi {
  id: number
  email: string
  created_at: string
}
