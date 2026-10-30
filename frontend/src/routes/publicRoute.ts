import type { RouteObject } from 'react-router-dom'
import PageLoader from '../components/admin/common/PageLoader'

/** Public website paths. Change one here and the header and links follow. */
export const PUBLIC_PATHS = {
  home: '/',
  about: '/about',
  parishLife: '/parish-life',
  sacraments: '/sacraments',
  newsEvents: '/news-events',
  gallery: '/gallery',
  contact: '/contact',
  massTimes: '/mass-times',
} as const

export const publicNavItems = [
  { label: 'Home', path: PUBLIC_PATHS.home },
  { label: 'About', path: PUBLIC_PATHS.about },
  { label: 'Parish Life', path: PUBLIC_PATHS.parishLife },
  { label: 'Sacraments', path: PUBLIC_PATHS.sacraments },
  { label: 'News & Events', path: PUBLIC_PATHS.newsEvents },
  { label: 'Gallery', path: PUBLIC_PATHS.gallery },
  { label: 'Contact', path: PUBLIC_PATHS.contact },
]

// Pages are lazy-loaded so visitors only download the page they open.
export const publicRoutes: RouteObject = {
  path: '/',
  HydrateFallback: PageLoader,
  lazy: async () => ({ Component: (await import('../components/public/layout/PublicLayout')).default }),
  children: [
    {
      path: PUBLIC_PATHS.about,
      lazy: async () => ({ Component: (await import('../pages/publicpage/About')).default }),
    },
    // Pages not built yet (including Home for now).
    {
      index: true,
      lazy: async () => ({ Component: (await import('../components/public/PublicPlaceholder')).default }),
    },
    {
      path: '*',
      lazy: async () => ({ Component: (await import('../components/public/PublicPlaceholder')).default }),
    },
  ],
}
