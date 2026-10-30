import { CalendarDays, Church, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { PUBLIC_PATHS, publicNavItems } from '../../../routes/publicRoute'
import { CHURCH } from '../../../utils/siteConfig'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 text-[0.8125rem] whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full ${
    isActive ? 'font-semibold text-primary after:bg-accent' : 'text-ink-soft after:bg-transparent hover:text-primary'
  }`

export default function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-surface shadow-[0_1px_0_var(--color-line)]">
      <div className="container-public flex h-17 items-center gap-5">
        <Link to={PUBLIC_PATHS.home} className="flex shrink-0 items-center gap-3">
          {CHURCH.logoUrl ? (
            <img src={CHURCH.logoUrl} alt="" className="size-14 rounded-full object-contain" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full border-[3px] border-success bg-white text-danger">
              <Church className="size-6" />
            </span>
          )}
          <span className="leading-tight">
            <span className="block text-[0.6875rem] text-ink-soft">{CHURCH.diocese}</span>
            <span className="block font-display text-[0.9375rem] font-bold text-primary">{CHURCH.name}</span>
            <span className="block text-xs text-ink-soft">{CHURCH.location}.</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-4 lg:flex xl:gap-6">
          {publicNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} end className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to={PUBLIC_PATHS.massTimes}
          className="ml-auto hidden h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold whitespace-nowrap text-white hover:bg-primary-hover sm:inline-flex lg:ml-1"
        >
          <CalendarDays className="size-4" /> Mass Times
        </Link>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto rounded-md p-2 text-primary sm:ml-0 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Main" className="border-t border-line bg-surface px-5 pb-4 lg:hidden">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block border-b border-line py-3 text-sm ${isActive ? 'font-semibold text-primary' : 'text-ink-soft'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={PUBLIC_PATHS.massTimes}
            onClick={() => setOpen(false)}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white"
          >
            <CalendarDays className="size-4" /> Mass Times
          </Link>
        </nav>
      )}
    </header>
  )
}
