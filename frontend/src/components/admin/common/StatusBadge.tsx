import type { Tone } from '../../../types/admin'
import { toneIcon } from '../../../utils/tone'

interface StatusBadgeProps {
  label: string
  tone?: Tone
}

export default function StatusBadge({ label, tone = 'success' }: StatusBadgeProps) {
  return (
    <span className={`${toneIcon[tone]} inline-flex shrink-0 rounded-md px-2 py-1 text-[0.6875rem] font-medium capitalize`}>
      {label}
    </span>
  )
}
