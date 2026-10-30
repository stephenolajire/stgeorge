import { BookOpen, CalendarDays, Church, Cross, HandHeart, Heart, Music, Sprout, Users, type LucideIcon } from 'lucide-react'
import type { HighlightIcon } from '../types/admin'

/** Icons a highlight card can use. Keys match the server's HighlightIcon choices. */
export const HIGHLIGHT_ICONS: Record<HighlightIcon, { icon: LucideIcon; label: string }> = {
  church: { icon: Church, label: 'Church' },
  users: { icon: Users, label: 'People' },
  book: { icon: BookOpen, label: 'Book' },
  hands: { icon: HandHeart, label: 'Helping hands' },
  calendar: { icon: CalendarDays, label: 'Calendar' },
  cross: { icon: Cross, label: 'Cross' },
  music: { icon: Music, label: 'Music' },
  heart: { icon: Heart, label: 'Heart' },
  sprout: { icon: Sprout, label: 'Growth' },
}
