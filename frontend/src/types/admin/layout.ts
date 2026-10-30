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
  logoUrl?: string
}
