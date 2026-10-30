import { useEffect } from 'react'
import { analyticsService } from '../../services/public/analyticsService'

// The last page reported, so the same view is not counted twice (React runs effects twice in development).
let last = { path: '', at: 0 }

/**
 * Counts a view of each public page for the admin dashboard. The server keeps no IP address or
 * cookie: it stores a code that changes daily, so visitors cannot be traced.
 */
export function useTrackVisit(pathname: string) {
  useEffect(() => {
    const now = Date.now()
    if (last.path === pathname && now - last.at < 1000) return
    last = { path: pathname, at: now }
    analyticsService.recordVisit(pathname)
  }, [pathname])
}
