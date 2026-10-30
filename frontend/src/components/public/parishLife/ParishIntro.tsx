import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { ParishLifeIntro } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Eyebrow from '../Eyebrow'

export default function ParishIntro({ intro }: { intro: ParishLifeIntro }) {
  if (!intro.title && !intro.text) return null
  return (
    <section className="container-public grid items-center gap-8 py-8 lg:grid-cols-[1fr_1.1fr] xl:gap-12">
      <div>
        <Eyebrow>Living Our Faith</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-tight font-bold text-primary sm:text-[2.25rem]">{intro.title}</h2>
        <div className="mt-4 space-y-3 text-[0.875rem] leading-[1.6] text-ink-soft">
          {toParagraphs(intro.text).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
        <Link
          to={PUBLIC_PATHS.contact}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-6 text-[0.8125rem] font-semibold text-primary hover:bg-accent-hover"
        >
          Join Our Parish Family <ArrowRight className="size-4" />
        </Link>
      </div>
      {intro.image && (
        <img src={intro.image.url} alt="" className="aspect-[16/10] w-full rounded-lg object-cover shadow-card" />
      )}
    </section>
  )
}
