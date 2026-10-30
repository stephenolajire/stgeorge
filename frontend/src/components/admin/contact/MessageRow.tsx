import { Archive, ArchiveRestore, Mail, MailOpen, Trash2 } from 'lucide-react'
import type { ContactMessage } from '../../../types/admin'
import { MESSAGE_STATUS } from '../../../utils/contact'
import { formatShortDate, formatTime } from '../../../utils/format'
import Avatar from '../common/Avatar'
import MoreMenu from '../common/MoreMenu'
import StatusBadge from '../common/StatusBadge'

interface MessageRowProps {
  message: ContactMessage
  selected: boolean
  checked: boolean
  onOpen: () => void
  onCheck: (checked: boolean) => void
  onSetStatus: (status: 'read' | 'unread' | 'archived') => void
  onDelete: () => void
}

export default function MessageRow({ message, selected, checked, onOpen, onCheck, onSetStatus, onDelete }: MessageRowProps) {
  const status = MESSAGE_STATUS[message.status]
  const unread = message.status === 'unread'
  return (
    <tr
      onClick={onOpen}
      className={`cursor-pointer border-b border-line last:border-0 ${selected ? 'bg-brand-soft/60' : 'hover:bg-surface-muted/50'}`}
    >
      <td className="w-10 px-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`Select message from ${message.name}`}
          className="size-4 accent-brand"
        />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-3">
          <Avatar name={message.name} size="sm" className="bg-accent/20 text-ink" />
          <div className="min-w-0">
            <p className={`truncate text-[0.8125rem] text-ink ${unread ? 'font-bold' : 'font-medium'}`}>{message.name}</p>
            <p className="truncate text-xs text-muted">{message.email}</p>
          </div>
        </div>
      </td>
      <td className="px-2">
        <p className="font-display text-[0.8125rem] font-bold text-ink">{message.subjectLabel}</p>
      </td>
      <td className="px-2">
        <p className="line-clamp-2 max-w-44 text-xs leading-snug text-ink-soft">{message.message}</p>
      </td>
      <td className="px-2 text-xs whitespace-nowrap text-ink-soft">
        {formatShortDate(message.createdAt)}
        <br />
        {formatTime(message.createdAt)}
      </td>
      <td className="px-2">
        <StatusBadge label={status.label} tone={status.tone} />
      </td>
      <td className="px-2" onClick={(e) => e.stopPropagation()}>
        <MoreMenu
          label={`Actions for message from ${message.name}`}
          items={[
            unread
              ? { label: 'Mark as read', icon: MailOpen, onClick: () => onSetStatus('read') }
              : { label: 'Mark as unread', icon: Mail, onClick: () => onSetStatus('unread') },
            message.status === 'archived'
              ? { label: 'Move to inbox', icon: ArchiveRestore, onClick: () => onSetStatus('read') }
              : { label: 'Archive', icon: Archive, onClick: () => onSetStatus('archived') },
            { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
          ]}
        />
      </td>
    </tr>
  )
}
