import { Plus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Button from '../common/Button'
import SectionCard from '../common/SectionCard'

interface CardSectionProps {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  count: number
  onAdd: () => void
  /** Shown when there are no cards yet. */
  emptyText: string
  children: ReactNode
}

/** A page section made of cards, with an "Add Card" button. */
export default function CardSection({ id, title, subtitle, icon, count, onAdd, emptyText, children }: CardSectionProps) {
  return (
    <div id={id} className="scroll-mt-20">
      <SectionCard
        title={`${title} (${count})`}
        subtitle={subtitle}
        icon={icon}
        serif
        action={
          <Button variant="outline" onClick={onAdd} className="h-9 shrink-0 px-3.5">
            <Plus className="size-4" /> Add Card
          </Button>
        }
      >
        {count === 0 ? <p className="py-8 text-center text-sm text-muted">{emptyText}</p> : <ul>{children}</ul>}
      </SectionCard>
    </div>
  )
}
