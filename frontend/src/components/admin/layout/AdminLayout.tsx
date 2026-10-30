import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { navBadgesMock, unreadNotificationsMock } from '../../../services/mock/adminSession'
import { CHURCH } from '../../../utils/siteConfig'
import RequireAdmin from '../auth/RequireAdmin'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const DESKTOP_QUERY = '(min-width: 1024px)'

export default function AdminLayout() {
  // Mobile: sidebar is a drawer, closed by default.
  // Desktop: sidebar is docked, and the menu button collapses it.
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  const toggleSidebar = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) setDesktopCollapsed((c) => !c)
    else setMobileOpen(true)
  }

  return (
    <RequireAdmin>
      {(user) => (
        <div className="min-h-screen bg-page">
          <Sidebar
            church={CHURCH}
            badges={navBadgesMock}
            mobileOpen={mobileOpen}
            desktopCollapsed={desktopCollapsed}
            onClose={() => setMobileOpen(false)}
          />
          <div className={`transition-[padding] ${desktopCollapsed ? 'lg:pl-0' : 'lg:pl-sidebar'}`}>
            <Topbar user={user} notificationCount={unreadNotificationsMock} onMenuClick={toggleSidebar} />
            <main className="p-4 sm:px-6 sm:py-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </RequireAdmin>
  )
}
