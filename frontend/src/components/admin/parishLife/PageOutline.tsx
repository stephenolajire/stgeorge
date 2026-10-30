import { ExternalLink, ListTree } from 'lucide-react'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import SectionCard from '../common/SectionCard'

export interface OutlineItem {
  id: string
  label: string
  /** e.g. "5 cards"; omitted for text sections. */
  note?: string
}

/** Right-hand list of the page's sections, in the order they appear on the website. Click to jump. */
export default function PageOutline({ items, publicPath = PUBLIC_PATHS.parishLife }: { items: OutlineItem[]; publicPath?: string }) {
  return (
    <SectionCard title="Page Sections" subtitle="In the order they appear on the website." icon={ListTree} serif>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-ink hover:bg-surface-muted"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                {i + 1}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.note && <span className="text-xs text-muted">{item.note}</span>}
            </a>
          </li>
        ))}
      </ol>
      <a
        href={publicPath}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-md border border-field-border py-2 text-[0.8125rem] font-medium text-ink hover:bg-surface-muted"
      >
        View Public Page <ExternalLink className="size-3.5" />
      </a>
    </SectionCard>
  )
}
