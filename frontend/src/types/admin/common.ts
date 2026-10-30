import type { LucideIcon } from 'lucide-react'

/** Colour family used for icons, badges and tiles. Matches the tone tokens in index.css. */
export type Tone = 'info' | 'success' | 'violet' | 'warning' | 'danger' | 'neutral'

export type Trend = 'up' | 'down'

export interface IconTone {
  icon: LucideIcon
  tone: Tone
}
