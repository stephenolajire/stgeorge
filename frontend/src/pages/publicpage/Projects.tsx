import { Search } from 'lucide-react'
import { useState } from 'react'
import PageLoader from '../../components/admin/common/PageLoader'
import Pagination from '../../components/admin/common/Pagination'
import ProjectDetailsModal from '../../components/admin/projects/ProjectDetailsModal'
import Eyebrow from '../../components/public/Eyebrow'
import ProjectCard from '../../components/public/projects/ProjectCard'
import { usePublicProjects, usePublicProjectSummary, useProjectsPageContent } from '../../hooks/public/projectsHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Project, ProjectOrdering, ProjectStatus } from '../../types/admin'
import { PROJECT_ORDERING_OPTIONS, PROJECT_STATUS, PROJECT_STATUSES } from '../../utils/projects'

const PAGE_SIZE = 8
// The banner photo fades in from the right.
const FADE_LEFT = 'linear-gradient(to right, transparent, black 60%)'

export default function Projects() {
  usePageTitle('Projects')
  const [status, setStatus] = useState<ProjectStatus | ''>('')
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState<ProjectOrdering>('latest')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<Project | null>(null)
  const debounced = useDebouncedValue(search.trim())

  const content = useProjectsPageContent()
  const summary = usePublicProjectSummary().data
  const list = usePublicProjects({ status, search: debounced, ordering, page, pageSize: PAGE_SIZE })

  if (content.isPending) return <PageLoader />
  if (content.isError) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <p className="text-ink">Sorry, this page could not be loaded.</p>
        <button type="button" onClick={() => content.refetch()} className="mt-4 text-sm font-semibold text-brand hover:underline">
          Try again
        </button>
      </div>
    )
  }

  const { hero } = content.data
  const projects = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const choose = (next: ProjectStatus | '') => {
    setStatus(next)
    setPage(1)
  }
  const chip = (active: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-2.5 rounded-md px-5 text-sm font-medium transition ${
      active ? 'bg-primary text-white shadow-card' : 'text-ink hover:bg-surface-muted'
    }`

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-r from-mist via-mist to-cream">
        {hero.image && (
          <img
            src={hero.image.url}
            alt=""
            className="absolute inset-y-0 right-0 hidden h-full w-3/5 object-cover opacity-45 sm:block"
            style={{ maskImage: FADE_LEFT, WebkitMaskImage: FADE_LEFT }}
          />
        )}
        <div className="relative container-public py-14 lg:py-16">
          <Eyebrow className="text-sm">Our Projects</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-bold text-primary sm:text-[3.25rem]">{hero.title}</h1>
          {hero.subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{hero.subtitle}</p>}
        </div>
      </section>

      <section className="container-public py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filter projects" className="-mx-1 flex gap-1 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
            <div className="flex gap-1 rounded-lg border border-line bg-white p-1 shadow-card">
              <button type="button" aria-pressed={status === ''} onClick={() => choose('')} className={chip(status === '')}>
                All Projects ({summary?.all ?? 0})
              </button>
              {PROJECT_STATUSES.map((s) => (
                <button key={s} type="button" aria-pressed={status === s} onClick={() => choose(s)} className={chip(status === s)}>
                  <span className={`size-2.5 rounded-full ${PROJECT_STATUS[s].dot}`} aria-hidden />
                  {PROJECT_STATUS[s].label} ({summary?.[s] ?? 0})
                </button>
              ))}
            </div>
          </nav>
          <div className="flex gap-3">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search projects..."
                className="form-input h-11 bg-white pl-10"
              />
            </label>
            <label>
              <span className="sr-only">Sort projects</span>
              <select
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value as ProjectOrdering)
                  setPage(1)
                }}
                className="form-input h-11 w-36 bg-white"
              >
                {PROJECT_ORDERING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {list.isPending ? (
          <p className="py-20 text-center text-sm text-ink-soft">Loading projects...</p>
        ) : count === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-line bg-white py-16 text-center text-sm text-ink-soft">
            {debounced ? `No projects match “${debounced}”.` : status ? `No ${PROJECT_STATUS[status].label.toLowerCase()} projects at the moment.` : 'No projects have been added yet.'}
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onOpen={() => setOpen(p)} />
              ))}
            </div>
            {count > PAGE_SIZE && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  page={page}
                  pageCount={Math.ceil(count / PAGE_SIZE)}
                  onChange={(next) => {
                    setPage(next)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </>
        )}
      </section>

      {open && <ProjectDetailsModal project={open} onClose={() => setOpen(null)} />}
    </>
  )
}
