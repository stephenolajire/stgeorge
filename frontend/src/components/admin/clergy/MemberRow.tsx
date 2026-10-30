import { ArrowDown, ArrowUp, CircleCheck, CircleOff, Eye, GripVertical, Mail, Pencil, Phone, Trash2 } from 'lucide-react'
import type { DragEvent } from 'react'
import type { Member } from '../../../types/admin'
import { CATEGORY_BADGE } from '../../../utils/clergy'
import Avatar from '../common/Avatar'
import StatusBadge from '../common/StatusBadge'
import MoreMenu from '../common/MoreMenu'

interface MemberRowProps {
  member: Member
  number: number
  selected: boolean
  isFirst: boolean
  isLast: boolean
  dropTarget: boolean
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  onToggleActive: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDragStart: () => void
  onDragOver: (e: DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

const iconButton = 'flex size-7.5 items-center justify-center rounded-md border border-field-border hover:bg-surface-muted'

export default function MemberRow(props: MemberRowProps) {
  const { member } = props
  const badge = CATEGORY_BADGE[member.category]

  return (
    <tr
      draggable
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
      className={`border-b border-line last:border-0 ${props.selected ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'} ${
        props.dropTarget ? 'shadow-[inset_0_2px_0_var(--color-brand)]' : ''
      }`}
    >
      <td className="w-7 pl-1">
        <GripVertical className="size-4.5 cursor-grab text-ink-soft" aria-label="Drag to reorder" />
      </td>
      <td className="w-7 text-center text-[0.8125rem] font-medium text-ink">{props.number}</td>
      <td className="px-1.5 py-1.25">
        <Avatar name={member.fullName} imageUrl={member.photo ?? undefined} size="lg" className="bg-surface-muted text-ink" />
      </td>
      <td className="px-2 py-1.25">
        <p className="font-display text-[0.8125rem] font-bold whitespace-nowrap text-ink">{member.fullName}</p>
        <p className="mt-0.5 text-xs whitespace-nowrap text-muted">{member.roleLabel}</p>
      </td>
      <td className="px-2">
        <StatusBadge label={badge.label} tone={badge.tone} />
      </td>
      <td className="px-2 text-xs text-ink-soft">
        {member.phone && (
          <p className="flex items-center gap-2 whitespace-nowrap">
            <Phone className="size-3.5 shrink-0" /> {member.phone}
          </p>
        )}
        {member.email && (
          <p className="mt-1 flex items-center gap-2 whitespace-nowrap">
            <Mail className="size-3.5 shrink-0" /> {member.email}
          </p>
        )}
      </td>
      <td className="px-2">
        <StatusBadge label={member.isActive ? 'Active' : 'Inactive'} tone={member.isActive ? 'success' : 'neutral'} />
      </td>
      <td className="pr-1 pl-2">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={props.onEdit} className={`${iconButton} text-ink`} aria-label={`Edit ${member.fullName}`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={props.onView} className={`${iconButton} text-ink`} aria-label={`View ${member.fullName}`}>
            <Eye className="size-4" />
          </button>
          <button
            type="button"
            onClick={props.onDelete}
            className={`${iconButton} text-danger hover:bg-danger-soft`}
            aria-label={`Delete ${member.fullName}`}
          >
            <Trash2 className="size-4" />
          </button>
          <MoreMenu
            items={[
              { label: 'Move up', icon: ArrowUp, onClick: props.onMoveUp, disabled: props.isFirst },
              { label: 'Move down', icon: ArrowDown, onClick: props.onMoveDown, disabled: props.isLast },
              member.isActive
                ? { label: 'Mark as inactive', icon: CircleOff, onClick: props.onToggleActive }
                : { label: 'Mark as active', icon: CircleCheck, onClick: props.onToggleActive },
            ]}
          />
        </div>
      </td>
    </tr>
  )
}
