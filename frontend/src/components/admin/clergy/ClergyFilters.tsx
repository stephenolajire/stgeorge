import { Search } from 'lucide-react'
import type { MemberStatusFilter, RoleOption } from '../../../types/admin'
import Select from '../common/Select'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

interface ClergyFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
  status: MemberStatusFilter
  onStatusChange: (value: MemberStatusFilter) => void
  roles: RoleOption[]
}

export default function ClergyFilters(props: ClergyFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search clergy or staff</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Search clergy or staff..."
          className="form-input h-9 pl-10"
        />
      </label>
      <Select
        aria-label="Filter by role"
        value={props.role}
        onChange={props.onRoleChange}
        placeholder="All Roles"
        options={props.roles}
        className="sm:w-34"
      />
      <Select
        aria-label="Filter by status"
        value={props.status}
        onChange={(v) => props.onStatusChange(v as MemberStatusFilter)}
        placeholder="All Status"
        options={STATUS_OPTIONS}
        className="sm:w-44"
      />
    </div>
  )
}
