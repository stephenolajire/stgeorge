import { Image as ImageIcon } from 'lucide-react'
import type { Activity } from '../../../types/admin'

export default function ActivityCard({ activity: section, onOpen }: { activity: Activity; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface text-left shadow-card transition hover:shadow-raised focus-visible:outline-2 focus-visible:outline-brand"
    >
      {section.image ? (
        <img src={section.image} alt="" className="aspect-[8/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[8/3] w-full items-center justify-center bg-mist text-gold">
          <ImageIcon className="size-8" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-primary">{section.title}</h3>
        <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-soft">{section.shortDescription}</p>
      </div>
    </button>
  )
}
