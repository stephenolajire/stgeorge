import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../routes/publicRoute'
import type { MediaImage } from '../../types/admin'

interface PageHeroProps {
  title: string
  subtitle?: string
  image: MediaImage | null
  /** Label for this page in the breadcrumb (Home > …). */
  crumb: string
  /** Optional level between Home and this page, e.g. Gallery. */
  parent?: { label: string; to: string }
}

/** Banner at the top of a public page: image on the right fading into navy on the left. */
export default function PageHero({ title, subtitle, image, crumb, parent }: PageHeroProps) {
  return (
    <section className="relative flex min-h-80 items-center overflow-hidden bg-primary sm:min-h-88 lg:min-h-100">
      {image && <img src={image.url} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />}
      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-primary/0" />
      <div className="container-public relative py-14">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/90">
          <Link to={PUBLIC_PATHS.home} className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          {parent && (
            <>
              <Link to={parent.to} className="hover:text-white">
                {parent.label}
              </Link>
              <ChevronRight className="size-3.5" />
            </>
          )}
          <span className="font-medium text-white">{crumb}</span>
        </nav>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-[2.875rem]">{title}</h1>
        <span className="mt-4 block h-0.5 w-16 bg-accent" />
        {subtitle && <p className="mt-3.5 max-w-sm text-base leading-snug text-white/95">{subtitle}</p>}
      </div>
    </section>
  )
}
