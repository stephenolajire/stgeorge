import { Eye, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { PROJECT_STATUS, PROJECT_STATUSES } from '../../../utils/projects'
import MoreMenu from '../common/MoreMenu'
import StatusBadge from '../common/StatusBadge'
import type { ProjectItemProps } from './ProjectCard'
import ProgressBar from './ProgressBar'
import ProjectFacts from './ProjectFacts'

const iconButton = 'flex size-7 items-center justify-center rounded-md hover:bg-surface-muted'

/** Admin list view row (the alternative to the grid of cards). */
export default function ProjectRow({ project, selected, onEdit, onPreview, onDelete, onStatus }: ProjectItemProps) {
  return (
    <tr className={`border-b border-line last:border-0 ${selected ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'}`}>
      <td className="w-21 px-2 py-2">
        {project.image ? (
          <img src={project.image} alt="" className="h-12 w-16 max-w-none rounded-md object-cover" />
        ) : (
          <span className="flex h-12 w-16 items-center justify-center rounded-md bg-surface-muted text-muted">
            <ImageIcon className="size-5" />
          </span>
        )}
      </td>
      <td className="px-2">
        <button type="button" onClick={onEdit} className="text-left font-display text-[0.8125rem] font-bold text-ink hover:text-brand">
          {project.title}
        </button>
        <p className="text-xs text-muted">{project.categoryLabel}</p>
      </td>
      <td className="px-2">
        <StatusBadge label={project.statusLabel} tone={PROJECT_STATUS[project.status].tone} />
      </td>
      <td className="w-36 px-2">
        <ProgressBar value={project.progress} status={project.status} />
      </td>
      <td className="px-2 text-xs whitespace-nowrap text-ink-soft">
        <ProjectFacts project={project} className="flex-col !items-start" />
      </td>
      <td className="px-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} aria-label={`Edit ${project.title}`} className={`${iconButton} text-ink`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={onPreview} aria-label={`Preview ${project.title}`} className={`${iconButton} text-ink`}>
            <Eye className="size-4" />
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${project.title}`} className={`${iconButton} text-danger`}>
            <Trash2 className="size-4" />
          </button>
          <MoreMenu
            label={`More actions for ${project.title}`}
            items={PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => ({ label: `Mark as ${PROJECT_STATUS[s].label}`, icon: Pencil, onClick: () => onStatus(s) }))}
          />
        </div>
      </td>
    </tr>
  )
}
