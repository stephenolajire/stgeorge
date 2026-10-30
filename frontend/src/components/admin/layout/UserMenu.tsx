import { ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../../hooks/admin/authHook'
import { ADMIN_PATHS } from '../../../routes/adminRoute'
import type { AuthUser } from '../../../types/admin'
import { displayName } from '../../../utils/authUser'
import Avatar from '../common/Avatar'

export default function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { mutate: logout, isPending } = useLogout()
  const name = displayName(user)

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const signOut = () => logout(undefined, { onSettled: () => navigate(ADMIN_PATHS.login, { replace: true }) })

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-surface-muted"
      >
        <Avatar name={name} className="bg-accent text-base font-bold text-ink" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-ink">{name}</span>
          <span className="block text-[0.8125rem] text-muted">Administrator</span>
        </span>
        <ChevronDown className={`ml-4 size-4 text-ink transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-60 rounded-lg border border-line bg-surface py-1.5 shadow-raised">
          <p className="truncate px-4 py-2 text-xs text-muted">{user.email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={isPending}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface-muted disabled:opacity-60"
          >
            <LogOut className="size-4" /> {isPending ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
