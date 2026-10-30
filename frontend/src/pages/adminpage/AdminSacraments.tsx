import { useIsMutating } from '@tanstack/react-query'
import { LayoutList, Plus, Save, Wine } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import SacramentEditor from '../../components/admin/sacraments/SacramentEditor'
import SacramentPreviewModal from '../../components/admin/sacraments/SacramentPreviewModal'
import SacramentsList, { type SacramentStatusFilter } from '../../components/admin/sacraments/SacramentsList'
import SacramentsPageForm, { SACRAMENTS_PAGE_FORM_ID } from '../../components/admin/sacraments/SacramentsPageForm'
import Tabs from '../../components/admin/common/Tabs'
import {
  useDeleteSacrament,
  useReorderSacraments,
  updateSacramentsPageMutationKey,
  useSacraments,
  useSacramentsPage,
  useSetSacramentPublished,
} from '../../hooks/admin/sacramentsHook'
import type { Sacrament } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'

/** What the right-hand panel shows: a sacrament being edited, or the "add new" form. */
type Selection = { mode: 'edit'; id: number } | { mode: 'new' }

type SacramentsTab = 'list' | 'page'

export default function AdminSacraments() {
  const [tab, setTab] = useState<SacramentsTab>('list')
  const page = useSacramentsPage()
  const savingPage = useIsMutating({ mutationKey: updateSacramentsPageMutationKey }) > 0
  const { data: sacraments = [], isPending, isError, error, refetch } = useSacraments()
  const deleteSacrament = useDeleteSacrament()
  const setPublished = useSetSacramentPublished()
  const reorder = useReorderSacraments()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SacramentStatusFilter>('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [editorVersion, setEditorVersion] = useState(0)
  const [previewing, setPreviewing] = useState<Sacrament | null>(null)
  const [deleting, setDeleting] = useState<Sacrament | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // The list is short, so search and filtering happen here rather than on the server.
  const query = search.trim().toLowerCase()
  const visible = sacraments.filter(
    (s) =>
      (!status || (status === 'published') === s.isPublished) &&
      (!query || s.title.toLowerCase().includes(query) || s.shortDescription.toLowerCase().includes(query)),
  )

  // Until something is chosen, the panel edits the first sacrament (or adds one if there are none).
  const current: Selection = selection ?? (sacraments[0] ? { mode: 'edit', id: sacraments[0].id } : { mode: 'new' })
  const editing = current.mode === 'edit' ? (sacraments.find((s) => s.id === current.id) ?? null) : null

  const openEditor = (next: Selection) => {
    setSelection(next)
    setEditorVersion((v) => v + 1)
    if (window.innerWidth < 1280) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteSacrament.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`${deleting.title} was deleted`)
        if (editing?.id === deleting.id) setSelection(null)
        setDeleting(null)
      },
      onError: (err) => toast.error(getErrorMessage(err, 'Could not delete. Please try again.')),
    })
  }

  const togglePublished = (sacrament: Sacrament) =>
    setPublished.mutate(
      { id: sacrament.id, isPublished: !sacrament.isPublished },
      {
        onSuccess: (saved) => toast.success(`${saved.title} is now ${saved.isPublished ? 'published' : 'a draft'}`),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sacraments"
        subtitle="Manage the sacraments information on your website. Add, edit or reorder sacraments."
        breadcrumb={[{ label: 'Content' }, { label: 'Sacraments' }]}
        actions={
          tab === 'list' ? (
            <Button variant="brand" onClick={() => openEditor({ mode: 'new' })} className="h-10.5 px-5">
              <Plus className="size-4.5" /> Add New Sacrament
            </Button>
          ) : (
            <Button type="submit" form={SACRAMENTS_PAGE_FORM_ID} disabled={savingPage || !page.data}>
              <Save className="size-4" /> {savingPage ? 'Saving...' : 'Save Changes'}
            </Button>
          )
        }
      />

      <Tabs
        label="Sacraments sections"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'list', label: `Sacraments (${sacraments.length})`, icon: Wine },
          { value: 'page', label: 'Page Content', icon: LayoutList },
        ]}
      />

      {tab === 'page' ? (
        page.isPending ? (
          <LoadingCard label="Loading page content..." />
        ) : page.isError ? (
          <ErrorCard message={getErrorMessage(page.error, 'Could not load the page content.')} onRetry={() => page.refetch()} />
        ) : (
          <SacramentsPageForm content={page.data} sacramentCount={sacraments.length} />
        )
      ) : isPending ? (
        <LoadingCard label="Loading sacraments..." />
      ) : isError ? (
        <ErrorCard message={getErrorMessage(error, 'Could not load the sacraments.')} onRetry={() => refetch()} />
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_36rem]">
          <SacramentsList
            total={sacraments.length}
            sacraments={visible}
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            selectedId={editing?.id ?? null}
            onEdit={(s) => openEditor({ mode: 'edit', id: s.id })}
            onView={setPreviewing}
            onDelete={setDeleting}
            onTogglePublished={togglePublished}
            onReorder={(ordered) =>
              reorder.mutate(ordered, { onError: (err) => toast.error(getErrorMessage(err, 'Could not save the new order.')) })
            }
          />
          <div ref={editorRef} className="scroll-mt-20">
            <SacramentEditor
              key={`${editing?.id ?? 'new'}-${editorVersion}`}
              sacrament={editing}
              onSaved={(saved) => openEditor({ mode: 'edit', id: saved.id })}
              onDelete={setDeleting}
              onPreview={setPreviewing}
              onCancel={() => setEditorVersion((v) => v + 1)}
            />
          </div>
        </div>
      )}

      <SacramentPreviewModal
        sacrament={previewing}
        onClose={() => setPreviewing(null)}
        onEdit={(s) => {
          setPreviewing(null)
          openEditor({ mode: 'edit', id: s.id })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete sacrament?"
        message={`${deleting?.title ?? 'This sacrament'} will be removed from the website permanently, including its image.`}
        confirmLabel="Delete Sacrament"
        busy={deleteSacrament.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
