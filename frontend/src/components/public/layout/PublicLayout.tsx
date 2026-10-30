import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PublicFooter from './PublicFooter'
import PublicHeader from './PublicHeader'

export default function PublicLayout() {
  const { pathname } = useLocation()

  // Start each page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
