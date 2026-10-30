import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import type { Sacrament } from '../../../types/admin'
import { SACRAMENT_ICONS } from '../../../utils/sacramentIcons'

export default function SacramentCard({ sacrament, onLearnMore }: { sacrament: Sacrament; onLearnMore: () => void }) {
  const { icon: Icon, color } = SACRAMENT_ICONS[sacrament.icon]
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="relative">
        {sacrament.image ? (
          <img src={sacrament.image} alt="" className="aspect-[2/1] w-full object-cover" />
        ) : (
          <div className="flex aspect-[2/1] items-center justify-center bg-mist text-muted">
            <ImageIcon className="size-8" />
          </div>
        )}
        <span className="absolute -bottom-6 left-1/2 flex size-13 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent/50 bg-surface shadow-card">
          <Icon className={`size-6.5 ${color}`} strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-4 pt-8 pb-4">
        <h3 className="text-center font-display text-base font-bold text-primary">{sacrament.title}</h3>
        <p className="mt-1.5 flex-1 text-[0.8125rem] leading-snug text-ink-soft">{sacrament.shortDescription}</p>
        <button
          type="button"
          onClick={onLearnMore}
          className="mt-3 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-semibold text-brand hover:text-brand-hover"
        >
          Learn More <ArrowRight className="size-4" />
          <span className="sr-only">about {sacrament.title}</span>
        </button>
      </div>
    </article>
  )
}
