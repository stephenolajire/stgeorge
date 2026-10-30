import { Users } from 'lucide-react'
import type { ParishGroup } from '../../../types/admin'

export default function GroupCard({ group }: { group: ParishGroup }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      {group.image ? (
        <img src={group.image} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-mist text-gold">
          <Users className="size-10" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-primary">{group.name}</h3>
        <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-soft">{group.description}</p>
      </div>
    </article>
  )
}
