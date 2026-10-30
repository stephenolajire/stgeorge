import { Church, User, UserCheck, Users, type LucideIcon } from 'lucide-react'
import type { MemberCounts, MemberTab } from '../../../types/admin'

const TABS: { value: MemberTab; label: string; icon?: LucideIcon; iconClass: string }[] = [
  { value: 'all', label: 'All Members', icon: Users, iconClass: 'text-ink' },
  { value: 'clergy', label: 'Clergy', icon: User, iconClass: 'text-violet' },
  { value: 'religious', label: 'Religious', icon: Church, iconClass: 'text-info' },
  { value: 'staff', label: 'Staff', icon: UserCheck, iconClass: 'text-success' },
  { value: 'inactive', label: 'Inactive', iconClass: 'text-danger' },
]

interface ClergyTabsProps {
  value: MemberTab
  onChange: (tab: MemberTab) => void
  counts?: MemberCounts
}

export default function ClergyTabs({ value, onChange, counts }: ClergyTabsProps) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map(({ value: tab, label, icon: Icon, iconClass }) => {
        const active = tab === value
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-2.5 pt-1 pb-3.5 text-sm whitespace-nowrap transition-colors sm:px-3.5 ${
              active ? 'border-brand font-semibold text-ink' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {Icon ? (
              <Icon className={`size-4.5 ${iconClass}`} strokeWidth={2} />
            ) : (
              <span className="mx-0.5 size-2.5 rounded-full bg-danger" aria-hidden />
            )}
            {label} ({counts?.[tab] ?? 0})
          </button>
        )
      })}
    </div>
  )
}
