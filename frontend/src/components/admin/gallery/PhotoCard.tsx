import { CalendarDays, EllipsisVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { Photo } from '../../../types/admin'
import { formatPhotoDate } from '../../../utils/gallery'
import MoreMenu from '../common/MoreMenu'
import PhotoCheckbox from './PhotoCheckbox'

interface PhotoCardProps {
  photo: Photo
  selected: boolean
  checked: boolean
  onSelect: () => void
  onCheck: (checked: boolean) => void
  onDelete: () => void
}

export default function PhotoCard({ photo, selected, checked, onSelect, onCheck, onDelete }: PhotoCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-lg border bg-surface shadow-card transition ${
        selected ? 'border-brand ring-2 ring-brand/70' : 'border-line hover:shadow-raised'
      }`}
    >
      <div className="relative">
        <button type="button" onClick={onSelect} className="block w-full" aria-label={`Show details for ${photo.title}`}>
          <img src={photo.image} alt={photo.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
        </button>
        <PhotoCheckbox checked={checked} onChange={onCheck} label={`Select ${photo.title}`} className="absolute top-2.5 left-2.5" />
      </div>
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-3">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <p className="truncate font-display text-[0.8125rem] font-bold text-ink">{photo.title}</p>
          <p className="mt-0.5 text-xs text-muted">{photo.categoryLabel}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays className="size-3.5" /> {formatPhotoDate(photo.dateTaken)}
          </p>
        </button>
        <MoreMenu
          label={`Actions for ${photo.title}`}
          icon={EllipsisVertical}
          buttonClassName="flex size-7 shrink-0 items-center justify-center rounded-md text-ink hover:bg-surface-muted"
          items={[
            { label: 'Edit details', icon: Pencil, onClick: onSelect },
            { label: 'Open full size', icon: ExternalLink, onClick: () => window.open(photo.image, '_blank', 'noopener') },
            { label: 'Delete photo', icon: Trash2, onClick: onDelete, danger: true },
          ]}
        />
      </div>
    </article>
  )
}
