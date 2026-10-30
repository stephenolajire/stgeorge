import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface ValueCardProps {
  title: string
  icon: LucideIcon
  /** Draw the icon solid (heart, people). */
  filled?: boolean
  children: ReactNode
}

export default function ValueCard({ title, icon: Icon, filled, children }: ValueCardProps) {
  return (
    <div className="px-6 lg:px-7">
      <span className="mx-auto flex size-13 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-gold">
        <Icon className="size-6" strokeWidth={2} fill={filled ? 'currentColor' : 'none'} />
      </span>
      <h3 className="mt-3.5 text-center font-display text-base font-bold text-primary">{title}</h3>
      <div className="mt-2 text-[0.8125rem] leading-[1.4] text-ink-soft">{children}</div>
    </div>
  )
}
