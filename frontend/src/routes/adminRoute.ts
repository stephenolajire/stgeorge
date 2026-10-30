import {
  Archive,
  CalendarDays,
  Clock,
  FileText,
  HandHeart,
  House,
  File,
  Image,
  Info,
  Mail,
  Megaphone,
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
  about: `${ADMIN_BASE}/about`,
  parishLife: `${ADMIN_BASE}/parish-life`,
  sacraments: `${ADMIN_BASE}/sacraments`,
  newsEvents: `${ADMIN_BASE}/news-events`,
  gallery: `${ADMIN_BASE}/gallery`,
  pages: `${ADMIN_BASE}/pages`,
  massTimes: `${ADMIN_BASE}/mass-times`,
  announcements: `${ADMIN_BASE}/announcements`,
  messages: `${ADMIN_BASE}/messages`,
  parishGroups: `${ADMIN_BASE}/parish-groups`,
  ministries: `${ADMIN_BASE}/ministries`,
  clergy: `${ADMIN_BASE}/clergy`,
  settings: `${ADMIN_BASE}/settings`,
  users: `${ADMIN_BASE}/users`,
  parishInfo: `${ADMIN_BASE}/parish-information`,
  media: `${ADMIN_BASE}/media`,
  documents: `${ADMIN_BASE}/documents`,
  backup: `${ADMIN_BASE}/backup`,
} as const

export const adminNavSections: NavSection[] = [
  {
    items: [{ label: 'Dashboard', path: ADMIN_PATHS.dashboard, icon: House, end: true }],
  },
  {
    title: 'Content Management',
    items: [
      { label: 'About', path: ADMIN_PATHS.about, icon: UsersRound },
      { label: 'Parish Life', path: ADMIN_PATHS.parishLife, icon: UsersRound },
      { label: 'Sacraments', path: ADMIN_PATHS.sacraments, icon: Wine },
      { label: 'News & Events', path: ADMIN_PATHS.newsEvents, icon: CalendarDays },
      { label: 'Gallery', path: ADMIN_PATHS.gallery, icon: Image },
      { label: 'Pages', path: ADMIN_PATHS.pages, icon: FileText },
    ],
  },
  {
    title: 'Church Management',
    items: [
      { label: 'Mass Times', path: ADMIN_PATHS.massTimes, icon: Clock },
      { label: 'Parish Groups', path: ADMIN_PATHS.parishGroups, icon: Users },
      { label: 'Ministries', path: ADMIN_PATHS.ministries, icon: HandHeart },
      { label: 'Clergy & Staff', path: ADMIN_PATHS.clergy, icon: User },
      { label: 'Parish Information', path: ADMIN_PATHS.parishInfo, icon: Info },
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
    title: 'Media & Files',
    items: [
      { label: 'Media Library', path: ADMIN_PATHS.media, icon: Image },
      { label: 'Documents', path: ADMIN_PATHS.documents, icon: File },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Site Settings', path: ADMIN_PATHS.settings, icon: Settings },
      { label: 'Users & Roles', path: ADMIN_PATHS.users, icon: Users },
      { label: 'Backup & Restore', path: ADMIN_PATHS.backup, icon: Archive },
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
      path: ADMIN_PATHS.about,
      lazy: async () => ({ Component: (await import('../pages/adminpage/AdminAbout')).default }),
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
