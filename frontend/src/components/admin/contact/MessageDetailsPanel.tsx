import { isAxiosError } from 'axios'
import { Archive, ArchiveRestore, Inbox, Send, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useReplyToMessage, useSetMessageStatus } from '../../../hooks/admin/contactHook'
import type { ContactMessage } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { MESSAGE_STATUS } from '../../../utils/contact'
import { formatShortDate, formatTime } from '../../../utils/format'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import FormField from '../common/FormField'
import StatusBadge from '../common/StatusBadge'
import TextAreaField from '../common/TextAreaField'

interface MessageDetailsPanelProps {
  message: ContactMessage | null
  onClose: () => void
  onDelete: (message: ContactMessage) => void
  onUpdated: (message: ContactMessage) => void
}

/** Right-hand "Message Details" panel with the reply form. Remount it (with a key) to switch message. */
export default function MessageDetailsPanel({ message, onClose, onDelete, onUpdated }: MessageDetailsPanelProps) {
  const [subject, setSubject] = useState(message ? `Re: ${message.subjectLabel}` : '')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const reply = useReplyToMessage()
  const setStatus = useSetMessageStatus()

  if (!message) {
    return (
      <aside className="card flex flex-col items-center px-6 py-16 text-center">
        <Inbox className="size-10 text-muted" strokeWidth={1.5} />
        <p className="mt-3 font-display text-base font-bold text-ink">Message Details</p>
        <p className="mt-1 text-sm text-muted">Click a message to read it and reply.</p>
      </aside>
    )
  }

  const status = MESSAGE_STATUS[message.status]
  const archived = message.status === 'archived'

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return setError('Write a subject and a message.')
    setError('')
    reply.mutate(
      { message, subject, body },
      {
        onSuccess: (saved) => {
          toast.success(`Reply sent to ${message.email}`)
          setBody('')
          onUpdated(saved)
        },
        onError: (err) => {
          const detail = isAxiosError(err) && err.response?.status === 502 ? err.response.data?.detail : null
          toast.error(detail ?? getErrorMessage(err, 'The reply could not be sent.'))
        },
      },
    )
  }

  const toggleArchive = () =>
    setStatus.mutate(
      { id: message.id, status: archived ? 'read' : 'archived' },
      {
        onSuccess: (saved) => {
          toast.success(archived ? 'Moved back to the inbox' : 'Message archived')
          onUpdated(saved)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )

  return (
    <form onSubmit={send} noValidate className="card flex flex-col p-4 pt-3.5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Message Details</h2>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-ink-soft hover:bg-surface-muted" aria-label="Close details">
          <X className="size-5" />
        </button>
      </header>

      <div className="flex items-start gap-3 border-b border-line pb-4">
        <Avatar name={message.name} size="lg" className="bg-info-soft text-base text-info" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.9375rem] font-bold text-ink">{message.name}</p>
          <a href={`mailto:${message.email}`} className="block truncate text-xs text-muted hover:text-brand">
            {message.email}
          </a>
          {message.phone && <p className="text-xs text-muted">{message.phone}</p>}
          <div className="mt-1.5">
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
        </div>
        <p className="shrink-0 text-right text-xs text-muted">
          {formatShortDate(message.createdAt)}
          <br />
          {formatTime(message.createdAt)}
        </p>
      </div>

      <div className="space-y-3 border-b border-line py-4">
        <div>
          <p className="text-sm font-semibold text-ink">Subject</p>
          <p className="text-sm text-ink-soft">{message.subjectLabel}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Message</p>
          <div className="mt-1 max-h-48 overflow-y-auto rounded-md bg-surface-muted px-3.5 py-3 text-[0.8125rem] leading-relaxed whitespace-pre-line text-ink-soft">
            {message.message}
          </div>
        </div>
        {message.replies.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-ink">Replies sent</p>
            <ul className="mt-1 space-y-2">
              {message.replies.map((r) => (
                <li key={r.id} className="rounded-md border-l-2 border-success bg-success-soft/50 px-3 py-2 text-xs">
                  <p className="text-muted">
                    {formatShortDate(r.sentAt)}, {formatTime(r.sentAt)}
                    {r.sentByName && ` · ${r.sentByName}`}
                  </p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-ink-soft">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4">
        <p className="text-sm font-semibold text-ink">Reply to Sender</p>
        <FormField label="To" value={message.email} onChange={() => {}} readOnly inputClassName="bg-surface-muted" />
        <FormField label="Subject" value={subject} onChange={setSubject} maxLength={200} />
        <TextAreaField label="Message" value={body} onChange={setBody} rows={4} maxLength={10000} placeholder="Type your reply here..." />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 [&>button]:px-3.5">
        <Button variant="danger" onClick={() => onDelete(message)}>
          <Trash2 className="size-4" /> Delete
        </Button>
        <Button variant="secondary" onClick={toggleArchive} disabled={setStatus.isPending}>
          {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />} {archived ? 'Unarchive' : 'Archive'}
        </Button>
        <Button type="submit" variant="brand" disabled={reply.isPending} className="ml-auto">
          <Send className="size-4" /> {reply.isPending ? 'Sending...' : 'Send Reply'}
        </Button>
      </div>
    </form>
  )
}
