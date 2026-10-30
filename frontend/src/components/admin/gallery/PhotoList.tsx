import { Pencil, Trash2 } from 'lucide-react'
import type { Photo } from '../../../types/admin'
import { formatPhotoDate } from '../../../utils/gallery'
import PhotoCheckbox from './PhotoCheckbox'

interface PhotoListProps {
  photos: Photo[]
  selectedId: number | null
  checked: Set<number>
  onSelect: (photo: Photo) => void
  onCheck: (photo: Photo, checked: boolean) => void
  onDelete: (photo: Photo) => void
}

/** Table view of the photos (the list toggle). */
export default function PhotoList({ photos, selectedId, checked, onSelect, onCheck, onDelete }: PhotoListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-left">
        <thead>
          <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
            {['', 'Photo', 'Title', 'Category', 'Date Taken', 'Tags', ''].map((h, i) => (
              <th key={i} scope="col" className="px-2 py-3 font-semibold whitespace-nowrap first:rounded-l-md last:rounded-r-md">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {photos.map((photo) => (
            <tr
              key={photo.id}
              className={`border-b border-line last:border-0 ${photo.id === selectedId ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'}`}
            >
              <td className="w-9 px-2">
                <PhotoCheckbox
                  checked={checked.has(photo.id)}
                  onChange={(c) => onCheck(photo, c)}
                  label={`Select ${photo.title}`}
                  className="border-field-border"
                />
              </td>
              <td className="w-22 px-2 py-2">
                <button type="button" onClick={() => onSelect(photo)} aria-label={`Show details for ${photo.title}`}>
                  <img src={photo.image} alt="" loading="lazy" className="h-12 w-18 max-w-none rounded-md object-cover" />
                </button>
              </td>
              <td className="px-2">
                <button type="button" onClick={() => onSelect(photo)} className="text-left font-display text-[0.8125rem] font-bold text-ink hover:text-brand">
                  {photo.title}
                </button>
              </td>
              <td className="px-2 text-xs whitespace-nowrap text-ink-soft">{photo.categoryLabel}</td>
              <td className="px-2 text-xs whitespace-nowrap text-ink-soft">{formatPhotoDate(photo.dateTaken)}</td>
              <td className="max-w-48 truncate px-2 text-xs text-muted">{photo.tags}</td>
              <td className="px-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => onSelect(photo)} className="flex size-7 items-center justify-center rounded-md text-ink hover:bg-surface-muted" aria-label={`Edit ${photo.title}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(photo)} className="flex size-7 items-center justify-center rounded-md text-danger hover:bg-danger-soft" aria-label={`Delete ${photo.title}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
