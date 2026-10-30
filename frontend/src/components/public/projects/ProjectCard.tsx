import { ArrowRight, FolderKanban } from 'lucide-react'
import type { Project } from '../../../types/admin'
import ProgressBar from '../../admin/projects/ProgressBar'
import ProjectFacts from '../../admin/projects/ProjectFacts'

// Status pill on the photo. Completed is solid blue, the others soft, as in the design.
const PILL: Record<Project['status'], string> = {
  ongoing: 'bg-success-soft text-success',
  completed: 'bg-info text-white',
  upcoming: 'bg-accent-light text-primary',
}

/** Public project card: photo with status, title, summary, progress, target and "View Details". */
export default function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[2.7/1] overflow-hidden bg-mist">
        {project.image ? (
          <img src={project.image} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-primary/25">
            <FolderKanban className="size-10" />
          </div>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-3.5 py-1 text-[0.8125rem] font-medium shadow-card ${PILL[project.status]}`}>{project.statusLabel}</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className="font-display text-lg leading-snug font-bold text-primary">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-[0.9375rem] leading-snug text-ink-soft">{project.shortDescription}</p>
        <div className="mt-auto pt-4">
          <ProgressBar value={project.progress} status={project.status} large />
        </div>
        <ProjectFacts project={project} className="mt-4 text-sm text-ink-soft [&_svg]:text-primary" />
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold text-primary after:absolute after:inset-0 hover:text-gold focus:outline-none"
        >
          View Details <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}
