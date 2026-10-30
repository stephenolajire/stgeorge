import { CalendarDays, Database } from 'lucide-react'
import type { Project } from '../../../types/admin'
import { formatDay } from '../../../utils/newsEvents'
import { formatNaira } from '../../../utils/projects'

/** Target date and amount, e.g. "Dec 31, 2025   ₦25,000,000". */
export default function ProjectFacts({ project, className = '' }: { project: Project; className?: string }) {
  if (!project.targetDate && project.targetAmount == null) return null
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-1.5 ${className}`}>
      {project.targetDate && (
        <span className="flex items-center gap-1.5" title="Target date">
          <CalendarDays className="size-4 shrink-0" /> {formatDay(project.targetDate)}
        </span>
      )}
      {project.targetAmount != null && (
        <span className="flex items-center gap-1.5" title="Target amount">
          <Database className="size-4 shrink-0" /> {formatNaira(project.targetAmount)}
        </span>
      )}
    </div>
  )
}
