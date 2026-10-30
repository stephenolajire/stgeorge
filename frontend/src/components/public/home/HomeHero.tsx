import { ArrowRight, CalendarDays, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { HomeHero as HomeHeroContent } from '../../../types/admin'
import { splitHeroTitle } from '../../../utils/homeLinks'
import Eyebrow from '../Eyebrow'

/** The welcome banner: church photo with a light wash on the left for the text, and a quote card. */
export default function HomeHero({ hero }: { hero: HomeHeroContent }) {
  const [title, place] = splitHeroTitle(hero.title)
  return (
    <section className="relative overflow-hidden bg-cream">
      {hero.image && <img src={hero.image.url} alt="" className="absolute inset-0 size-full object-cover object-right" />}
      <div className="absolute inset-0 bg-linear-to-r from-cream via-cream/85 to-transparent sm:via-cream/60 lg:from-cream/95 lg:via-cream/50" />
      <div className="relative container-public flex min-h-[34rem] flex-col justify-center py-14 lg:min-h-[42rem]">
        <div className="max-w-2xl">
          <Eyebrow>Welcome To</Eyebrow>
          <h1 className="mt-3 font-display font-bold text-primary">
            <span className="block max-w-[10.5em] text-[2.5rem] leading-[1.12] sm:text-[3.5rem] lg:text-[4.25rem]">{title}</span>
            {place && <span className="mt-1 block text-[2rem] leading-tight sm:text-[2.75rem]">{place}</span>}
          </h1>
          {hero.tagline && <p className="mt-3 text-lg font-semibold text-primary">{hero.tagline}</p>}
          {hero.text && <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink">{hero.text}</p>}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={PUBLIC_PATHS.parishLife}
              className="inline-flex h-12 items-center gap-2.5 rounded-md bg-primary px-7 text-sm font-semibold text-white shadow-card transition hover:bg-primary-hover"
            >
              Join Our Community <ArrowRight className="size-4" />
            </Link>
            <Link
              to={PUBLIC_PATHS.massTimes}
              className="inline-flex h-12 items-center gap-2.5 rounded-md border-2 border-accent bg-cream/80 px-7 text-sm font-semibold text-primary transition hover:bg-accent/20"
            >
              <CalendarDays className="size-4.5 text-gold" /> Mass Times
            </Link>
          </div>
        </div>
        {hero.quote && (
          <figure className="mt-10 max-w-sm self-end rounded-lg bg-white/85 px-7 py-6 shadow-card backdrop-blur-sm lg:absolute lg:right-[max(1.5rem,calc((100%-var(--container-public))/2+1.5rem))] lg:bottom-12 lg:mt-0">
            <Quote className="absolute top-4 left-3 size-4 rotate-180 fill-accent text-accent" aria-hidden />
            <blockquote className="font-display text-[1.0625rem] leading-relaxed text-primary italic">“{hero.quote}”</blockquote>
            <span className="mt-4 block h-0.5 w-12 bg-accent" aria-hidden />
            <Quote className="absolute right-3 bottom-4 size-4 fill-accent text-accent" aria-hidden />
          </figure>
        )}
      </div>
    </section>
  )
}
