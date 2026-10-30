import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import type { AboutMainContent } from '../../../types/admin'
import { CHURCH } from '../../../utils/siteConfig'
import { toParagraphs } from '../../../utils/text'
import Eyebrow from '../Eyebrow'

export default function WhoWeAre({ description, image }: AboutMainContent) {
  const town = CHURCH.location.split(',')[0]

  return (
    <section className="container-public grid items-center gap-8 py-2 lg:grid-cols-2 lg:gap-9 xl:gap-12">
      {image ? (
        <img src={image.url} alt={`Inside ${CHURCH.name}`} className="aspect-[3/2] w-full rounded-lg object-cover shadow-card" />
      ) : (
        <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-mist text-muted">
          <ImageIcon className="size-10" />
        </div>
      )}
      <div>
        <Eyebrow>Who We Are</Eyebrow>
        <h2 className="mt-3 font-display text-3xl leading-tight font-bold text-primary sm:text-[1.9rem]">
          {CHURCH.name}, {town}
        </h2>
        <div className="mt-4 space-y-3 text-[0.875rem] leading-[1.55] text-ink-soft">
          {toParagraphs(description).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {CHURCH.dioceseWebsite && (
          <a
            href={CHURCH.dioceseWebsite}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-[0.8125rem] font-semibold text-white hover:bg-primary-hover"
          >
            Learn More About Our Diocese <ArrowRight className="size-4" />
          </a>
        )}
      </div>
    </section>
  )
}
