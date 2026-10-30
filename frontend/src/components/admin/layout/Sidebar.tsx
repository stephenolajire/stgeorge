import { X } from 'lucide-react'
import { adminNavSections } from '../../../routes/adminRoute'
import type { ChurchInfo, NavBadges } from '../../../types/admin'
import SidebarBrand from './SidebarBrand'
import SidebarNavItem from './SidebarNavItem'

interface SidebarProps {
  church: ChurchInfo
  badges: NavBadges
  mobileOpen: boolean
  desktopCollapsed: boolean
  onClose: () => void
}

export default function Sidebar({ church, badges, mobileOpen, desktopCollapsed, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-sidebar-deep/50 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col bg-linear-to-b from-sidebar to-sidebar-deep transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${desktopCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}
      >
        <div className="relative">
          <SidebarBrand church={church} />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-sidebar-muted hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {adminNavSections.map((section, i) => (
            <div key={section.title ?? i} className="border-t border-sidebar-border py-2.5 first:pt-2.5">
              {section.title && (
                <p className="mt-1 mb-1 px-4 text-xs font-medium tracking-wide text-sidebar-muted uppercase">
                  {section.title}
                </p>
              )}
              <ul>
                {section.items.map((item) => (
                  <li key={item.path}>
                    <SidebarNavItem
                      item={item}
                      badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                      onNavigate={onClose}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
