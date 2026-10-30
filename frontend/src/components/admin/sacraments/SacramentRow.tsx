import { ArrowDown, ArrowUp, CircleCheck, CircleDashed, Eye, GripVertical, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
import type { DragEvent } from 'react'
import type { Sacrament } from '../../../types/admin'
import MoreMenu from '../common/MoreMenu'
import StatusBadge from '../common/StatusBadge'

interface SacramentRowProps {
  sacrament: Sacrament
  number: number
  selected: boolean
  isFirst: boolean
  isLast: boolean
  dropTarget: boolean
  dragProps: {
    draggable: boolean
    onDragStart: () => void
    onDragOver: (e: DragEvent) => void
    onDrop: () => void
    onDragEnd: () => void
  }
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  onTogglePublished: () => void
  onMove: (direction: -1 | 1) => void
}

const iconButton = 'flex size-7 items-center justify-center rounded-md hover:bg-surface-muted'

export default function SacramentRow({ sacrament, ...props }: SacramentRowProps) {
  return (
    <tr
      {...props.dragProps}
      className={`border-b border-line last:border-0 ${props.selected ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'} ${
        props.dropTarget ? 'shadow-[inset_0_2px_0_var(--color-brand)]' : ''
      }`}
    >
      <td className="w-7 pl-1">
        <GripVertical className="size-4.5 cursor-grab text-ink-soft" aria-label="Drag to reorder" />
      </td>
      <td className="w-7 text-center text-[0.8125rem] font-medium text-ink">{props.number}</td>
      <td className="w-23.5 px-2 py-2">
        {sacrament.image ? (
          <img src={sacrament.image} alt="" className="h-15.5 w-19.5 max-w-none rounded-md object-cover" />
        ) : (
          <span className="flex h-15.5 w-19.5 items-center justify-center rounded-md bg-surface-muted text-muted">
            <ImageIcon className="size-5" />
          </span>
        )}
      </td>
      <td className="px-2">
        <p className="font-display text-[0.875rem] font-bold text-ink">{sacrament.title}</p>
      </td>
      <td className="px-2">
        <p className="line-clamp-2 max-w-40 text-xs leading-snug text-ink-soft">{sacrament.shortDescription}</p>
      </td>
      <td className="px-2">
        <StatusBadge
          label={sacrament.isPublished ? 'Published' : 'Draft'}
          tone={sacrament.isPublished ? 'success' : 'neutral'}
        />
      </td>
      <td className="pr-1 pl-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={props.onEdit} className={`${iconButton} text-ink`} aria-label={`Edit ${sacrament.title}`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={props.onView} className={`${iconButton} text-ink`} aria-label={`Preview ${sacrament.title}`}>
            <Eye className="size-4" />
          </button>
          <button
            type="button"
            onClick={props.onDelete}
            className={`${iconButton} text-danger hover:bg-danger-soft`}
            aria-label={`Delete ${sacrament.title}`}
          >
            <Trash2 className="size-4" />
          </button>
          <MoreMenu
            buttonClassName={`${iconButton} text-ink`}
            items={[
              { label: 'Move up', icon: ArrowUp, onClick: () => props.onMove(-1), disabled: props.isFirst },
              { label: 'Move down', icon: ArrowDown, onClick: () => props.onMove(1), disabled: props.isLast },
              sacrament.isPublished
                ? { label: 'Unpublish (draft)', icon: CircleDashed, onClick: props.onTogglePublished }
                : { label: 'Publish', icon: CircleCheck, onClick: props.onTogglePublished },
            ]}
          />
        </div>
      </td>
    </tr>
  )
}
