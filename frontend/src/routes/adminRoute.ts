import {
  CalendarDays,
  Clock,
  FolderKanban,
  House,
  Image,
  Mail,
  Megaphone,
  PanelsTopLeft,
  Settings,
  User,
  Users,
  UsersRound,
  Wine,
} from 'lucide-react'
import type { RouteObject } from 'react-router-dom'
import PageLoader from '../components/admin/common/PageLoader'
import type { NavSection } from '../types/admin'

/** Change a path here and the router, sidebar and quick actions all follow. */
export const ADMIN_BASE = '/admin'

export const ADMIN_PATHS = {
  dashboard: ADMIN_BASE,
  login: `${ADMIN_BASE}/login`,
  home: `${ADMIN_BASE}/home`,
  about: `${ADMIN_BASE}/about`,
  parishLife: `${ADMIN_BASE}/parish-life`,
  sacraments: `${ADMIN_BASE}/sacraments`,
  newsEvents: `${ADMIN_BASE}/news-events`,
  gallery: `${ADMIN_BASE}/gallery`,
  projects: `${ADMIN_BASE}/projects`,
  massTimes: `${ADMIN_BASE}/mass-times`,
  announcements: `${ADMIN_BASE}/announcements`,
  messages: `${ADMIN_BASE}/messages`,
  clergy: `${ADMIN_BASE}/clergy`,
  settings: `${ADMIN_BASE}/settings`,
  users: `${ADMIN_BASE}/users`,
} as const

export const adminNavSections: NavSection[] = [
  {
    items: [{ label: 'Dashboard', path: ADMIN_PATHS.dashboard, icon: House, end: true }],
  },
  {
    title: 'Content Management',
    items: [
      { label: 'Home Page', path: ADMIN_PATHS.home, icon: PanelsTopLeft },
      { label: 'About', path: ADMIN_PATHS.about, icon: UsersRound },
      { label: 'Parish Life', path: ADMIN_PATHS.parishLife, icon: UsersRound },
      { label: 'Sacraments', path: ADMIN_PATHS.sacraments, icon: Wine },
      { label: 'News & Events', path: ADMIN_PATHS.newsEvents, icon: CalendarDays },
      { label: 'Gallery', path: ADMIN_PATHS.gallery, icon: Image },
      { label: 'Projects', path: ADMIN_PATHS.projects, icon: FolderKanban },
    ],
  },
  {
    title: 'Church Management',
    items: [
      { label: 'Mass Times', path: ADMIN_PATHS.massTimes, icon: Clock },
      { label: 'Clergy & Staff', path: ADMIN_PATHS.clergy, icon: User },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', path: ADMIN_PATHS.announcements, icon: Megaphone },
      { label: 'Contact Messages', path: ADMIN_PATHS.messages, icon: Mail, badgeKey: 'unreadMessages' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Site Settings', path: ADMIN_PATHS.settings, icon: Settings },
      { label: 'Users & Roles', path: ADMIN_PATHS.users, icon: Users },
    ],
  },
]

/** The login page sits outside the admin layout (no sidebar). */
export const adminLoginRoute: RouteObject = {
  path: ADMIN_PATHS.login,
  HydrateFallback: PageLoader,
  lazy: async () => ({ Component: (await import('../pages/adminpage/AdminLogin')).default }),
}

// Components are lazy-loaded: keeps each page in its own chunk, and avoids an
// import cycle (pages and the sidebar import paths from this file).
export const adminRoutes: RouteObject = {
  path: ADMIN_BASE,
  HydrateFallback: PageLoader,
  lazy: async () => ({ Component: (await import('../components/admin/layout/AdminLayout')).default }),
  children: [
    {
      index: true,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminDashboard')).default }),
    },
    {
      path: ADMIN_PATHS.home,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminHome')).default }),
    },
    {
      path: ADMIN_PATHS.about,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminAbout')).default }),
    },
    {
      path: ADMIN_PATHS.parishLife,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminParishLife')).default }),
    },
    {
      path: ADMIN_PATHS.sacraments,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminSacraments')).default }),
    },
    {
      path: ADMIN_PATHS.gallery,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminGallery')).default }),
    },
    {
      path: ADMIN_PATHS.projects,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminProjects')).default }),
    },
    {
      path: ADMIN_PATHS.newsEvents,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminNewsEvents')).default }),
    },
    {
      path: ADMIN_PATHS.messages,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminContactMessages')).default }),
    },
    {
      path: ADMIN_PATHS.clergy,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminClergyStaff')).default }),
    },
    
    {
      path: '*',
      lazy: async () => ({ Component: (await import('../components/admin/common/AdminPlaceholder')).default }),
    },
  ],
}
