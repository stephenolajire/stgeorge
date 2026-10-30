import type { Tone } from '../types/admin'

// Full class names are written out so Tailwind can find them at build time.
export const toneIcon: Record<Tone, string> = {
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  violet: 'bg-violet-soft text-violet',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-neutral-soft text-neutral',
}

export const toneTile: Record<Tone, string> = {
  info: 'bg-info-soft text-info hover:brightness-97',
  success: 'bg-success-soft text-success hover:brightness-97',
  violet: 'bg-violet-soft text-violet hover:brightness-97',
  warning: 'bg-warning-soft text-warning hover:brightness-97',
  danger: 'bg-danger-soft text-danger hover:brightness-97',
  neutral: 'bg-neutral-soft text-neutral hover:brightness-97',
}
