import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import ClergyFilters from '../../components/admin/clergy/ClergyFilters'
import ClergyTabs from '../../components/admin/clergy/ClergyTabs'
import MemberEditor from '../../components/admin/clergy/MemberEditor'
import MembersTable from '../../components/admin/clergy/MembersTable'
import MemberViewModal from '../../components/admin/clergy/MemberViewModal'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import Pagination from '../../components/admin/common/Pagination'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import {
  useClergyMembers,
  useClergySummary,
  useDeleteMember,
  useReorderMembers,
  useSetMemberActive,
} from '../../hooks/admin/clergyHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { MEMBERS_PAGE_SIZE } from '../../services/admin/clergyService'
import type { Member, MemberListParams, MemberStatusFilter, MemberTab } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'

/** What the right-hand panel shows: a member being edited, or the "add new" form. */
type Selection = { mode: 'edit'; member: Member } | { mode: 'new' }

export default function AdminClergyStaff() {
  const [tab, setTab] = useState<MemberTab>('all')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<MemberStatusFilter>('')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [editorVersion, setEditorVersion] = useState(0)
  const [viewing, setViewing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebouncedValue(search.trim())
  const params: MemberListParams = {
    category: tab === 'clergy' || tab === 'religious' || tab === 'staff' ? tab : undefined,
    status: tab === 'inactive' ? 'inactive' : status,
    role,
    search: debouncedSearch,
    page,
  }

  const list = useClergyMembers(params)
  const summary = useClergySummary()
  const deleteMember = useDeleteMember()
  const setActive = useSetMemberActive()
  const reorder = useReorderMembers(params)

  const members = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const offset = (page - 1) * MEMBERS_PAGE_SIZE
  const pageCount = Math.ceil(count / MEMBERS_PAGE_SIZE)

  // Until something is chosen, the panel edits the first member on the page.
  const current: Selection = selection ?? (members[0] ? { mode: 'edit', member: members[0] } : { mode: 'new' })
  // Prefer the freshest copy of the member from the list.
  const editingMember =
    current.mode === 'edit' ? (members.find((m) => m.id === current.member.id) ?? current.member) : null

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  const openEditor = (next: Selection) => {
    setSelection(next)
    setEditorVersion((v) => v + 1)
    // On narrow screens the panel is below the table: bring it into view.
    if (window.innerWidth < 1280) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteMember.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(`${deleting.fullName} was deleted`)
        if (editingMember?.id === deleting.id) setSelection(null)
        if (members.length === 1 && page > 1) setPage((p) => p - 1)
        setDeleting(null)
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Could not delete. Please try again.')),
    })
  }

  const toggleActive = (member: Member) =>
    setActive.mutate(
      { id: member.id, isActive: !member.isActive },
      {
        onSuccess: (saved) => toast.success(`${saved.fullName} is now ${saved.isActive ? 'active' : 'inactive'}`),
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )

  const saveOrder = (ordered: Member[]) =>
    reorder.mutate(ordered, { onError: (error) => toast.error(getErrorMessage(error, 'Could not save the new order.')) })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clergy & Staff"
        subtitle="Manage the clergy, priests, religious and staff members of your parish."
        breadcrumb={[{ label: 'Church Management' }, { label: 'Clergy & Staff' }]}
        actions={
          <Button variant="brand" onClick={() => openEditor({ mode: 'new' })} className="h-10.5 px-5">
            <Plus className="size-4.5" /> Add New Member
          </Button>
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_25.75rem]">
        <section className="card min-w-0 p-3 pt-3.5 sm:px-3.5">
          <ClergyTabs value={tab} onChange={resetPage(setTab)} counts={summary.data?.counts} />

          <div className="mt-5 mb-4">
            <ClergyFilters
              search={search}
              onSearchChange={resetPage(setSearch)}
              role={role}
              onRoleChange={resetPage(setRole)}
              status={tab === 'inactive' ? 'inactive' : status}
              onStatusChange={resetPage(setStatus)}
              roles={summary.data?.roles ?? []}
            />
          </div>

          {list.isPending ? (
            <LoadingCard label="Loading members..." />
          ) : list.isError ? (
            <ErrorCard message={getErrorMessage(list.error, 'Could not load members.')} onRetry={() => list.refetch()} />
          ) : count === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              {debouncedSearch || role || status || tab !== 'all' ? 'No members match these filters.' : 'No members yet. Add the first one.'}
            </p>
          ) : (
            <>
              <MembersTable
                members={members}
                offset={offset}
                selectedId={editingMember?.id ?? null}
                onEdit={(member) => openEditor({ mode: 'edit', member })}
                onView={setViewing}
                onDelete={setDeleting}
                onToggleActive={toggleActive}
                onReorder={saveOrder}
              />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
                <p className="text-sm text-ink-soft">
                  Showing {offset + 1} to {offset + members.length} of {count} members
                </p>
                <Pagination page={page} pageCount={pageCount} onChange={setPage} />
              </div>
            </>
          )}
        </section>

        <div ref={editorRef} className="scroll-mt-20">
          <MemberEditor
            key={`${editingMember?.id ?? 'new'}-${editorVersion}`}
            member={editingMember}
            roles={summary.data?.roles ?? []}
            onSaved={(saved) => openEditor({ mode: 'edit', member: saved })}
            onDelete={setDeleting}
            onCancel={() => setEditorVersion((v) => v + 1)}
          />
        </div>
      </div>

      <MemberViewModal
        member={viewing}
        onClose={() => setViewing(null)}
        onEdit={(member) => {
          setViewing(null)
          openEditor({ mode: 'edit', member })
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete member?"
        message={`${deleting?.fullName ?? 'This member'} will be removed permanently, including their photo.`}
        confirmLabel="Delete Member"
        busy={deleteMember.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
