import { useState } from 'react'
import type { Sacrament } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Modal from '../../admin/common/Modal'
import SacramentCard from './SacramentCard'

interface SacramentsGridProps {
  sacraments: Sacrament[]
  title: string
  subtitle: string
}

export default function SacramentsGrid({ sacraments, title, subtitle }: SacramentsGridProps) {
  const [open, setOpen] = useState<Sacrament | null>(null)
  if (!sacraments.length) return null

  return (
    <section className="container-public py-8">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
          <span className="h-px w-12 bg-gold/60" aria-hidden />
          The {sacraments.length === 7 ? 'Seven ' : ''}Sacraments
          <span className="h-px w-12 bg-gold/60" aria-hidden />
        </p>
        {title && <h2 className="mt-2 font-display text-3xl font-bold text-primary sm:text-[2rem]">{title}</h2>}
        {subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm text-ink-soft">{subtitle}</p>}
      </div>

      {/* Four per row on large screens; a shorter last row is centred. */}
      <ul className="mt-7 flex flex-wrap justify-center gap-4">
        {sacraments.map((sacrament) => (
          <li key={sacrament.id} className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <SacramentCard sacrament={sacrament} onLearnMore={() => setOpen(sacrament)} />
          </li>
        ))}
      </ul>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open?.image && <img src={open.image} alt="" className="mb-4 aspect-[2/1] w-full rounded-md object-cover" />}
        <div className="max-h-[50vh] space-y-3 overflow-y-auto text-sm leading-relaxed text-ink-soft">
          {toParagraphs(open?.content ?? '').map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </section>
  )
}
