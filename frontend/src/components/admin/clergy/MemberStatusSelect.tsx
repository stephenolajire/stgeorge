import { ChevronDown } from 'lucide-react'

interface MemberStatusSelectProps {
  isActive: boolean
  onChange: (isActive: boolean) => void
}

/** The "● Active ▾" pill in the panel header. A native select sits on top so it works with keyboard and screen readers. */
export default function MemberStatusSelect({ isActive, onChange }: MemberStatusSelectProps) {
  return (
    <div className="relative flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border border-line">
      <span
        className={`flex items-center gap-2 px-3 text-[0.8125rem] font-medium ${
          isActive ? 'bg-success-soft text-success' : 'bg-neutral-soft text-neutral'
        }`}
      >
        <span className={`size-2 rounded-full ${isActive ? 'bg-success' : 'bg-neutral'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </span>
      <span className="flex w-8 items-center justify-center border-l border-line bg-surface text-ink">
        <ChevronDown className="size-4" />
      </span>
      <select
        aria-label="Status"
        value={isActive ? 'active' : 'inactive'}
        onChange={(e) => onChange(e.target.value === 'active')}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  )
}
