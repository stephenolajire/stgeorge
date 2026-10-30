import type { LucideIcon } from 'lucide-react'

export interface TabItem<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  items: TabItem<T>[]
  label: string
  /** Smaller text and spacing, for long rows of tabs. */
  compact?: boolean
}

/** Underlined tabs, like the ones on Clergy & Staff. */
export default function Tabs<T extends string>({ value, onChange, items, label, compact }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {items.map(({ value: tab, label: text, icon: Icon }) => {
        const active = tab === value
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`-mb-px flex shrink-0 items-center border-b-2 pt-1 pb-3 whitespace-nowrap transition-colors ${
              compact ? 'gap-1.5 px-2 text-[0.78rem]' : 'gap-2 px-3.5 text-sm'
            } ${
              active ? 'border-brand font-semibold text-ink' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {Icon && <Icon className={compact ? 'size-4' : 'size-4.5'} />}
            {text}
          </button>
        )
      })}
    </div>
  )
}
