import { useIsMutating } from '@tanstack/react-query'
import { CalendarDays, LayoutList, Newspaper, Plus, Save, Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import ConfirmDialog from '../../components/admin/common/ConfirmDialog'
import PageHeader from '../../components/admin/common/PageHeader'
import Pagination from '../../components/admin/common/Pagination'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import Select from '../../components/admin/common/Select'
import Tabs from '../../components/admin/common/Tabs'
import NewsEventsPageForm, { NEWS_EVENTS_PAGE_FORM_ID } from '../../components/admin/newsEvents/NewsEventsPageForm'
import PostEditor from '../../components/admin/newsEvents/PostEditor'
import PostPreviewModal from '../../components/admin/newsEvents/PostPreviewModal'
import PostRow from '../../components/admin/newsEvents/PostRow'
import {
  updateNewsEventsPageMutationKey,
  useDeletePost,
  useNewsEventsPage,
  usePostCategories,
  usePosts,
  usePostSummary,
  useSetPostFlags,
} from '../../hooks/admin/newsEventsHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { EventItem, EventWhen, NewsItem, PostKind, PostListParams, PostStatusFilter } from '../../types/admin'
import { getErrorMessage } from '../../utils/apiError'
import { EVENT_WHEN_OPTIONS, STATUS_FILTER_OPTIONS } from '../../utils/newsEvents'

type Section = PostKind | 'page'
type Item = EventItem | NewsItem
type Selection = { mode: 'edit'; item: Item } | { mode: 'new' }
const PAGE_SIZE = 10

export default function AdminNewsEvents() {
  const [section, setSection] = useState<Section>('events')
  const kind: PostKind = section === 'news' ? 'news' : 'events'
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PostStatusFilter>('')
  const [category, setCategory] = useState('')
  const [when, setWhen] = useState<EventWhen>('')
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [editorVersion, setEditorVersion] = useState(0)
  const [previewing, setPreviewing] = useState<Item | null>(null)
  const [deleting, setDeleting] = useState<Item | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebouncedValue(search.trim())
  const params: PostListParams = { search: debouncedSearch, status, category, when: kind === 'events' ? when : '', page, pageSize: PAGE_SIZE }
  const list = usePosts(kind, params)
  const eventCount = usePostSummary('events').data?.all
  const newsCount = usePostSummary('news').data?.all
  const categories = usePostCategories(kind).data ?? []
  const pageContent = useNewsEventsPage()
  const savingPage = useIsMutating({ mutationKey: updateNewsEventsPageMutationKey }) > 0
  const setFlags = useSetPostFlags()
  const deletePost = useDeletePost()

  const items = list.data?.results ?? []
  const count = list.data?.count ?? 0
  const current: Selection = selection ?? (items[0] ? { mode: 'edit', item: items[0] } : { mode: 'new' })
  const editing = current.mode === 'edit' ? (items.find((i) => i.id === current.item.id) ?? current.item) : null

  const switchTo = (next: Section) => {
    setSection(next)
    setSearch('')
    setStatus('')
    setCategory('')
    setWhen('')
    setPage(1)
    setSelection(null)
  }
  const resetting = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }
  const openEditor = (next: Selection) => {
    setSelection(next)
    setEditorVersion((v) => v + 1)
    if (window.innerWidth < 1280) editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const addNew = (target: PostKind) => {
    if (section !== target) switchTo(target)
    openEditor({ mode: 'new' })
  }

  const confirmDelete = () => {
    if (!deleting) return
    deletePost.mutate(
      { kind, id: deleting.id },
      {
        onSuccess: () => {
          toast.success(`“${deleting.title}” was deleted`)
          if (editing?.id === deleting.id) setSelection(null)
          if (items.length === 1 && page > 1) setPage((p) => p - 1)
          setDeleting(null)
        },
        onError: (e) => toast.error(getErrorMessage(e, 'Could not delete. Please try again.')),
      },
    )
  }

  const toggle = (item: Item, flags: { is_published?: boolean; is_featured?: boolean }) =>
    setFlags.mutate(
      { kind, id: item.id, flags },
      {
        onSuccess: () =>
          toast.success(
            'is_published' in flags
              ? `“${item.title}” is now ${flags.is_published ? 'published' : 'a draft'}`
              : flags.is_featured
                ? `“${item.title}” is now featured`
                : `“${item.title}” is no longer featured`,
          ),
        onError: (e) => toast.error(getErrorMessage(e)),
      },
    )

  const noun = kind === 'events' ? 'events' : 'news posts'

  return (
    <div className="space-y-5">
      <PageHeader
        title="News & Events"
        subtitle="Manage the latest news and upcoming events on your website."
        breadcrumb={[{ label: 'Content' }, { label: 'News & Events' }]}
        actions={
          section === 'page' ? (
            <Button type="submit" form={NEWS_EVENTS_PAGE_FORM_ID} disabled={savingPage || !pageContent.data}>
              <Save className="size-4" /> {savingPage ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <>
              <Button variant="brand" onClick={() => addNew('events')} className="h-10.5 px-5">
                <Plus className="size-4.5" /> Add New Event
              </Button>
              <Button variant="outline" onClick={() => addNew('news')} className="h-10.5 px-5">
                <Plus className="size-4.5" /> Add News Post
              </Button>
            </>
          )
        }
      />

      {section === 'page' && (
        <Tabs
          label="News & Events sections"
          value={section}
          onChange={switchTo}
          items={[
            { value: 'events', label: `Events (${eventCount ?? 0})`, icon: CalendarDays },
            { value: 'news', label: `News (${newsCount ?? 0})`, icon: Newspaper },
            { value: 'page', label: 'Page Content', icon: LayoutList },
          ]}
        />
      )}

      {section === 'page' ? (
        pageContent.isPending ? (
          <LoadingCard label="Loading page content..." />
        ) : pageContent.isError ? (
          <ErrorCard message={getErrorMessage(pageContent.error, 'Could not load the page content.')} onRetry={() => pageContent.refetch()} />
        ) : (
          <NewsEventsPageForm content={pageContent.data} />
        )
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_31rem]">
          <section className="card min-w-0 space-y-4 p-3.5">
            <Tabs
              label="News & Events sections"
              value={section}
              onChange={switchTo}
              items={[
                { value: 'events', label: `Events (${eventCount ?? 0})`, icon: CalendarDays },
                { value: 'news', label: `News (${newsCount ?? 0})`, icon: Newspaper },
                { value: 'page', label: 'Page Content', icon: LayoutList },
              ]}
            />
            <div className="flex flex-wrap gap-3">
              <label className="relative min-w-48 flex-1">
                <span className="sr-only">Search {noun}</span>
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => resetting(setSearch)(e.target.value)}
                  placeholder={`Search ${noun}...`}
                  className="form-input h-9 pl-10"
                />
              </label>
              <Select aria-label="Filter by status" value={status} onChange={(v) => resetting(setStatus)(v as PostStatusFilter)} placeholder="All Status" options={STATUS_FILTER_OPTIONS} className="w-full sm:w-30" />
              <Select aria-label="Filter by category" value={category} onChange={resetting(setCategory)} placeholder="All Categories" options={categories} className="w-full sm:w-36" />
              {kind === 'events' && (
                <Select aria-label="Filter by date" value={when} onChange={(v) => resetting(setWhen)(v as EventWhen)} placeholder="All Dates" options={EVENT_WHEN_OPTIONS} className="w-full sm:w-31" />
              )}
            </div>

            {list.isPending ? (
              <LoadingCard label={`Loading ${noun}...`} />
            ) : list.isError ? (
              <ErrorCard message={getErrorMessage(list.error, `Could not load ${noun}.`)} onRetry={() => list.refetch()} />
            ) : count === 0 ? (
              <p className="py-16 text-center text-sm text-muted">
                {debouncedSearch || status || category || when ? `No ${noun} match these filters.` : `No ${noun} yet. Add the first one with “Add ${kind === 'events' ? 'New Event' : 'News Post'}”.`}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-165 text-left">
                    <thead>
                      <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
                        {['#', 'Image', 'Title', kind === 'events' ? 'Date & Time' : 'Date', 'Category', 'Status', 'Actions'].map((h, i) => (
                          <th key={h} scope="col" className={`py-3 font-semibold whitespace-nowrap first:rounded-l-md last:rounded-r-md ${i === 0 ? 'text-center' : 'px-2'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <PostRow
                          key={item.id}
                          kind={kind}
                          item={item}
                          number={(page - 1) * PAGE_SIZE + i + 1}
                          selected={item.id === editing?.id}
                          onEdit={() => openEditor({ mode: 'edit', item })}
                          onPreview={() => setPreviewing(item)}
                          onDelete={() => setDeleting(item)}
                          onToggle={(flags) => toggle(item, flags)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <p className="text-sm text-ink-soft">
                    Showing {(page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + items.length} of {count} {noun}
                  </p>
                  <Pagination page={page} pageCount={Math.ceil(count / PAGE_SIZE)} onChange={setPage} />
                </div>
              </>
            )}
          </section>

          <div ref={editorRef} className="scroll-mt-20">
            {categories.length > 0 && (
              <PostEditor
                key={`${kind}-${editing?.id ?? 'new'}-${editorVersion}`}
                kind={kind}
                item={editing}
                categories={categories}
                onSaved={(saved) => openEditor({ mode: 'edit', item: saved })}
                onDelete={setDeleting}
                onPreview={setPreviewing}
                onCancel={() => setEditorVersion((v) => v + 1)}
              />
            )}
          </div>
        </div>
      )}

      <PostPreviewModal kind={kind} item={previewing} onClose={() => setPreviewing(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={kind === 'events' ? 'Delete event?' : 'Delete news post?'}
        message={`“${deleting?.title ?? ''}” will be removed from the website permanently, including its image.`}
        confirmLabel="Delete"
        busy={deletePost.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
