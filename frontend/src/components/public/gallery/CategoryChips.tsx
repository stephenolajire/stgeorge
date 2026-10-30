import { NavLink } from 'react-router-dom'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { GalleryCategorySummary } from '../../../types/admin'
import { GALLERY_CATEGORIES, categorySlug } from '../../../utils/gallery'

const chip = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[0.8125rem] font-medium transition ${
    isActive ? 'border-accent bg-accent text-primary shadow-card' : 'border-line bg-surface text-ink hover:border-accent/60'
  }`

/** "All" plus one chip per category that has photos. */
export default function CategoryChips({ categories }: { categories: GalleryCategorySummary[] }) {
  return (
    <nav aria-label="Gallery categories" className="-mx-1 flex gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] lg:flex-wrap lg:justify-center">
      <NavLink to={PUBLIC_PATHS.gallery} end className={chip}>
        All
      </NavLink>
      {categories.map((c) => {
        const Icon = GALLERY_CATEGORIES.find((g) => g.value === c.value)?.icon
        return (
          <NavLink key={c.value} to={`${PUBLIC_PATHS.gallery}/${categorySlug(c.value)}`} className={chip}>
            {Icon && <Icon className="size-4.5 text-gold" />}
            {c.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
