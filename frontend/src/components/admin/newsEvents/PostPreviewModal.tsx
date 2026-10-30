import { CalendarDays, Clock, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import type { EventItem, NewsItem, PostKind } from '../../../types/admin'
import { formatDay, parishParts, toneFor } from '../../../utils/newsEvents'
import { toParagraphs } from '../../../utils/text'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'

interface PostPreviewModalProps {
  kind: PostKind
  item: EventItem | NewsItem | null
  onClose: () => void
  footer?: ReactNode
}

/** Full event or news post: used for the admin preview and the public "Read More". */
export default function PostPreviewModal({ kind, item, onClose, footer }: PostPreviewModalProps) {
  if (!item) return null
  const when = 'startsAt' in item ? parishParts(item.startsAt) : null
  return (
    <Modal open onClose={onClose} title={item.title} footer={footer}>
      {item.image && <img src={item.image} alt="" className="mb-4 aspect-[2/1] w-full rounded-md object-cover" />}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
        <StatusBadge label={item.categoryLabel} tone={toneFor(kind, item.category)} />
        {when ? (
          <>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {when.dateLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {when.timeLabel}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" /> {formatDay((item as NewsItem).publishedOn)}
          </span>
        )}
      </div>
      {'location' in item && item.location && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="size-4" /> {item.location}
        </p>
      )}
      <p className="mt-3 text-sm font-medium text-ink">{item.shortDescription}</p>
      <div className="mt-3 max-h-[45vh] space-y-2.5 overflow-y-auto text-sm leading-relaxed text-ink-soft">
        {toParagraphs(item.content).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </Modal>
  )
}
