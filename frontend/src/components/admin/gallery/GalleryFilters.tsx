import { LayoutGrid, List, Search } from 'lucide-react'
import type { GalleryCategory, GalleryDateFilter, GallerySort } from '../../../types/admin'
import { DATE_FILTER_OPTIONS, GALLERY_CATEGORIES, SORT_OPTIONS } from '../../../utils/gallery'
import Select from '../common/Select'

export type GalleryView = 'grid' | 'list'

interface GalleryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: GalleryCategory | ''
  onCategoryChange: (value: GalleryCategory | '') => void
  date: GalleryDateFilter
  onDateChange: (value: GalleryDateFilter) => void
  sort: GallerySort
  onSortChange: (value: GallerySort) => void
  view: GalleryView
  onViewChange: (value: GalleryView) => void
}

const viewButton = 'flex size-9 items-center justify-center rounded-md border transition'

export default function GalleryFilters(props: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="relative min-w-52 flex-1">
        <span className="sr-only">Search photos</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Search photos..."
          className="form-input h-9 pl-10"
        />
      </label>
      <Select
        aria-label="Filter by category"
        value={props.category}
        onChange={(v) => props.onCategoryChange(v as GalleryCategory | '')}
        placeholder="All Categories"
        options={GALLERY_CATEGORIES}
        className="w-full sm:w-37"
      />
      <Select
        aria-label="Filter by date"
        value={props.date}
        onChange={(v) => props.onDateChange(v as GalleryDateFilter)}
        placeholder="All Dates"
        options={DATE_FILTER_OPTIONS}
        className="w-full sm:w-33"
      />
      <Select
        aria-label="Sort photos"
        value={props.sort}
        onChange={(v) => props.onSortChange(v as GallerySort)}
        options={SORT_OPTIONS}
        className="w-full sm:w-34"
      />
      <div className="flex gap-2" role="group" aria-label="View">
        <button
          type="button"
          onClick={() => props.onViewChange('grid')}
          aria-pressed={props.view === 'grid'}
          aria-label="Grid view"
          className={`${viewButton} ${props.view === 'grid' ? 'border-brand/40 bg-brand-soft text-brand' : 'border-field-border text-ink-soft hover:bg-surface-muted'}`}
        >
          <LayoutGrid className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={() => props.onViewChange('list')}
          aria-pressed={props.view === 'list'}
          aria-label="List view"
          className={`${viewButton} ${props.view === 'list' ? 'border-brand/40 bg-brand-soft text-brand' : 'border-field-border text-ink-soft hover:bg-surface-muted'}`}
        >
          <List className="size-4.5" />
        </button>
      </div>
    </div>
  )
}
