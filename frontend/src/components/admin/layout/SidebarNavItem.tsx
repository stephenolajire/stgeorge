import { NavLink } from 'react-router-dom'
import type { NavItem } from '../../../types/admin'
import CountBadge from '../common/CountBadge'

interface SidebarNavItemProps {
  item: NavItem
  badge?: number
  onNavigate?: () => void
}

export default function SidebarNavItem({ item, badge, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-4 rounded-lg px-4 py-1.5 text-[0.9rem] transition-colors ${
          isActive
            ? 'bg-linear-to-r from-accent to-accent-light font-medium text-sidebar shadow-raised'
            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
        }`
      }
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.6} />
      <span className="flex-1 truncate">{item.label}</span>
      {badge !== undefined && <CountBadge count={badge} />}
    </NavLink>
  )
}
