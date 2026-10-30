import { Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useRemoveSubscriber, useSubscribers } from '../../../hooks/admin/homeHook'
import type { Subscriber } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import ConfirmDialog from '../common/ConfirmDialog'
import Pagination from '../common/Pagination'
import { ErrorCard, LoadingCard } from '../common/QueryState'

const PAGE_SIZE = 20
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

/** Emails left in the Home page's "Stay Connected" form. */
export default function SubscribersPanel({ search, onSearch }: { search: string; onSearch: (value: string) => void }) {
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Subscriber | null>(null)
  const list = useSubscribers({ search, page })
  const remove = useRemoveSubscriber()
  const items = list.data?.results ?? []
  const count = list.data?.count ?? 0

  return (
    <section className="card space-y-4 p-4">
      <label className="relative block max-w-sm">
        <span className="sr-only">Search subscribers</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          defaultValue={search}
          onChange={(e) => {
            onSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by email..."
          className="form-input h-9 pl-10"
        />
      </label>

      {list.isPending ? (
        <LoadingCard label="Loading subscribers..." />
      ) : list.isError ? (
        <ErrorCard message={getErrorMessage(list.error, 'Could not load subscribers.')} onRetry={() => list.refetch()} />
      ) : count === 0 ? (
        <p className="py-14 text-center text-sm text-muted">
          {search ? 'No subscribers match this search.' : 'No one has signed up yet. Sign-ups from the Home page’s “Stay Connected” form appear here.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
                  <th scope="col" className="w-12 rounded-l-md py-3 text-center font-semibold">#</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Email</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Signed Up</th>
                  <th scope="col" className="rounded-r-md px-2 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s, i) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="py-3 text-center text-ink-soft">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-2 py-3">
                      <a href={`mailto:${s.email}`} className="font-medium text-ink hover:text-brand">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-2 py-3 text-ink-soft">{formatDate(s.createdAt)}</td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleting(s)}
                        aria-label={`Remove ${s.email}`}
                        className="rounded-md p-1.5 text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm text-ink-soft">
              Showing {(page - 1) * PAGE_SIZE + 1} to {(page - 1) * PAGE_SIZE + items.length} of {count} subscribers
            </p>
            <Pagination page={page} pageCount={Math.ceil(count / PAGE_SIZE)} onChange={setPage} />
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove subscriber?"
        message={`${deleting?.email ?? ''} will be removed from the list.`}
        confirmLabel="Remove"
        busy={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Subscriber removed')
              if (items.length === 1 && page > 1) setPage((p) => p - 1)
              setDeleting(null)
            },
            onError: (e) => toast.error(getErrorMessage(e)),
          })
        }
      />
    </section>
  )
}
