import { Quote } from 'lucide-react'
import type { SacramentsPageContent } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Eyebrow from '../Eyebrow'

type SacramentsIntroProps = Pick<SacramentsPageContent, 'intro' | 'quote'>

/** "About the Sacraments" text with the quote card beside it. */
export default function SacramentsIntro({ intro, quote }: SacramentsIntroProps) {
  if (!intro.title && !intro.text && !quote.text) return null
  return (
    <section className="container-public grid items-center gap-8 py-8 lg:grid-cols-[1.6fr_1fr] xl:gap-12">
      <div>
        <Eyebrow>About the Sacraments</Eyebrow>
        {intro.title && <h2 className="mt-2 font-display text-3xl leading-tight font-bold text-primary sm:text-[2.25rem]">{intro.title}</h2>}
        <div className="mt-3 space-y-3 text-[0.9375rem] leading-[1.6] text-ink-soft">
          {toParagraphs(intro.text).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </div>
      {quote.text && (
        <figure className="rounded-lg border border-accent/20 bg-cream p-6">
          <div className="flex gap-3">
            <Quote className="size-7 shrink-0 -scale-x-100 fill-accent text-accent" />
            <blockquote className="font-display text-[1.0625rem] leading-relaxed text-ink-soft italic">“{quote.text}”</blockquote>
          </div>
          {quote.source && (
            <figcaption className="mt-4 flex items-center gap-3 pl-10 text-sm text-ink-soft">
              <span className="h-px w-6 bg-gold" aria-hidden /> {quote.source}
            </figcaption>
          )}
        </figure>
      )}
    </section>
  )
}
