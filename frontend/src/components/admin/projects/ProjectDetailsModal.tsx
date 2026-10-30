import type { ReactNode } from 'react'
import type { Project } from '../../../types/admin'
import { PROJECT_STATUS } from '../../../utils/projects'
import { toParagraphs } from '../../../utils/text'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import ProgressBar from './ProgressBar'
import ProjectFacts from './ProjectFacts'

/** A project in full: used for the admin preview and the public "View Details". */
export default function ProjectDetailsModal({ project, onClose, footer }: { project: Project | null; onClose: () => void; footer?: ReactNode }) {
  if (!project) return null
  return (
    <Modal open onClose={onClose} title={project.title} footer={footer}>
      {project.image && <img src={project.image} alt="" className="mb-4 aspect-[2/1] w-full rounded-md object-cover" />}
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <StatusBadge label={project.statusLabel} tone={PROJECT_STATUS[project.status].tone} />
        <StatusBadge label={project.categoryLabel} tone="neutral" />
      </div>
      <div className="mt-4">
        <ProgressBar value={project.progress} status={project.status} large />
      </div>
      <ProjectFacts project={project} className="mt-3 text-sm text-ink-soft" />
      <p className="mt-4 text-sm font-medium text-ink">{project.shortDescription}</p>
      {project.content && (
        <div className="mt-3 max-h-[40vh] space-y-2.5 overflow-y-auto text-sm leading-relaxed text-ink-soft">
          {toParagraphs(project.content).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      )}
    </Modal>
  )
}
