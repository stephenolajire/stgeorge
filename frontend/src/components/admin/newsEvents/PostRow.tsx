import { CalendarDays, CircleCheck, CircleDashed, Clock, Eye, Image as ImageIcon, Pencil, Star, StarOff, Trash2 } from 'lucide-react'
import type { EventItem, NewsItem, PostKind } from '../../../types/admin'
import { formatDay, parishParts, toneFor } from '../../../utils/newsEvents'
import MoreMenu from '../common/MoreMenu'
import StatusBadge from '../common/StatusBadge'

interface PostRowProps {
  kind: PostKind
  item: EventItem | NewsItem
  number: number
  selected: boolean
  onEdit: () => void
  onPreview: () => void
  onDelete: () => void
  onToggle: (flags: { is_published?: boolean; is_featured?: boolean }) => void
}

const iconButton = 'flex size-7 items-center justify-center rounded-md hover:bg-surface-muted'

export default function PostRow({ kind, item, number, selected, onEdit, onPreview, onDelete, onToggle }: PostRowProps) {
  const when = 'startsAt' in item ? parishParts(item.startsAt) : null
  return (
    <tr className={`border-b border-line last:border-0 ${selected ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'}`}>
      <td className="w-8 text-center text-[0.8125rem] font-medium text-ink">{number}</td>
      <td className="w-21 px-2 py-2">
        {item.image ? (
          <img src={item.image} alt="" className="h-14 w-16 max-w-none rounded-md object-cover" />
        ) : (
          <span className="flex h-14 w-16 items-center justify-center rounded-md bg-surface-muted text-muted">
            <ImageIcon className="size-5" />
          </span>
        )}
      </td>
      <td className="px-2">
        <button type="button" onClick={onEdit} className="text-left font-display text-[0.8125rem] font-bold text-ink hover:text-brand">
          {item.title}
        </button>
        {item.isFeatured && (
          <span className="mt-0.5 flex items-center gap-1 text-[0.6875rem] font-medium text-gold">
            <Star className="size-3 fill-current" /> Featured
          </span>
        )}
      </td>
      <td className="px-2 text-xs whitespace-nowrap text-ink-soft">
        {when ? (
          <>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {when.dateLabel}
            </p>
            <p className="mt-1 flex items-center gap-1.5">
              <Clock className="size-3.5" /> {when.timeLabel}
            </p>
          </>
        ) : (
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> {formatDay((item as NewsItem).publishedOn)}
          </p>
        )}
      </td>
      <td className="px-2">
        <StatusBadge label={item.categoryLabel} tone={toneFor(kind, item.category)} />
      </td>
      <td className="px-2">
        <StatusBadge label={item.isPublished ? 'Published' : 'Draft'} tone={item.isPublished ? 'success' : 'neutral'} />
      </td>
      <td className="px-1">
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} className={`${iconButton} text-ink`} aria-label={`Edit ${item.title}`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={onPreview} className={`${iconButton} text-ink`} aria-label={`Preview ${item.title}`}>
            <Eye className="size-4" />
          </button>
          <button type="button" onClick={onDelete} className={`${iconButton} text-danger hover:bg-danger-soft`} aria-label={`Delete ${item.title}`}>
            <Trash2 className="size-4" />
          </button>
          <MoreMenu
            buttonClassName={`${iconButton} text-ink`}
            items={[
              item.isPublished
                ? { label: 'Unpublish (draft)', icon: CircleDashed, onClick: () => onToggle({ is_published: false }) }
                : { label: 'Publish', icon: CircleCheck, onClick: () => onToggle({ is_published: true }) },
              item.isFeatured
                ? { label: 'Remove from featured', icon: StarOff, onClick: () => onToggle({ is_featured: false }) }
                : { label: 'Mark as featured', icon: Star, onClick: () => onToggle({ is_featured: true }) },
            ]}
          />
        </div>
      </td>
    </tr>
  )
}
