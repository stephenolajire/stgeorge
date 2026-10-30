import { FolderInput, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { GalleryCategory } from '../../../types/admin'
import { GALLERY_CATEGORIES } from '../../../utils/gallery'
import Button from '../common/Button'
import Select from '../common/Select'

interface BulkBarProps {
  count: number
  allOnPageChecked: boolean
  onToggleAllOnPage: () => void
  onMove: (category: GalleryCategory) => void
  onDelete: () => void
  onClear: () => void
  busy: boolean
}

/** Actions for the ticked photos: move them to a category, or delete them. */
export default function BulkBar(props: BulkBarProps) {
  const [target, setTarget] = useState<GalleryCategory | ''>('')
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand/30 bg-brand-soft px-3.5 py-2.5 text-sm">
      <span className="font-semibold text-ink">{props.count} selected</span>
      <button type="button" onClick={props.onToggleAllOnPage} className="text-[0.8125rem] font-medium text-brand hover:underline">
        {props.allOnPageChecked ? 'Unselect this page' : 'Select all on this page'}
      </button>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select
          aria-label="Move to category"
          value={target}
          onChange={(v) => setTarget(v as GalleryCategory | '')}
          placeholder="Move to…"
          options={GALLERY_CATEGORIES}
          className="w-36"
        />
        <Button variant="secondary" className="h-9 px-3" disabled={!target || props.busy} onClick={() => target && props.onMove(target)}>
          <FolderInput className="size-4" /> Move
        </Button>
        <Button variant="danger" className="h-9 px-3" disabled={props.busy} onClick={props.onDelete}>
          <Trash2 className="size-4" /> Delete
        </Button>
        <button type="button" onClick={props.onClear} className="rounded-md p-1.5 text-ink-soft hover:bg-white/60" aria-label="Clear selection">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
