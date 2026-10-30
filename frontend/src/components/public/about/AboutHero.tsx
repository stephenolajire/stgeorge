import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { AboutHero as AboutHeroContent } from '../../../types/admin'

export default function AboutHero({ title, subtitle, image }: AboutHeroContent) {
  return (
    <section className="relative overflow-hidden bg-primary">
      {image && <img src={image.url} alt="" className="absolute inset-0 size-full object-cover object-[70%_center]" />}
      <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-primary/0" />
      <div className="container-public relative pt-14 pb-12 lg:pt-15.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/90">
          <Link to={PUBLIC_PATHS.home} className="hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-white">About</span>
        </nav>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-[2.875rem]">{title}</h1>
        <span className="mt-4 block h-0.5 w-16 bg-accent" />
        <p className="mt-3.5 max-w-sm text-base leading-snug text-white/95">{subtitle}</p>
      </div>
    </section>
  )
}
