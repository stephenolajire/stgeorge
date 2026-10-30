import type { OverviewRange } from '../../../types/admin'
import { RANGE_OPTIONS } from '../../../utils/overviewRange'

interface RangeSelectProps {
  value: OverviewRange
  onChange: (value: OverviewRange) => void
}

export default function RangeSelect({ value, onChange }: RangeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OverviewRange)}
      aria-label="Date range"
      className="rounded-lg border border-[#e3e7ef] bg-surface py-2 pr-2 pl-3 text-[0.8125rem] text-ink outline-none focus:ring-2 focus:ring-brand/30"
    >
      {RANGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
