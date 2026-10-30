import { ArrowRight, Church } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { HomeAbout } from '../../../types/admin'
import { toParagraphs } from '../../../utils/text'
import Eyebrow from '../Eyebrow'

/** "About Our Parish": photo on the left, text and a link to the About page on the right. */
export default function AboutParish({ about }: { about: HomeAbout }) {
  if (!about.title && !about.text) return null
  return (
    <section className="bg-cream">
      <div className="container-public grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[3/2] overflow-hidden rounded-lg bg-mist shadow-card">
          {about.image ? (
            <img src={about.image.url} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-primary/25">
              <Church className="size-16" />
            </div>
          )}
        </div>
        <div>
          <Eyebrow>About Our Parish</Eyebrow>
          <h2 className="mt-3 font-display text-4xl leading-tight font-bold text-primary sm:text-[2.875rem]">{about.title}</h2>
          <div className="mt-5 space-y-3 text-lg leading-relaxed text-ink-soft">
            {toParagraphs(about.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link
            to={PUBLIC_PATHS.about}
            className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-md bg-primary px-7 text-sm font-semibold text-white shadow-card transition hover:bg-primary-hover"
          >
            Learn More About Us <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
