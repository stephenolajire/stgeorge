import { ClipboardList, Search } from 'lucide-react'
import { useDragReorder } from '../../../hooks/useDragReorder'
import type { Sacrament } from '../../../types/admin'
import Select from '../common/Select'
import SacramentRow from './SacramentRow'

export type SacramentStatusFilter = '' | 'published' | 'draft'

interface SacramentsListProps {
  /** All sacraments, for the count. */
  total: number
  /** The ones matching the search and filter, in page order. */
  sacraments: Sacrament[]
  search: string
  onSearchChange: (value: string) => void
  status: SacramentStatusFilter
  onStatusChange: (value: SacramentStatusFilter) => void
  selectedId: number | null
  onEdit: (sacrament: Sacrament) => void
  onView: (sacrament: Sacrament) => void
  onDelete: (sacrament: Sacrament) => void
  onTogglePublished: (sacrament: Sacrament) => void
  /** Called with the visible sacraments in their new order. */
  onReorder: (sacraments: Sacrament[]) => void
}

const HEADERS = ['', '#', 'Image', 'Title', 'Short Description', 'Status', 'Actions']

export default function SacramentsList(props: SacramentsListProps) {
  const { sacraments } = props
  const drag = useDragReorder(sacraments, props.onReorder)
  const filtering = Boolean(props.search.trim() || props.status)

  return (
    <section className="card min-w-0 p-4 pt-3.5">
      <header className="mb-4 flex items-start gap-3">
        <ClipboardList className="mt-1 size-5.5 shrink-0 text-ink" strokeWidth={1.75} />
        <div>
          <h2 className="font-display text-lg font-bold text-ink">All Sacraments ({props.total})</h2>
          <p className="text-[0.8125rem] text-muted">Drag and drop to reorder the sacraments on the website.</p>
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search sacraments</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search sacraments..."
            className="form-input h-9 pl-10"
          />
        </label>
        <Select
          aria-label="Filter by status"
          value={props.status}
          onChange={(v) => props.onStatusChange(v as SacramentStatusFilter)}
          placeholder="All Status"
          options={[
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
          className="sm:w-27"
        />
      </div>

      {sacraments.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          {filtering ? 'No sacraments match your search.' : 'No sacraments yet. Add the first one with “Add New Sacrament”.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left">
            <thead>
              <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
                {HEADERS.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`py-3 font-semibold whitespace-nowrap first:rounded-l-md last:rounded-r-md ${i === 1 ? 'text-center' : 'px-2'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sacraments.map((sacrament, index) => (
                <SacramentRow
                  key={sacrament.id}
                  sacrament={sacrament}
                  number={index + 1}
                  selected={sacrament.id === props.selectedId}
                  isFirst={index === 0}
                  isLast={index === sacraments.length - 1}
                  dropTarget={drag.isDropTarget(index)}
                  dragProps={drag.rowProps(index)}
                  onEdit={() => props.onEdit(sacrament)}
                  onView={() => props.onView(sacrament)}
                  onDelete={() => props.onDelete(sacrament)}
                  onTogglePublished={() => props.onTogglePublished(sacrament)}
                  onMove={(d) => drag.move(index, index + d)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
