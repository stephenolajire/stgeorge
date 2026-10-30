import { useIsMutating } from '@tanstack/react-query'
import { FolderKanban, LayoutGrid, LayoutList, List, Plus, Save, Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import Pagination from '../../components/admin/common/Pagination'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import Select from '../../components/admin/common/Select'
import Tabs from '../../components/admin/common/Tabs'
import ProjectCard from '../../components/admin/projects/ProjectCard'
import ProjectDetailsModal from '../../components/admin/projects/ProjectDetailsModal'
import ProjectEditor from '../../components/admin/projects/ProjectEditor'
import ProjectRow from '../../components/admin/projects/ProjectRow'
import ProjectsPageForm, { PROJECTS_PAGE_FORM_ID } from '../../components/admin/projects/ProjectsPageForm'
import {
  updateProjectsPageMutationKey,
  useDeleteProject,
  useProjectCategories,
  useProjects,
  useProjectSummary,
  useProjectsPage,
  useSetProjectStatus,
} from '../../hooks/admin/projectsHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { Project, ProjectStatus } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'
import { PROJECT_STATUS, PROJECT_STATUS_OPTIONS, PROJECT_STATUSES } from '../../utils/projects'

type Tab = 'all' | ProjectStatus | 'page'
type Selection = { mode: 'edit'; project: Project } | { mode: 'new' }
const PAGE_SIZE = 8

export default function AdminProjects() {
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [editorVersion, setEditorVersion] = useState(0)
  const [previewing, setPreviewing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const status = tab === 'all' || tab === 'page' ? '' : tab
  const debouncedSearch = useDebouncedValue(search.trim())
  const list = useProjects({ search: debouncedSearch, status, category, page, pageSize: PAGE_SIZE })
  const summary = useProjectSummary().data
  const categories = useProjectCategories().data ?? []
  const pageContent = useProjectsPage()
  const savingPage = useIsMutating({ mutationKey: updateProjectsPageMutationKey }) > 0
  const setStatus = useSetProjectStatus()
  const deleteProject = useDeleteProject()

  const items = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const current: Selection = selection ?? (items[0] ? { mode: 'edit', project: items[0] } : { mode: 'new' })
  const editing = current.mode === 'edit' ? (items.find((p) => p.id === current.project.id) ?? current.project) : null

  const switchTab = (next: Tab) => {
    setTab(next)
    setPage(1)
    setSelection(null)
  }
  const openEditor = (next: Selection) => {
    setSelection(next)
    setEditorVersion((v) => v + 1)
    if (window.innerWidth < 1280) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const changeStatus = (project: Project, next: ProjectStatus) =>
    setStatus.mutate(
      { id: project.id, status: next },
      {
        onSuccess: () => toast.success(`“${project.title}” is now ${PROJECT_STATUS[next].label.toLowerCase()}`),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    )

  const confirmDelete = () => {
    if (!deleting) return
    deleteProject.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`“${deleting.title}” was deleted`)
        if (editing?.id === deleting.id) setSelection(null)
        if (items.length === 1 && page > 1) setPage((p) => p - 1)
        setDeleting(null)
      },
      onError: (e) => toast.error(getErrorMessage(e, 'Could not delete. Please try again.')),
    })
  }

  const itemProps = (project: Project) => ({
    project,
    selected: project.id === editing?.id,
    onEdit: () => openEditor({ mode: 'edit', project }),
    onPreview: () => setPreviewing(project),
    onDelete: () => setDeleting(project),
    onStatus: (next: ProjectStatus) => changeStatus(project, next),
  })

  const tabs = (
    <Tabs
      label="Project tabs"
      value={tab}
      onChange={switchTab}
      items={[
        { value: 'all', label: `All Projects (${summary?.all ?? 0})`, icon: FolderKanban },
        ...PROJECT_STATUSES.map((s) => ({ value: s, label: `${PROJECT_STATUS[s].label} (${summary?.[s] ?? 0})`, dot: PROJECT_STATUS[s].dot })),
        { value: 'page', label: 'Page Content', icon: LayoutList },
      ]}
    />
  )
  const toggle = (mode: 'grid' | 'list') =>
    `flex size-9 items-center justify-center rounded-md border ${view === mode ? 'border-brand bg-brand-soft text-brand' : 'border-field-border text-ink-soft hover:bg-surface-muted'}`

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        subtitle="Manage parish projects and development initiatives. Add, edit or remove projects."
        breadcrumb={[{ label: 'Content' }, { label: 'Projects' }]}
        actions={
          tab === 'page' ? (
            <Button type="submit" form={PROJECTS_PAGE_FORM_ID} disabled={savingPage || !pageContent.data}>
              <Save className="size-4" /> {savingPage ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button variant="brand" onClick={() => openEditor({ mode: 'new' })} className="h-10.5 px-5">
              <Plus className="size-4.5" /> Add New Project
            </Button>
          )
        }
      />

      {tab === 'page' ? (
        <>
          {tabs}
          {pageContent.isPending ? (
            <LoadingCard label="Loading page content..." />
          ) : pageContent.isError ? (
            <ErrorCard message={getErrorMessage(pageContent.error, 'Could not load the page content.')} onRetry={() => pageContent.refetch()} />
          ) : (
            <ProjectsPageForm content={pageContent.data} />
          )}
        </>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <section className="card min-w-0 space-y-4 p-3.5">
            {tabs}
            <div className="flex flex-wrap gap-3">
              <label className="relative min-w-48 flex-1">
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
                  className="form-input h-9 pl-10"
                />
              </label>
              <Select
                aria-label="Filter by category"
                value={category}
                onChange={(v) => {
                  setCategory(v)
                  setPage(1)
                }}
                placeholder="All Categories"
                options={categories}
                className="w-full sm:w-40"
              />
              <Select
                aria-label="Filter by status"
                value={status}
                onChange={(v) => switchTab((v || 'all') as Tab)}
                placeholder="All Status"
                options={PROJECT_STATUS_OPTIONS}
                className="w-full sm:w-36"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view" className={toggle('grid')}>
                  <LayoutGrid className="size-4.5" />
                </button>
                <button type="button" onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view" className={toggle('list')}>
                  <List className="size-4.5" />
                </button>
              </div>
            </div>

            {list.isPending ? (
              <LoadingCard label="Loading projects..." />
            ) : list.isError ? (
              <ErrorCard message={getErrorMessage(list.error, 'Could not load projects.')} onRetry={() => list.refetch()} />
            ) : count === 0 ? (
              <p className="py-16 text-center text-sm text-muted">
                {debouncedSearch || status || category ? 'No projects match these filters.' : 'No projects yet. Add the first one with “Add New Project”.'}
              </p>
            ) : (
              <>
                {view === 'grid' ? (
                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    {items.map((p) => (
                      <ProjectCard key={p.id} {...itemProps(p)} />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-165 text-left">
                      <thead>
                        <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
                          {['Image', 'Project', 'Status', 'Progress', 'Target', 'Actions'].map((h) => (
                            <th key={h} scope="col" className="px-2 py-3 font-semibold whitespace-nowrap first:rounded-l-md last:rounded-r-md">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((p) => (
                          <ProjectRow key={p.id} {...itemProps(p)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <p className="text-sm text-ink-soft">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + items.length} of {count} projects
                  </p>
                  <Pagination page={page} pageCount={Math.ceil(count / PAGE_SIZE)} onChange={setPage} />
                </div>
              </>
            )}
          </section>

          <div ref={editorRef} className="scroll-mt-20">
            {categories.length > 0 && (
              <ProjectEditor
                key={`${editing?.id ?? 'new'}-${editorVersion}`}
                project={editing}
                categories={categories}
                onSaved={(saved) => openEditor({ mode: 'edit', project: saved })}
                onDelete={setDeleting}
                onCancel={() => setEditorVersion((v) => v + 1)}
              />
            )}
          </div>
        </div>
      )}

      <ProjectDetailsModal project={previewing} onClose={() => setPreviewing(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete project?"
        message={`“${deleting?.title ?? ''}” will be removed from the website permanently, including its image.`}
        confirmLabel="Delete"
        busy={deleteProject.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
