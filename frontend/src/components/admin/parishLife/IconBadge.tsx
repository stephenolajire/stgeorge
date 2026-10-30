import type { HighlightIcon } from '../../../types/admin'
import { HIGHLIGHT_ICONS } from '../../../utils/highlightIcons'

export default function IconBadge({ icon, className = 'size-12' }: { icon: HighlightIcon; className?: string }) {
  const Icon = HIGHLIGHT_ICONS[icon].icon
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-gold ${className}`}>
      <Icon className="size-5.5" strokeWidth={2} />
    </span>
  )
}
