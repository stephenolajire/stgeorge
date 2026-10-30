import { Bell, Menu, Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AuthUser } from '../../../types/admin'
import CountBadge from '../common/CountBadge'
import UserMenu from './UserMenu'

interface TopbarProps {
  user: AuthUser
  notificationCount: number
  onMenuClick: () => void
}

export default function Topbar({ user, notificationCount, onMenuClick }: TopbarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  // Ctrl+K (Cmd+K on Mac) jumps to the search box.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-topbar items-center gap-6 bg-surface px-4 shadow-[0_1px_0_var(--color-line)] sm:px-7">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1 text-ink hover:bg-surface-muted"
        aria-label="Toggle menu"
      >
        <Menu className="size-6" strokeWidth={1.75} />
      </button>

      <label className="flex h-10 w-full max-w-109 items-center gap-3 rounded-lg bg-surface-muted px-4 text-muted focus-within:ring-2 focus-within:ring-brand/30">
        <Search className="size-4.5 shrink-0" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        <kbd className="hidden shrink-0 font-sans text-xs text-ink-soft sm:block">Ctrl&nbsp;&nbsp;K</kbd>
      </label>

      <div className="ml-auto flex items-center gap-4 sm:gap-6">
        <button
          type="button"
          className="relative rounded-full p-2 text-ink hover:bg-surface-muted"
          aria-label={`Notifications (${notificationCount} unread)`}
        >
          <Bell className="size-6" strokeWidth={1.6} />
          <CountBadge count={notificationCount} className="absolute top-0 right-0" />
        </button>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
