import { ArrowRight, Church } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { QuickLink } from '../../../types/admin'
import { LINK_TARGETS } from '../../../utils/homeLinks'

/** Photo card linking to another page, e.g. "Mass Schedule → View Mass Times". */
export default function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <Link to={LINK_TARGETS[link.target].path} className="group flex flex-col rounded-lg bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[2.3/1] overflow-hidden rounded-md bg-mist">
        {link.image ? (
          <img src={link.image} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-primary/25">
            <Church className="size-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <h3 className="font-display text-xl font-bold text-primary">{link.title}</h3>
        <p className="mt-1.5 text-[0.9375rem] leading-snug text-ink-soft">{link.text}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[0.9375rem] font-semibold text-primary group-hover:text-gold">
          {link.linkLabel} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
