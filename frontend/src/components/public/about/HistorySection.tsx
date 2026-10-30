import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { AboutHistory, MediaImage } from '../../../types/admin'
import { CHURCH } from '../../../utils/siteConfig'
import { toParagraphs } from '../../../utils/text'
import Eyebrow from '../Eyebrow'

interface HistorySectionProps extends AboutHistory {
  /** Used when no history image has been uploaded. */
  fallbackImage: MediaImage | null
}

export default function HistorySection({ title, text, image, fallbackImage }: HistorySectionProps) {
  if (!title && !text) return null
  const shown = image ?? fallbackImage

  return (
    <section className="container-public grid items-center gap-8 py-2 lg:grid-cols-[2fr_3fr] lg:gap-8 xl:gap-12">
      <div>
        <Eyebrow>Our History</Eyebrow>
        {title && <h2 className="mt-1.5 font-display text-3xl font-bold text-primary sm:text-[1.9rem]">{title}</h2>}
        <div className="mt-3 space-y-3 text-[0.875rem] leading-[1.55] text-ink-soft">
          {toParagraphs(text).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Link
          to={PUBLIC_PATHS.parishLife}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-accent px-5 text-[0.8125rem] font-semibold text-gold hover:bg-accent/10"
        >
          Our Parish Community <ArrowRight className="size-4" />
        </Link>
      </div>
      {shown && <img src={shown.url} alt={CHURCH.name} className="aspect-[2/1] w-full rounded-lg object-cover shadow-card" />}
    </section>
  )
}
