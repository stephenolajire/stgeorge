import type { LucideIcon } from 'lucide-react'

/** Keys for live counts shown as badges next to sidebar items. */
export type NavBadgeKey = 'unreadMessages'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  badgeKey?: NavBadgeKey
  /** Match the path exactly (used for index routes like the dashboard). */
  end?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export type NavBadges = Partial<Record<NavBadgeKey, number>>

export interface ChurchInfo {
  name: string
  location: string
  diocese: string
  /** Shown as "Learn More About Our Diocese" on the About page; hidden when empty. */
  dioceseWebsite: string
  /** Short line under the logo in the footer. */
  tagline: string
  /** Footer contact details. Empty values are hidden. */
  contact: {
    address: string
    phone: string
    email: string
    hours: string
  }
  /** Social media page links. Empty values are hidden. */
  social: {
    facebook: string
    youtube: string
    instagram: string
  }
  logoUrl?: string
}
