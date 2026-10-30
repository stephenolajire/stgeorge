import { useIsMutating } from '@tanstack/react-query'
import { CheckCheck, Download, LayoutList, Mail, Save, Search, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import Pagination from '../../components/admin/common/Pagination'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import Select from '../../components/admin/common/Select'
import Tabs from '../../components/admin/common/Tabs'
import ContactPageForm, { CONTACT_PAGE_FORM_ID } from '../../components/admin/contact/ContactPageForm'
import MessageDetailsPanel from '../../components/admin/contact/MessageDetailsPanel'
import MessageRow from '../../components/admin/contact/MessageRow'
import {
  updateContactPageMutationKey,
  useBulkDeleteMessages,
  useContactPage,
  useDeleteMessage,
  useMarkAllRead,
  useMessageCounts,
  useMessages,
  useSetMessageStatus,
} from '../../hooks/admin/contactHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { contactService } from '../../services/admin/contactService'
import type { ContactMessage, MessageDateFilter, MessageListParams, MessageTab } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'
import { MESSAGE_DATE_OPTIONS } from '../../utils/contact'

const PAGE_SIZE = 10
type Deleting = { kind: 'one'; message: ContactMessage } | { kind: 'many'; ids: number[] }

export default function AdminContactMessages() {
  const [section, setSection] = useState<'messages' | 'page'>('messages')
  const [tab, setTab] = useState<MessageTab>('all')
  const [search, setSearch] = useState('')
  const [date, setDate] = useState<MessageDateFilter>('')
  const [page, setPage] = useState(1)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  // The message in the panel. null = first on the page; 'none' = panel closed.
  const [selected, setSelected] = useState<ContactMessage | null | 'none'>(null)
  const [panelVersion, setPanelVersion] = useState(0)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const [exporting, setExporting] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebouncedValue(search.trim())
  const params: MessageListParams = { tab, search: debouncedSearch, date, page }
  const list = useMessages(params)
  const counts = useMessageCounts().data
  const pageContent = useContactPage()
  const savingPage = useIsMutating({ mutationKey: updateContactPageMutationKey }) > 0
  const setStatus = useSetMessageStatus()
  const deleteOne = useDeleteMessage()
  const bulkDelete = useBulkDeleteMessages()
  const markAllRead = useMarkAllRead()

  const messages = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const current =
    selected === 'none' ? null : selected === null ? (messages[0] ?? null) : (messages.find((m) => m.id === selected.id) ?? selected)

  const resetting = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
    setChecked(new Set())
  }

  const open = (message: ContactMessage) => {
    setSelected(message)
    setPanelVersion((v) => v + 1)
    // Opening an unread message marks it as read.
    if (message.status === 'unread') setStatus.mutate({ id: message.id, status: 'read' }, { onSuccess: setSelected })
    if (window.innerWidth < 1280) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const changeStatus = (message: ContactMessage, status: 'read' | 'unread' | 'archived') =>
    setStatus.mutate(
      { id: message.id, status },
      {
        onSuccess: (saved) => {
          toast.success(status === 'archived' ? 'Message archived' : `Marked as ${status}`)
          if (current?.id === saved.id) setSelected(saved)
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    )

  const allChecked = messages.length > 0 && messages.every((m) => checked.has(m.id))
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(messages.map((m) => m.id)))

  const confirmDelete = () => {
    if (!deleting) return
    const ids = deleting.kind === 'one' ? [deleting.message.id] : deleting.ids
    const done = () => {
      toast.success(ids.length === 1 ? 'Message deleted' : `${ids.length} messages deleted`)
      setChecked((c) => new Set([...c].filter((id) => !ids.includes(id))))
      if (current && ids.includes(current.id)) setSelected(null)
      if (messages.length === ids.length && page > 1) setPage((p) => p - 1)
      setDeleting(null)
    }
    const onError = (e: unknown) => toast.error(getErrorMessage(e, 'Could not delete. Please try again.'))
    if (deleting.kind === 'one') deleteOne.mutate(deleting.message.id, { onSuccess: done, onError })
    else bulkDelete.mutate(ids, { onSuccess: done, onError })
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      await contactService.exportCsv({ tab, search: debouncedSearch, date })
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not export the messages.'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contact Messages"
        subtitle="View and respond to messages sent through your website contact form."
        breadcrumb={[{ label: 'Communication' }, { label: 'Contact Messages' }]}
        actions={
          section === 'messages' ? (
            <>
              <Button
                variant="secondary"
                disabled={!counts?.unread || markAllRead.isPending}
                onClick={() =>
                  markAllRead.mutate(undefined, {
                    onSuccess: ({ updated }) => toast.success(`${updated} ${updated === 1 ? 'message' : 'messages'} marked as read`),
                    onError: (e) => toast.error(getErrorMessage(e)),
                  })
                }
              >
                <CheckCheck className="size-4" /> Mark All as Read
              </Button>
              <Button
                variant="secondary"
                className="px-3 text-danger"
                disabled={!checked.size}
                onClick={() => setDeleting({ kind: 'many', ids: [...checked] })}
                aria-label="Delete selected messages"
                title={checked.size ? `Delete ${checked.size} selected` : 'Tick messages to delete them'}
              >
                <Trash2 className="size-4.5" />
              </Button>
              <Button variant="brand" onClick={exportCsv} disabled={exporting || !count}>
                <Download className="size-4" /> {exporting ? 'Exporting...' : 'Export Messages'}
              </Button>
            </>
          ) : (
            <Button type="submit" form={CONTACT_PAGE_FORM_ID} disabled={savingPage || !pageContent.data}>
              <Save className="size-4" /> {savingPage ? 'Saving...' : 'Save Changes'}
            </Button>
          )
        }
      />

      <Tabs
        label="Contact sections"
        value={section}
        onChange={setSection}
        items={[
          { value: 'messages', label: `Messages (${counts?.all ?? 0})`, icon: Mail },
          { value: 'page', label: 'Contact Page Content', icon: LayoutList },
        ]}
      />

      {section === 'page' ? (
        pageContent.isPending ? (
          <LoadingCard label="Loading page content..." />
        ) : pageContent.isError ? (
          <ErrorCard message={getErrorMessage(pageContent.error, 'Could not load the page content.')} onRetry={() => pageContent.refetch()} />
        ) : (
          <ContactPageForm content={pageContent.data} />
        )
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_23.5rem]">
          <section className="card min-w-0 space-y-4 p-3.5">
            <Tabs
                  compact
                  label="Message status"
                  value={tab}
                  onChange={resetting(setTab)}
                  items={[
                    { value: 'all', label: `All Messages (${counts?.all ?? 0})`, icon: Mail },
                    { value: 'unread', label: `Unread (${counts?.unread ?? 0})` },
                    { value: 'replied', label: `Replied (${counts?.replied ?? 0})` },
                    { value: 'archived', label: `Archived (${counts?.archived ?? 0})` },
                  ]}
                />
            <div className="flex flex-wrap gap-3">
              <label className="relative min-w-52 flex-1">
                <span className="sr-only">Search messages</span>
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => resetting(setSearch)(e.target.value)}
                  placeholder="Search messages..."
                  className="form-input h-9 pl-10"
                />
              </label>
              <Select
                aria-label="Filter by date"
                value={date}
                onChange={(v) => resetting(setDate)(v as MessageDateFilter)}
                placeholder="All Time"
                options={MESSAGE_DATE_OPTIONS}
                className="w-full sm:w-38"
              />
            </div>

            {list.isPending ? (
              <LoadingCard label="Loading messages..." />
            ) : list.isError ? (
              <ErrorCard message={getErrorMessage(list.error, 'Could not load messages.')} onRetry={() => list.refetch()} />
            ) : count === 0 ? (
              <p className="py-16 text-center text-sm text-muted">
                {debouncedSearch || date || tab !== 'all' ? 'No messages match these filters.' : 'No messages yet. Messages sent through the website contact form appear here.'}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-175 text-left">
                    <thead>
                      <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
                        <th scope="col" className="w-10 rounded-l-md px-2 py-3">
                          <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all on this page" className="size-4 accent-brand" />
                        </th>
                        {['Sender', 'Subject', 'Message Preview', 'Date', 'Status', 'Actions'].map((h) => (
                          <th key={h} scope="col" className="px-2 py-3 font-semibold whitespace-nowrap last:rounded-r-md">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <MessageRow
                          key={m.id}
                          message={m}
                          selected={m.id === current?.id}
                          checked={checked.has(m.id)}
                          onOpen={() => open(m)}
                          onCheck={(on) =>
                            setChecked((c) => {
                              const next = new Set(c)
                              if (on) next.add(m.id)
                              else next.delete(m.id)
                              return next
                            })
                          }
                          onSetStatus={(s) => changeStatus(m, s)}
                          onDelete={() => setDeleting({ kind: 'one', message: m })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <p className="text-sm text-ink-soft">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + messages.length} of {count} messages
                  </p>
                  <Pagination page={page} pageCount={Math.ceil(count / PAGE_SIZE)} onChange={setPage} />
                </div>
              </>
            )}
          </section>

          <div ref={panelRef} className="scroll-mt-20 xl:sticky xl:top-22">
            <MessageDetailsPanel
              key={`${current?.id ?? 'none'}-${panelVersion}`}
              message={current}
              onClose={() => setSelected('none')}
              onDelete={(message) => setDeleting({ kind: 'one', message })}
              onUpdated={setSelected}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.kind === 'many' ? `Delete ${deleting.ids.length} messages?` : 'Delete message?'}
        message={
          deleting?.kind === 'one'
            ? `The message from ${deleting.message.name} and its replies will be removed permanently.`
            : 'The selected messages and their replies will be removed permanently.'
        }
        confirmLabel="Delete"
        busy={deleteOne.isPending || bulkDelete.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
