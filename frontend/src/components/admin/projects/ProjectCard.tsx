import { EllipsisVertical, Eye, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react'
import type { Project } from '../../../types/admin'
import { PROJECT_STATUS, PROJECT_STATUSES } from '../../../utils/projects'
import MoreMenu from '../common/MoreMenu'
import StatusBadge from '../common/StatusBadge'
import ProgressBar from './ProgressBar'
import ProjectFacts from './ProjectFacts'

export interface ProjectItemProps {
  project: Project
  selected: boolean
  onEdit: () => void
  onPreview: () => void
  onDelete: () => void
  onStatus: (status: Project['status']) => void
}

const action = 'flex h-8 flex-1 items-center justify-center rounded-md border border-line hover:bg-surface-muted'

/** Admin grid card: photo, title, status, progress, target date and amount, and actions. */
export default function ProjectCard({ project, selected, onEdit, onPreview, onDelete, onStatus }: ProjectItemProps) {
  return (
    <article className={`flex flex-col overflow-hidden rounded-lg border bg-surface shadow-card ${selected ? 'border-brand ring-2 ring-brand/20' : 'border-line'}`}>
      <div className="relative aspect-[1.9/1] overflow-hidden bg-surface-muted">
        {project.image ? (
          <img src={project.image} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted">
            <ImageIcon className="size-7" />
          </span>
        )}
        <div className="absolute top-2 right-2">
          <MoreMenu
            label={`Actions for ${project.title}`}
            icon={EllipsisVertical}
            buttonClassName="flex size-7 items-center justify-center rounded-md bg-white text-ink shadow-card hover:bg-surface-muted"
            items={PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => ({
              label: `Mark as ${PROJECT_STATUS[s].label}`,
              icon: Pencil,
              onClick: () => onStatus(s),
            }))}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <button type="button" onClick={onEdit} className="text-left font-display text-[0.875rem] leading-snug font-bold text-ink hover:text-brand">
          {project.title}
        </button>
        <div className="mt-1.5">
          <StatusBadge label={project.statusLabel} tone={PROJECT_STATUS[project.status].tone} />
        </div>
        <div className="mt-2">
          <ProgressBar value={project.progress} status={project.status} />
        </div>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">{project.shortDescription}</p>
        <ProjectFacts project={project} className="mt-auto pt-3 text-[0.6875rem] text-ink-soft" />
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          <button type="button" onClick={onEdit} aria-label={`Edit ${project.title}`} className={`${action} text-ink`}>
            <Pencil className="size-4" />
          </button>
          <button type="button" onClick={onPreview} aria-label={`Preview ${project.title}`} className={`${action} text-ink`}>
            <Eye className="size-4" />
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${project.title}`} className={`${action} text-danger`}>
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
