import type { ProjectStatus } from '../../../types/admin'
import { PROJECT_STATUS } from '../../../utils/projects'

/** Coloured progress bar with the percentage, e.g. "65%". Used in the admin and on the website. */
export default function ProgressBar({ value, status, large = false }: { value: number; status: ProjectStatus; large?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
        className={`flex-1 overflow-hidden rounded-full bg-line ${large ? 'h-2' : 'h-1.5'}`}
      >
        {/* A sliver shows even at 0% so the colour tells the status. */}
        <div className={`h-full rounded-full ${PROJECT_STATUS[status].bar}`} style={{ width: `${Math.max(value, value === 0 ? 4 : 0)}%` }} />
      </div>
      <span className={`shrink-0 font-semibold text-ink ${large ? 'text-sm' : 'text-xs'}`}>{value}%</span>
    </div>
  )
}
