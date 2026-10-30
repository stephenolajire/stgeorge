import { ChevronDown } from 'lucide-react'
import type { StatusOption, Tone } from '../../../types/admin'

interface StatusPillSelectProps {
  value: string
  onChange: (value: string) => void
  options: StatusOption[]
  label?: string
}

const tones: Record<Tone, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-soft text-success', dot: 'bg-success' },
  neutral: { pill: 'bg-neutral-soft text-neutral', dot: 'bg-neutral' },
  info: { pill: 'bg-info-soft text-info', dot: 'bg-info' },
  violet: { pill: 'bg-violet-soft text-violet', dot: 'bg-violet' },
  warning: { pill: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  danger: { pill: 'bg-danger-soft text-danger', dot: 'bg-danger' },
}

/** A "● Published ▾" pill. A native select sits on top so it works with keyboard and screen readers. */
export default function StatusPillSelect({ value, onChange, options, label = 'Status' }: StatusPillSelectProps) {
  const current = options.find((o) => o.value === value) ?? options[0]
  const tone = tones[current.tone]

  return (
    <div className="relative flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border border-line">
      <span className={`flex items-center gap-2 px-3 text-[0.8125rem] font-medium ${tone.pill}`}>
        <span className={`size-2 rounded-full ${tone.dot}`} />
        {current.label}
      </span>
      <span className="flex w-8 items-center justify-center border-l border-line bg-surface text-ink">
        <ChevronDown className="size-4" />
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
