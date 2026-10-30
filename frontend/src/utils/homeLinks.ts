import { PUBLIC_PATHS } from '../routes/publicRoute'
import type { LinkTarget } from '../types/admin'

/** Where each quick-link card goes, and its name in the admin. Keys match the server's LinkTarget. */
export const LINK_TARGETS: Record<LinkTarget, { path: string; label: string }> = {
  mass_times: { path: PUBLIC_PATHS.massTimes, label: 'Mass Times' },
  sacraments: { path: PUBLIC_PATHS.sacraments, label: 'Sacraments' },
  parish_life: { path: PUBLIC_PATHS.parishLife, label: 'Parish Life (groups and activities)' },
  about: { path: PUBLIC_PATHS.about, label: 'About' },
  news_events: { path: PUBLIC_PATHS.newsEvents, label: 'News & Events' },
  gallery: { path: PUBLIC_PATHS.gallery, label: 'Gallery' },
  contact: { path: PUBLIC_PATHS.contact, label: 'Contact' },
}

export const LINK_TARGET_OPTIONS = (Object.keys(LINK_TARGETS) as LinkTarget[]).map((value) => ({ value, label: LINK_TARGETS[value].label }))

/** "St. George Catholic Church, Ofatedo" -> ["St. George Catholic Church,", "Ofatedo"] */
export function splitHeroTitle(title: string): [string, string] {
  const at = title.lastIndexOf(',')
  if (at < 0) return [title, '']
  return [title.slice(0, at + 1), title.slice(at + 1).trim()]
}
