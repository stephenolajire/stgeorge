import { Mail } from 'lucide-react'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { RecentMessage } from '../../../types/admin'
import { formatRelative } from '../../../utils/format'
import Avatar from '../common/Avatar'
import { SectionHeader } from '../common/SectionCard'

export default function RecentMessages({ messages }: { messages: RecentMessage[] }) {
  return (
    <div className="border-t border-line pt-2">
      <SectionHeader title="Recent Messages" icon={Mail} viewAllPath={ADMIN_PATHS.messages} />
      <ul className="-mt-1.5 divide-y divide-line">
        {messages.map((message) => (
          <li key={message.id} className="flex items-center gap-4 py-1.25">
            <Avatar
              name={message.senderName}
              size="sm"
              className={message.isRead ? 'bg-surface-muted text-muted' : 'bg-accent/25 text-ink'}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{message.senderName}</p>
              <p className="truncate text-xs text-muted">{message.subject}</p>
            </div>
            <span className="shrink-0 text-[0.8125rem] text-muted">{formatRelative(message.receivedAt)}</span>
            <span
              className={`ml-3 size-2 shrink-0 rounded-full ${message.isRead ? 'bg-muted/60' : 'bg-brand'}`}
              aria-label={message.isRead ? 'Read' : 'Unread'}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
