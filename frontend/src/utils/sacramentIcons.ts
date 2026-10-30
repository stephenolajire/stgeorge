import { Bird, Cross, Droplet, Flame, FlaskRound, HandHeart, Infinity as Rings, Wine, type LucideIcon } from 'lucide-react'
import type { SacramentIcon } from '../types/admin'

/** Icons for the round badge on sacrament cards, with their colours. Keys match the server's SacramentIcon. */
export const SACRAMENT_ICONS: Record<SacramentIcon, { icon: LucideIcon; label: string; color: string }> = {
  water: { icon: Droplet, label: 'Water', color: 'text-sky-500' },
  fire: { icon: Flame, label: 'Fire', color: 'text-red-500' },
  chalice: { icon: Wine, label: 'Chalice', color: 'text-amber-500' },
  hands: { icon: HandHeart, label: 'Hands', color: 'text-violet-600' },
  oil: { icon: FlaskRound, label: 'Oil', color: 'text-lime-600' },
  cross: { icon: Cross, label: 'Cross', color: 'text-amber-800' },
  rings: { icon: Rings, label: 'Rings', color: 'text-rose-500' },
  dove: { icon: Bird, label: 'Dove', color: 'text-sky-600' },
}
