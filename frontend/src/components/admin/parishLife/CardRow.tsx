import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { MoreMenuItem } from '../common/MoreMenu'
import MoreMenu from '../common/MoreMenu'

interface CardRowProps {
  /** Thumbnail or icon on the left. */
  media: ReactNode
  title: string
  text: string
  /** e.g. a Published/Draft badge. */
  badge?: ReactNode
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
  /** Extra menu items, e.g. publish/unpublish. */
  extraMenuItems?: MoreMenuItem[]
}

const iconButton = 'flex size-7.5 items-center justify-center rounded-md border border-field-border hover:bg-surface-muted'

/** One card in a card section of the admin page (highlight, group or activity). */
export default function CardRow(props: CardRowProps) {
  return (
    <li className="flex items-center gap-3.5 border-b border-line py-3 last:border-0">
      {props.media}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.875rem] font-bold text-ink">{props.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-muted">{props.text}</p>
      </div>
      {props.badge}
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={props.onEdit} className={`${iconButton} text-ink`} aria-label={`Edit ${props.title}`}>
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={props.onDelete}
          className={`${iconButton} text-danger hover:bg-danger-soft`}
          aria-label={`Delete ${props.title}`}
        >
          <Trash2 className="size-4" />
        </button>
        <MoreMenu
          items={[
            { label: 'Move up', icon: ArrowUp, onClick: () => props.onMove(-1), disabled: props.isFirst },
            { label: 'Move down', icon: ArrowDown, onClick: () => props.onMove(1), disabled: props.isLast },
            ...(props.extraMenuItems ?? []),
          ]}
        />
      </div>
    </li>
  )
}
