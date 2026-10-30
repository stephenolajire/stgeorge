import type { LucideIcon } from 'lucide-react'

/** Colour family used for icons, badges and tiles. Matches the tone tokens in index.css. */
export type Tone = 'info' | 'success' | 'violet' | 'warning' | 'danger' | 'neutral'

export type Trend = 'up' | 'down'

/** One choice in a coloured status pill, e.g. Published / Draft. */
export interface StatusOption {
  value: string
  label: string
  tone: Tone
}

export interface IconTone {
  icon: LucideIcon
  tone: Tone
}
